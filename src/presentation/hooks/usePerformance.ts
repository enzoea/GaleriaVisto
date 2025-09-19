import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { performanceUtils } from '../../utils/helpers';
import { useErrorReporter } from './useErrorHandler';

// Hook para memoização inteligente de dados
export const useMemoizedData = <T>(
  data: T,
  dependencies: any[] = [],
  compareFn?: (prev: T, next: T) => boolean
) => {
  const memoizedData = useMemo(() => {
    return data;
  }, dependencies);

  // Comparação customizada se fornecida
  const prevDataRef = useRef<T>(data);
  
  if (compareFn && !compareFn(prevDataRef.current, data)) {
    prevDataRef.current = data;
    return data;
  }

  return memoizedData;
};

// Hook para debounce de funções
export const useDebouncedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  dependencies: any[] = []
): T => {
  const debouncedCallback = useCallback(
    performanceUtils.debounce(callback, delay),
    dependencies
  );

  return debouncedCallback as T;
};

// Hook para throttle de funções
export const useThrottledCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  dependencies: any[] = []
): T => {
  const throttledCallback = useCallback(
    performanceUtils.throttle(callback, delay),
    dependencies
  );

  return throttledCallback as T;
};

// Hook para memoização de cálculos pesados
export const useExpensiveCalculation = <T>(
  calculation: () => T,
  dependencies: any[],
  cacheKey?: string
): T => {
  const { reportPerformanceError } = useErrorReporter();
  
  const memoizedCalculation = useMemo(() => {
    const startTime = performance.now();
    
    try {
      const result = calculation();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Reporta se o cálculo demorou muito (>100ms)
      if (duration > 100) {
        reportPerformanceError(
          'expensive_calculation',
          duration,
          { cacheKey, threshold: 100 }
        );
      }
      
      return result;
    } catch (error) {
      reportPerformanceError(
        'calculation_error',
        0,
        { cacheKey, error: error instanceof Error ? error.message : 'Unknown error' }
      );
      throw error;
    }
  }, dependencies);

  return memoizedCalculation;
};

// Hook para monitoramento de performance de renderização
export const useRenderPerformance = (componentName: string) => {
  const { reportPerformanceError } = useErrorReporter();
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(performance.now());
  
  useEffect(() => {
    renderCountRef.current += 1;
    const currentTime = performance.now();
    const timeSinceLastRender = currentTime - lastRenderTimeRef.current;
    
    // Reporta renderizações muito frequentes (< 16ms = > 60fps)
    if (timeSinceLastRender < 16 && renderCountRef.current > 1) {
      reportPerformanceError(
        'frequent_renders',
        timeSinceLastRender,
        { 
          component: componentName, 
          renderCount: renderCountRef.current,
          threshold: 16
        }
      );
    }
    
    lastRenderTimeRef.current = currentTime;
  });

  return {
    renderCount: renderCountRef.current,
    resetRenderCount: () => {
      renderCountRef.current = 0;
    },
  };
};

// Hook para cache de imagens com LRU
export const useImageCache = (maxSize: number = 50) => {
  const cacheRef = useRef(new Map<string, string>());
  const accessOrderRef = useRef<string[]>([]);

  const getCachedImage = useCallback((uri: string): string | null => {
    const cached = cacheRef.current.get(uri);
    
    if (cached) {
      // Move para o final (mais recente)
      const index = accessOrderRef.current.indexOf(uri);
      if (index > -1) {
        accessOrderRef.current.splice(index, 1);
      }
      accessOrderRef.current.push(uri);
    }
    
    return cached || null;
  }, []);

  const setCachedImage = useCallback((uri: string, cachedUri: string) => {
    // Remove o mais antigo se exceder o limite
    if (cacheRef.current.size >= maxSize) {
      const oldest = accessOrderRef.current.shift();
      if (oldest) {
        cacheRef.current.delete(oldest);
      }
    }
    
    cacheRef.current.set(uri, cachedUri);
    accessOrderRef.current.push(uri);
  }, [maxSize]);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
    accessOrderRef.current.length = 0;
  }, []);

  const getCacheStats = useCallback(() => ({
    size: cacheRef.current.size,
    maxSize,
    hitRate: 0, // Seria calculado com métricas de hit/miss
  }), [maxSize]);

  return {
    getCachedImage,
    setCachedImage,
    clearCache,
    getCacheStats,
  };
};

