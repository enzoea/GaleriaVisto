import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import {
  Photo,
  PhotoId,
  CreatePhotoInput,
  UpdatePhotoInput,
  PhotoFilter,
  PhotoSortOptions,
  OperationResult,
  PhotoStats,
} from '../../domain/photo/types';
import { PhotoRepositoryEnhanced } from '../../data/repositories/PhotoRepositoryEnhanced';

// Instância singleton do repositório
const repositoryInstance = new PhotoRepositoryEnhanced();

// Estado do contexto
interface PhotoState {
  photos: Photo[];
  loading: boolean;
  error: string | null;
  filter: PhotoFilter;
  sortOptions: PhotoSortOptions;
  stats: PhotoStats | null;
  selectedPhotos: PhotoId[];
  isSelectionMode: boolean;
}

// Ações do reducer
type PhotoAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PHOTOS'; payload: Photo[] }
  | { type: 'ADD_PHOTO'; payload: Photo }
  | { type: 'UPDATE_PHOTO'; payload: Photo }
  | { type: 'REMOVE_PHOTO'; payload: PhotoId }
  | { type: 'SET_FILTER'; payload: PhotoFilter }
  | { type: 'SET_SORT_OPTIONS'; payload: PhotoSortOptions }
  | { type: 'SET_STATS'; payload: PhotoStats }
  | { type: 'TOGGLE_PHOTO_SELECTION'; payload: PhotoId }
  | { type: 'SELECT_ALL_PHOTOS' }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_SELECTION_MODE'; payload: boolean }
  | { type: 'TOGGLE_FAVORITE'; payload: PhotoId }
  | { type: 'BULK_UPDATE_PHOTOS'; payload: Photo[] };

// Interface do contexto
interface PhotoContextType {
  state: PhotoState;
  
  // Operações CRUD
  createPhoto: (input: CreatePhotoInput) => Promise<OperationResult<Photo>>;
  updatePhoto: (input: UpdatePhotoInput) => Promise<OperationResult<Photo>>;
  deletePhoto: (id: PhotoId) => Promise<OperationResult<void>>;
  deleteSelectedPhotos: () => Promise<OperationResult<void>>;
  
  // Operações de busca
  loadPhotos: () => Promise<void>;
  refreshPhotos: () => Promise<void>;
  searchPhotos: (filter: PhotoFilter) => Promise<void>;
  
  // Operações de filtro e ordenação
  setFilter: (filter: PhotoFilter) => void;
  setSortOptions: (options: PhotoSortOptions) => void;
  clearFilter: () => void;
  
  // Operações de seleção
  togglePhotoSelection: (id: PhotoId) => void;
  selectAllPhotos: () => void;
  clearSelection: () => void;
  setSelectionMode: (enabled: boolean) => void;
  
  // Operações de favoritos
  toggleFavorite: (id: PhotoId) => Promise<void>;
  
  // Operações de estatísticas
  loadStats: () => Promise<void>;
  
  // Operações de manutenção
  cleanup: () => Promise<OperationResult<{ deletedCount: number }>>;
  backup: () => Promise<OperationResult<{ backupPath: string }>>;
  restore: (backupPath: string) => Promise<OperationResult<{ restoredCount: number }>>;
}

// Estado inicial
const initialState: PhotoState = {
  photos: [],
  loading: false,
  error: null,
  filter: {},
  sortOptions: { field: 'timestamp', direction: 'desc' },
  stats: null,
  selectedPhotos: [],
  isSelectionMode: false,
};

