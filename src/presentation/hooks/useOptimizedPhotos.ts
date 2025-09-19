import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Photo } from '../../domain/entities/Photo';
import { PhotoRepository } from '../../domain/repositories/PhotoRepository';
import { 
  useMemoizedData, 
  useOptimizedSearch, 
  useBatchOperations,
  useExpensiveCalculation,
  useImageCache,
  useDebouncedCallback,
  useThrottledCallback
} from './usePerformance';
import { useErrorHandler } from './useErrorHandler';
import { performanceUtils } from '../../utils/helpers';

interface UseOptimizedPhotosOptions {
  pageSize?: number;
  cacheSize?: number;
  searchDebounceMs?: number;
  autoRefreshInterval?: number;
  enableImageCache?: boolean;
  enableBatchOperations?: boolean;
  preloadNextPage?: boolean;
}

interface PhotosState {
  photos: Photo[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  totalCount: number;
  lastRefresh: Date | null;
}

interface PhotoFilters {
  searchQuery: string;
  dateRange?: { start: Date; end: Date };
  location?: { latitude: number; longitude: number; radius: number };
  tags?: string[];
  sortBy: 'date' | 'name' | 'size' | 'location';
  sortOrder: 'asc' | 'desc';
}

export const useOptimizedPhotos = (
  repository: PhotoRepository,
  options: UseOptimizedPhotosOptions = {}
) => {
  const {
    pageSize = 20,
    cacheSize = 100,
    searchDebounceMs = 300,
    autoRefreshInterval = 30000,
    enableImageCache = true,
    enableBatchOperations = true,
    preloadNextPage = true,
  } = options;

  // Estado principal
  const [state, setState] = useState<PhotosState>({
    photos: [],
    loading: false,
    error: null,
    hasMore: true,
    currentPage: 0,
    totalCount: 0,
    lastRefresh: null,
  });

  // Filtros
  const [filters, setFilters] = useState<PhotoFilters>({
    searchQuery: '',
    sortBy: 'date',
    sortOrder: 'desc',
  });

  // Refs para controle
  const abortControllerRef = useRef<AbortController | null>(null);
  const loadingRef = useRef(false);
  const cacheRef = useRef(new Map<string, Photo[]>());

  // Hooks de performance
  const { reportError } = useErrorHandler();
  const imageCache = enableImageCache ? useImageCache(cacheSize) : null;
  const { addToQueue, setProcessor } = enableBatchOperations 
    ? useBatchOperations<() => Promise<void>>(5, 100) 
    : { addToQueue: null, setProcessor: null };

  // Configurar processador de batch
  useEffect(() => {
    if (setProcessor) {
      setProcessor(async (batch) => {
        for (const operation of batch) {
          await operation();
        }
      });
    }
  }, [setProcessor]);

  // Cache de fotos memoizado
  const memoizedPhotos = useMemoizedData(
    state.photos,
    [state.photos.length, state.photos.map(p => p.id).join(',')],
    (prev, next) => {
      if (prev.length !== next.length) return false;
      return prev.every((photo, index) => photo.id === next[index]?.id);
    }
  );

  // Busca otimizada
  const { filteredItems: searchResults, isSearching } = useOptimizedSearch(
    memoizedPhotos,
    (photo, query) => {
      const searchText = query.toLowerCase();
      return (
        photo.title.toLowerCase().includes(searchText) ||
        photo.description?.toLowerCase().includes(searchText) ||
        photo.tags?.some(tag => tag.toLowerCase().includes(searchText))
      );
    },
    searchDebounceMs
  );

  // Fotos filtradas e ordenadas (cálculo pesado memoizado)
  const processedPhotos = useExpensiveCalculation(() => {
    let result = filters.searchQuery ? searchResults : memoizedPhotos;

    // Aplicar filtros de data
    if (filters.dateRange) {
      result = result.filter(photo => {
        const photoDate = new Date(photo.createdAt);
        return photoDate >= filters.dateRange!.start && photoDate <= filters.dateRange!.end;
      });
    }

    // Aplicar filtros de localização
    if (filters.location) {
      result = result.filter(photo => {
        if (!photo.location) return false;
        const distance = performanceUtils.calculateDistance(
          photo.location.latitude,
          photo.location.longitude,
          filters.location!.latitude,
          filters.location!.longitude
        );
        return distance <= filters.location!.radius;
      });
    }

    // Aplicar filtros de tags
    if (filters.tags && filters.tags.length > 0) {
      result = result.filter(photo => 
        photo.tags?.some(tag => filters.tags!.includes(tag))
      );
    }

    // Ordenação
    result = [...result].sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'size':
          comparison = (a.fileSize || 0) - (b.fileSize || 0);
          break;
        case 'location':
          if (!a.location && !b.location) comparison = 0;
          else if (!a.location) comparison = 1;
          else if (!b.location) comparison = -1;
          else comparison = a.location.latitude - b.location.latitude;
          break;
      }
      
      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [
    searchResults,
    memoizedPhotos,
    filters.searchQuery,
    filters.dateRange,
    filters.location,
    filters.tags,
    filters.sortBy,
    filters.sortOrder,
  ], 'processedPhotos');

  // Função para carregar fotos com cache
  const loadPhotos = useCallback(async (
    page: number = 0,
    append: boolean = false,
    useCache: boolean = true
  ) => {
    if (loadingRef.current) return;
    
    const cacheKey = `photos-${page}-${JSON.stringify(filters)}`;
    
    // Verificar cache primeiro
    if (useCache && cacheRef.current.has(cacheKey)) {
      const cachedPhotos = cacheRef.current.get(cacheKey)!;
      setState(prev => ({
        ...prev,
        photos: append ? [...prev.photos, ...cachedPhotos] : cachedPhotos,
        currentPage: page,
        loading: false,
      }));
      return;
    }

    loadingRef.current = true;
    setState(prev => ({ ...prev, loading: true, error: null }));

    // Cancelar requisição anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const result = await repository.getPhotos({
        page,
        limit: pageSize,
        signal: abortControllerRef.current.signal,
      });

      const newPhotos = result.photos;
      
      // Adicionar ao cache
      cacheRef.current.set(cacheKey, newPhotos);
      
      // Limitar tamanho do cache
      if (cacheRef.current.size > 20) {
        const firstKey = cacheRef.current.keys().next().value;
        cacheRef.current.delete(firstKey);
      }

      setState(prev => ({
        ...prev,
        photos: append ? [...prev.photos, ...newPhotos] : newPhotos,
        loading: false,
        hasMore: newPhotos.length === pageSize,
        currentPage: page,
        totalCount: result.total || prev.totalCount,
        lastRefresh: new Date(),
      }));

      // Preload próxima página se habilitado
      if (preloadNextPage && newPhotos.length === pageSize) {
        setTimeout(() => {
          loadPhotos(page + 1, false, false);
        }, 1000);
      }

    } catch (error: any) {
      if (error.name !== 'AbortError') {
        const errorMessage = error.message || 'Erro ao carregar fotos';
        setState(prev => ({ ...prev, loading: false, error: errorMessage }));
        reportError(error, { context: 'loadPhotos', page, filters });
      }
    } finally {
      loadingRef.current = false;
    }
  }, [repository, pageSize, filters, preloadNextPage, reportError]);

  // Callbacks otimizados
  const debouncedSearch = useDebouncedCallback((query: string) => {
    setFilters(prev => ({ ...prev, searchQuery: query }));
  }, searchDebounceMs, []);

  const throttledRefresh = useThrottledCallback(() => {
    cacheRef.current.clear();
    loadPhotos(0, false, false);
  }, 1000, [loadPhotos]);

  const loadMore = useCallback(() => {
    if (!state.loading && state.hasMore) {
      loadPhotos(state.currentPage + 1, true);
    }
  }, [state.loading, state.hasMore, state.currentPage, loadPhotos]);

  // Operações em batch
  const addPhotosBatch = useCallback(async (photos: Photo[]) => {
    if (addToQueue) {
      photos.forEach(photo => {
        addToQueue(async () => {
          await repository.savePhoto(photo);
        });
      });
    } else {
      // Fallback sem batch
      for (const photo of photos) {
        await repository.savePhoto(photo);
      }
    }
    throttledRefresh();
  }, [addToQueue, repository, throttledRefresh]);

  const deletePhotosBatch = useCallback(async (photoIds: string[]) => {
    if (addToQueue) {
      photoIds.forEach(id => {
        addToQueue(async () => {
          await repository.deletePhoto(id);
        });
      });
    } else {
      // Fallback sem batch
      for (const id of photoIds) {
        await repository.deletePhoto(id);
      }
    }
    
    // Atualizar estado local imediatamente
    setState(prev => ({
      ...prev,
      photos: prev.photos.filter(photo => !photoIds.includes(photo.id)),
    }));
  }, [addToQueue, repository]);

  // Filtros otimizados
  const updateFilters = useCallback((newFilters: Partial<PhotoFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    cacheRef.current.clear();
    loadPhotos(0, false, false);
  }, [loadPhotos]);

  // Auto-refresh
  useEffect(() => {
    if (autoRefreshInterval > 0) {
      const interval = setInterval(() => {
        if (!state.loading) {
          throttledRefresh();
        }
      }, autoRefreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefreshInterval, state.loading, throttledRefresh]);

  // Carregar fotos inicial
  useEffect(() => {
    loadPhotos(0, false, true);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Estatísticas de performance
  const stats = useMemo(() => ({
    totalPhotos: state.totalCount,
    loadedPhotos: state.photos.length,
    filteredPhotos: processedPhotos.length,
    cacheSize: cacheRef.current.size,
    isSearching,
    lastRefresh: state.lastRefresh,
  }), [state.totalCount, state.photos.length, processedPhotos.length, isSearching, state.lastRefresh]);

  return {
    // Estado
    photos: processedPhotos,
    loading: state.loading,
    error: state.error,
    hasMore: state.hasMore,
    filters,
    stats,

    // Ações
    loadMore,
    refresh: throttledRefresh,
    search: debouncedSearch,
    updateFilters,
    addPhotosBatch,
    deletePhotosBatch,

    // Cache de imagens (se habilitado)
    imageCache,

    // Utilitários
    clearCache: () => cacheRef.current.clear(),
    getPhoto: (id: string) => state.photos.find(p => p.id === id),
  };
};