// Hook para lazy loading de componentes
export const useLazyComponent = <T>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) => {
  const [Component, setComponent] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { reportPerformanceError } = useErrorReporter();

  const loadComponent = useCallback(async () => {
    if (Component || loading) return;
    
    setLoading(true);
    const startTime = performance.now();
    
    try {
      const module = await importFn();
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      // Reporta carregamento lento (>1s)
      if (loadTime > 1000) {
        reportPerformanceError(
          'slow_component_load',
          loadTime,
          { threshold: 1000 }
        );
      }
      
      setComponent(module.default);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Component load failed');
      setError(error);
      reportPerformanceError(
        'component_load_error',
        0,
        { error: error.message }
      );
    } finally {
      setLoading(false);
    }
  }, [Component, loading, importFn, reportPerformanceError]);

  return {
    Component,
    loading,
    error,
    loadComponent,
  };
};

// Hook para otimização de listas grandes
export const useVirtualizedList = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  return {
    visibleItems,
    visibleRange,
    totalHeight,
    offsetY,
    setScrollTop,
  };
};

// Hook para otimização de busca
export const useOptimizedSearch = <T>(
  items: T[],
  searchFn: (item: T, query: string) => boolean,
  debounceMs: number = 300
) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce da query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Memoização dos resultados filtrados
  const filteredItems = useMemo(() => {
    if (!debouncedQuery.trim()) return items;
    
    return items.filter(item => searchFn(item, debouncedQuery));
  }, [items, debouncedQuery, searchFn]);

  return {
    query,
    setQuery,
    filteredItems,
    isSearching: query !== debouncedQuery,
  };
};

// Hook para batch de operações
export const useBatchOperations = <T>(
  batchSize: number = 10,
  delayMs: number = 100
) => {
  const [queue, setQueue] = useState<T[]>([]);
  const [processing, setProcessing] = useState(false);
  const processorRef = useRef<((batch: T[]) => Promise<void>) | null>(null);

  const addToQueue = useCallback((item: T) => {
    setQueue(prev => [...prev, item]);
  }, []);

  const addBatchToQueue = useCallback((items: T[]) => {
    setQueue(prev => [...prev, ...items]);
  }, []);

  const setProcessor = useCallback((processor: (batch: T[]) => Promise<void>) => {
    processorRef.current = processor;
  }, []);

  // Processa a fila em batches
  useEffect(() => {
    if (queue.length === 0 || processing || !processorRef.current) return;

    const processBatch = async () => {
      setProcessing(true);
      
      const batch = queue.slice(0, batchSize);
      setQueue(prev => prev.slice(batchSize));
      
      try {
        await processorRef.current!(batch);
      } catch (error) {
        console.error('Batch processing error:', error);
      }
      
      // Delay antes do próximo batch
      setTimeout(() => {
        setProcessing(false);
      }, delayMs);
    };

    processBatch();
  }, [queue.length, processing, batchSize, delayMs]);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  return {
    queueSize: queue.length,
    processing,
    addToQueue,
    addBatchToQueue,
    setProcessor,
    clearQueue,
  };
};

// Hook para monitoramento de memória
export const useMemoryMonitor = (intervalMs: number = 5000) => {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize?: number;
    totalJSHeapSize?: number;
    jsHeapSizeLimit?: number;
  }>({});
  
  const { reportPerformanceError } = useErrorReporter();

  useEffect(() => {
    const checkMemory = () => {
      // @ts-ignore - performance.memory pode não estar disponível em todos os browsers
      if (performance.memory) {
        // @ts-ignore
        const memory = performance.memory;
        setMemoryInfo({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
        });

        // Reporta uso alto de memória (>80%)
        const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        if (usagePercent > 80) {
          reportPerformanceError(
            'high_memory_usage',
            usagePercent,
            { 
              threshold: 80,
              usedMB: Math.round(memory.usedJSHeapSize / 1024 / 1024),
              limitMB: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
            }
          );
        }
      }
    };

    checkMemory();
    const interval = setInterval(checkMemory, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs, reportPerformanceError]);

  return memoryInfo;
};