// Reducer
function photoReducer(state: PhotoState, action: PhotoAction): PhotoState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
      
    case 'SET_PHOTOS':
      return { ...state, photos: action.payload, loading: false, error: null };
      
    case 'ADD_PHOTO':
      return {
        ...state,
        photos: [action.payload, ...state.photos],
        loading: false,
        error: null,
      };
      
    case 'UPDATE_PHOTO':
      return {
        ...state,
        photos: state.photos.map(photo =>
          photo.id === action.payload.id ? action.payload : photo
        ),
        loading: false,
        error: null,
      };
      
    case 'REMOVE_PHOTO':
      return {
        ...state,
        photos: state.photos.filter(photo => photo.id !== action.payload),
        selectedPhotos: state.selectedPhotos.filter(id => id !== action.payload),
        loading: false,
        error: null,
      };
      
    case 'SET_FILTER':
      return { ...state, filter: action.payload };
      
    case 'SET_SORT_OPTIONS':
      return { ...state, sortOptions: action.payload };
      
    case 'SET_STATS':
      return { ...state, stats: action.payload };
      
    case 'TOGGLE_PHOTO_SELECTION':
      const isSelected = state.selectedPhotos.includes(action.payload);
      return {
        ...state,
        selectedPhotos: isSelected
          ? state.selectedPhotos.filter(id => id !== action.payload)
          : [...state.selectedPhotos, action.payload],
      };
      
    case 'SELECT_ALL_PHOTOS':
      return {
        ...state,
        selectedPhotos: state.photos.map(photo => photo.id),
      };
      
    case 'CLEAR_SELECTION':
      return {
        ...state,
        selectedPhotos: [],
        isSelectionMode: false,
      };
      
    case 'SET_SELECTION_MODE':
      return {
        ...state,
        isSelectionMode: action.payload,
        selectedPhotos: action.payload ? state.selectedPhotos : [],
      };
      
    case 'TOGGLE_FAVORITE':
      return {
        ...state,
        photos: state.photos.map(photo =>
          photo.id === action.payload
            ? { ...photo, isFavorite: !photo.isFavorite, updatedAt: Date.now() }
            : photo
        ),
      };
      
    case 'BULK_UPDATE_PHOTOS':
      return {
        ...state,
        photos: action.payload,
        loading: false,
        error: null,
      };
      
    default:
      return state;
  }
}

// Contexto
const PhotoContext = createContext<PhotoContextType | undefined>(undefined);

// Provider
interface PhotoProviderProps {
  children: React.ReactNode;
}

export const PhotoProvider: React.FC<PhotoProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(photoReducer, initialState);
  const repository = repositoryInstance;
  const isLoadingRef = useRef(false);
  const isInitializedRef = useRef(false);

  // Configurar listeners do repositório
  useEffect(() => {
    const handlePhotoCreated = (photo: Photo) => {
      dispatch({ type: 'ADD_PHOTO', payload: photo });
    };

    const handlePhotoUpdated = (photo: Photo) => {
      dispatch({ type: 'UPDATE_PHOTO', payload: photo });
    };

    const handlePhotoDeleted = (photoId: PhotoId) => {
      dispatch({ type: 'REMOVE_PHOTO', payload: photoId });
    };

    const handleError = (error: Error) => {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    };

    repository.on('photo:created', handlePhotoCreated);
    repository.on('photo:updated', handlePhotoUpdated);
    repository.on('photo:deleted', handlePhotoDeleted);
    repository.on('error', handleError);

    return () => {
      repository.off('photo:created', handlePhotoCreated);
      repository.off('photo:updated', handlePhotoUpdated);
      repository.off('photo:deleted', handlePhotoDeleted);
      repository.off('error', handleError);
    };
  }, [repository]);

  // Operações CRUD
  const createPhoto = useCallback(async (input: CreatePhotoInput): Promise<OperationResult<Photo>> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    const result = await repository.create(input);
    
    if (!result.success) {
      dispatch({ type: 'SET_ERROR', payload: result.error?.message || 'Erro ao criar foto' });
    }
    
    dispatch({ type: 'SET_LOADING', payload: false });
    return result;
  }, [repository]);

  const updatePhoto = useCallback(async (input: UpdatePhotoInput): Promise<OperationResult<Photo>> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    const result = await repository.update(input);
    
    if (!result.success) {
      dispatch({ type: 'SET_ERROR', payload: result.error?.message || 'Erro ao atualizar foto' });
    }
    
    dispatch({ type: 'SET_LOADING', payload: false });
    return result;
  }, [repository]);

  const deletePhoto = useCallback(async (id: PhotoId): Promise<OperationResult<void>> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    const result = await repository.delete(id);
    
    if (!result.success) {
      dispatch({ type: 'SET_ERROR', payload: result.error?.message || 'Erro ao deletar foto' });
    }
    
    dispatch({ type: 'SET_LOADING', payload: false });
    return result;
  }, [repository]);

  const deleteSelectedPhotos = useCallback(async (): Promise<OperationResult<void>> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      for (const photoId of state.selectedPhotos) {
        const result = await repository.delete(photoId);
        if (!result.success) {
          throw new Error(result.error?.message || `Erro ao deletar foto ${photoId}`);
        }
      }
      
      dispatch({ type: 'CLEAR_SELECTION' });
      dispatch({ type: 'SET_LOADING', payload: false });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao deletar fotos selecionadas';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      dispatch({ type: 'SET_LOADING', payload: false });
      
      return {
        success: false,
        error: {
          code: 'BULK_DELETE_FAILED',
          message: errorMessage,
        },
      };
    }
  }, [repository, state.selectedPhotos]);

  // Operações de busca
  const loadPhotos = useCallback(async () => {
    if (isLoadingRef.current) {
      return; // Evita chamadas simultâneas
    }
    
    isLoadingRef.current = true;
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const result = await repository.findAll({
        filter: state.filter,
        sort: state.sortOptions,
      });
      
      if (result.success) {
        dispatch({ type: 'SET_PHOTOS', payload: result.data!.items });
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error?.message || 'Erro ao carregar fotos' });
      }
    } finally {
      isLoadingRef.current = false;
    }
  }, [repository]);

  const refreshPhotos = useCallback(async () => {
    await loadPhotos();
  }, [loadPhotos]);

  const searchPhotos = useCallback(async (filter: PhotoFilter) => {
    dispatch({ type: 'SET_FILTER', payload: filter });
    
    const result = await repository.findAll({
      filter,
      sort: state.sortOptions,
    });
    
    if (result.success) {
      dispatch({ type: 'SET_PHOTOS', payload: result.data!.items });
    } else {
      dispatch({ type: 'SET_ERROR', payload: result.error?.message || 'Erro ao buscar fotos' });
    }
  }, [repository]);

  // Operações de filtro e ordenação
  const setFilter = useCallback((filter: PhotoFilter) => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  }, []);

  const setSortOptions = useCallback((options: PhotoSortOptions) => {
    dispatch({ type: 'SET_SORT_OPTIONS', payload: options });
  }, []);

  const clearFilter = useCallback(() => {
    dispatch({ type: 'SET_FILTER', payload: {} });
  }, []);

  // Operações de seleção
  const togglePhotoSelection = useCallback((id: PhotoId) => {
    dispatch({ type: 'TOGGLE_PHOTO_SELECTION', payload: id });
  }, []);

  const selectAllPhotos = useCallback(() => {
    dispatch({ type: 'SELECT_ALL_PHOTOS' });
  }, []);

  const clearSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' });
  }, []);

  const setSelectionMode = useCallback((enabled: boolean) => {
    dispatch({ type: 'SET_SELECTION_MODE', payload: enabled });
  }, []);

  // Operações de favoritos
  const toggleFavorite = useCallback(async (id: PhotoId) => {
    const photo = state.photos.find(p => p.id === id);
    if (!photo) return;

    const result = await repository.update({
      id,
      isFavorite: !photo.isFavorite,
    });

    if (result.success) {
      dispatch({ type: 'TOGGLE_FAVORITE', payload: id });
    } else {
      dispatch({ type: 'SET_ERROR', payload: result.error?.message || 'Erro ao atualizar favorito' });
    }
  }, [repository]);

  // Operações de estatísticas
  const loadStats = useCallback(async () => {
    const result = await repository.getStats();
    
    if (result.success) {
      dispatch({ type: 'SET_STATS', payload: result.data! });
    } else {
      dispatch({ type: 'SET_ERROR', payload: result.error?.message || 'Erro ao carregar estatísticas' });
    }
  }, [repository]);

  // Operações de manutenção
  const cleanup = useCallback(async () => {
    return await repository.cleanup();
  }, [repository]);

  const backup = useCallback(async () => {
    return await repository.backup();
  }, [repository]);

  const restore = useCallback(async (backupPath: string) => {
    const result = await repository.restore(backupPath);
    
    if (result.success) {
      await loadPhotos();
    }
    
    return result;
  }, [repository, loadPhotos]);

  // Carregar fotos na inicialização
  useEffect(() => {
    if (isInitializedRef.current) {
      return; // Evita múltiplas inicializações
    }
    
    const initializePhotos = async () => {
      isInitializedRef.current = true;
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const result = await repository.findAll({
        filter: {},
        sort: { field: 'timestamp', direction: 'desc' },
      });
      
      if (result.success) {
        dispatch({ type: 'SET_PHOTOS', payload: result.data!.items });
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error?.message || 'Erro ao carregar fotos' });
      }
      
      dispatch({ type: 'SET_LOADING', payload: false });
    };
    
    initializePhotos();
  }, [repository]);

  const contextValue: PhotoContextType = {
    state,
    createPhoto,
    updatePhoto,
    deletePhoto,
    deleteSelectedPhotos,
    loadPhotos,
    refreshPhotos,
    searchPhotos,
    setFilter,
    setSortOptions,
    clearFilter,
    togglePhotoSelection,
    selectAllPhotos,
    clearSelection,
    setSelectionMode,
    toggleFavorite,
    loadStats,
    cleanup,
    backup,
    restore,
  };

  return (
    <PhotoContext.Provider value={contextValue}>
      {children}
    </PhotoContext.Provider>
  );
};

// Hook para usar o contexto
export const usePhotoContext = (): PhotoContextType => {
  const context = useContext(PhotoContext);
  if (!context) {
    throw new Error('usePhotoContext deve ser usado dentro de um PhotoProvider');
  }
  return context;
};

// Hook para fotos filtradas (memoizado)
export const useFilteredPhotos = () => {
  const { state } = usePhotoContext();
  
  return React.useMemo(() => {
    let filteredPhotos = [...state.photos];
    
    // Aplicar filtros
    if (state.filter.searchText) {
      const searchLower = state.filter.searchText.toLowerCase();
      filteredPhotos = filteredPhotos.filter(photo => {
        const titleMatch = photo.title?.toLowerCase().includes(searchLower);
        const descriptionMatch = photo.description?.toLowerCase().includes(searchLower);
        const tagsMatch = photo.tags?.some(tag => tag.toLowerCase().includes(searchLower));
        return titleMatch || descriptionMatch || tagsMatch;
      });
    }
    
    if (state.filter.isFavorite !== undefined) {
      filteredPhotos = filteredPhotos.filter(photo => photo.isFavorite === state.filter.isFavorite);
    }
    
    if (state.filter.hasLocation !== undefined) {
      filteredPhotos = filteredPhotos.filter(photo => 
        state.filter.hasLocation ? !!photo.location : !photo.location
      );
    }
    
    // Aplicar ordenação
    filteredPhotos.sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (state.sortOptions.field) {
        case 'timestamp':
          aValue = a.timestamp;
          bValue = b.timestamp;
          break;
        case 'title':
          aValue = a.title || '';
          bValue = b.title || '';
          break;
        case 'createdAt':
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        case 'updatedAt':
          aValue = a.updatedAt;
          bValue = b.updatedAt;
          break;
        default:
          return 0;
      }
      
      if (state.sortOptions.direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
    
    return filteredPhotos;
  }, [state.photos, state.filter, state.sortOptions]);
};