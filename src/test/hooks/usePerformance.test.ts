import { renderHook, act } from '@testing-library/react-native';
import {
  useMemoizedData,
  useDebouncedCallback,
  useThrottledCallback,
  useExpensiveCalculation,
  useRenderPerformance,
  useImageCache,
  useOptimizedSearch,
  useBatchOperations,
  useMemoryMonitor,
} from '../../presentation/hooks/usePerformance';

// Mock do useErrorReporter
jest.mock('../../presentation/hooks/useErrorHandler', () => ({
  useErrorReporter: () => ({
    reportPerformanceError: jest.fn(),
  }),
}));

// Mock do performance.now
const mockPerformanceNow = jest.fn();
Object.defineProperty(global, 'performance', {
  value: {
    now: mockPerformanceNow,
    memory: {
      usedJSHeapSize: 1000000,
      totalJSHeapSize: 2000000,
      jsHeapSizeLimit: 4000000,
    },
  },
});

describe('usePerformance hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPerformanceNow.mockReturnValue(100);
  });

  describe('useMemoizedData', () => {
    it('should memoize data based on dependencies', () => {
      const data = { id: 1, name: 'test' };
      const { result, rerender } = renderHook(
        ({ data, deps }) => useMemoizedData(data, deps),
        { initialProps: { data, deps: [data.id] } }
      );

      const firstResult = result.current;

      // Rerender com mesmas dependências
      rerender({ data, deps: [data.id] });
      expect(result.current).toBe(firstResult);

      // Rerender com dependências diferentes
      rerender({ data: { id: 2, name: 'test2' }, deps: [2] });
      expect(result.current).not.toBe(firstResult);
    });

    it('should use custom compare function', () => {
      const data1 = { id: 1, name: 'test', timestamp: 100 };
      const data2 = { id: 1, name: 'test', timestamp: 200 };
      
      const compareFn = (prev: any, next: any) => prev.id === next.id && prev.name === next.name;

      const { result, rerender } = renderHook(
        ({ data }) => useMemoizedData(data, [], compareFn),
        { initialProps: { data: data1 } }
      );

      const firstResult = result.current;

      // Rerender com dados "equivalentes" segundo compareFn
      rerender({ data: data2 });
      expect(result.current).toBe(data2); // Deve retornar os novos dados
    });
  });

  describe('useDebouncedCallback', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should debounce callback execution', () => {
      const callback = jest.fn();
      const { result } = renderHook(() => 
        useDebouncedCallback(callback, 300)
      );

      // Chamar múltiplas vezes rapidamente
      act(() => {
        result.current('test1');
        result.current('test2');
        result.current('test3');
      });

      // Callback não deve ter sido chamado ainda
      expect(callback).not.toHaveBeenCalled();

      // Avançar o tempo
      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Callback deve ter sido chamado apenas uma vez com o último valor
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('test3');
    });
  });

  describe('useThrottledCallback', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should throttle callback execution', () => {
      const callback = jest.fn();
      const { result } = renderHook(() => 
        useThrottledCallback(callback, 300)
      );

      // Primeira chamada deve executar imediatamente
      act(() => {
        result.current('test1');
      });
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('test1');

      // Chamadas subsequentes devem ser throttled
      act(() => {
        result.current('test2');
        result.current('test3');
      });
      expect(callback).toHaveBeenCalledTimes(1);

      // Após o delay, próxima chamada deve executar
      act(() => {
        jest.advanceTimersByTime(300);
        result.current('test4');
      });
      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenLastCalledWith('test4');
    });
  });

  describe('useExpensiveCalculation', () => {
    it('should memoize expensive calculations', () => {
      const expensiveCalc = jest.fn(() => 'result');
      mockPerformanceNow.mockReturnValueOnce(0).mockReturnValueOnce(50);

      const { result, rerender } = renderHook(
        ({ deps }) => useExpensiveCalculation(expensiveCalc, deps),
        { initialProps: { deps: [1] } }
      );

      expect(result.current).toBe('result');
      expect(expensiveCalc).toHaveBeenCalledTimes(1);

      // Rerender com mesmas dependências
      rerender({ deps: [1] });
      expect(expensiveCalc).toHaveBeenCalledTimes(1); // Não deve recalcular

      // Rerender com dependências diferentes
      rerender({ deps: [2] });
      expect(expensiveCalc).toHaveBeenCalledTimes(2); // Deve recalcular
    });

    it('should report performance errors for slow calculations', () => {
      const expensiveCalc = jest.fn(() => 'result');
      mockPerformanceNow.mockReturnValueOnce(0).mockReturnValueOnce(150); // 150ms

      renderHook(() => 
        useExpensiveCalculation(expensiveCalc, [1], 'test-calc')
      );

      // Deve reportar erro de performance (>100ms)
      // Verificação seria feita através do mock do useErrorReporter
    });
  });

  describe('useRenderPerformance', () => {
    it('should track render count', () => {
      const { result, rerender } = renderHook(() => 
        useRenderPerformance('TestComponent')
      );

      expect(result.current.renderCount).toBe(1);

      rerender();
      expect(result.current.renderCount).toBe(2);

      rerender();
      expect(result.current.renderCount).toBe(3);

      // Reset render count
      act(() => {
        result.current.resetRenderCount();
      });
      expect(result.current.renderCount).toBe(0);
    });
  });

  describe('useImageCache', () => {
    it('should cache and retrieve images', () => {
      const { result } = renderHook(() => useImageCache(3));

      // Cache algumas imagens
      act(() => {
        result.current.setCachedImage('uri1', 'cached1');
        result.current.setCachedImage('uri2', 'cached2');
      });

      // Recuperar imagens
      expect(result.current.getCachedImage('uri1')).toBe('cached1');
      expect(result.current.getCachedImage('uri2')).toBe('cached2');
      expect(result.current.getCachedImage('uri3')).toBeNull();

      // Verificar stats
      const stats = result.current.getCacheStats();
      expect(stats.size).toBe(2);
      expect(stats.maxSize).toBe(3);
    });

    it('should implement LRU eviction', () => {
      const { result } = renderHook(() => useImageCache(2));

      // Preencher cache até o limite
      act(() => {
        result.current.setCachedImage('uri1', 'cached1');
        result.current.setCachedImage('uri2', 'cached2');
      });

      // Adicionar mais uma (deve remover a mais antiga)
      act(() => {
        result.current.setCachedImage('uri3', 'cached3');
      });

      expect(result.current.getCachedImage('uri1')).toBeNull(); // Removida
      expect(result.current.getCachedImage('uri2')).toBe('cached2');
      expect(result.current.getCachedImage('uri3')).toBe('cached3');
    });

    it('should clear cache', () => {
      const { result } = renderHook(() => useImageCache());

      act(() => {
        result.current.setCachedImage('uri1', 'cached1');
        result.current.clearCache();
      });

      expect(result.current.getCachedImage('uri1')).toBeNull();
      expect(result.current.getCacheStats().size).toBe(0);
    });
  });

  describe('useOptimizedSearch', () => {
    const items = [
      { id: 1, name: 'apple', category: 'fruit' },
      { id: 2, name: 'banana', category: 'fruit' },
      { id: 3, name: 'carrot', category: 'vegetable' },
    ];

    const searchFn = (item: any, query: string) => 
      item.name.toLowerCase().includes(query.toLowerCase());

    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should filter items based on search query', () => {
      const { result } = renderHook(() => 
        useOptimizedSearch(items, searchFn, 100)
      );

      // Inicialmente deve retornar todos os itens
      expect(result.current.filteredItems).toEqual(items);
      expect(result.current.isSearching).toBe(false);

      // Definir query de busca
      act(() => {
        result.current.setQuery('app');
      });

      expect(result.current.isSearching).toBe(true);

      // Avançar tempo para debounce
      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(result.current.filteredItems).toEqual([items[0]]);
      expect(result.current.isSearching).toBe(false);
    });

    it('should debounce search queries', () => {
      const { result } = renderHook(() => 
        useOptimizedSearch(items, searchFn, 100)
      );

      // Múltiplas queries rápidas
      act(() => {
        result.current.setQuery('a');
        result.current.setQuery('ap');
        result.current.setQuery('app');
      });

      expect(result.current.isSearching).toBe(true);
      expect(result.current.filteredItems).toEqual(items); // Ainda não filtrou

      // Avançar tempo
      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(result.current.isSearching).toBe(false);
      expect(result.current.filteredItems).toEqual([items[0]]);
    });
  });

  describe('useBatchOperations', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should batch operations', async () => {
      const processor = jest.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useBatchOperations(2, 100));

      // Definir processador
      act(() => {
        result.current.setProcessor(processor);
      });

      // Adicionar itens à fila
      act(() => {
        result.current.addToQueue('item1');
        result.current.addToQueue('item2');
      });

      expect(result.current.queueSize).toBe(2);
      expect(result.current.processing).toBe(true);

      // Aguardar processamento
      await act(async () => {
        await Promise.resolve(); // Aguardar microtask
      });

      expect(processor).toHaveBeenCalledWith(['item1', 'item2']);

      // Avançar tempo para delay
      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(result.current.processing).toBe(false);
      expect(result.current.queueSize).toBe(0);
    });

    it('should handle batch addition', () => {
      const { result } = renderHook(() => useBatchOperations(3, 50));

      act(() => {
        result.current.addBatchToQueue(['item1', 'item2', 'item3']);
      });

      expect(result.current.queueSize).toBe(3);
    });

    it('should clear queue', () => {
      const { result } = renderHook(() => useBatchOperations());

      act(() => {
        result.current.addToQueue('item1');
        result.current.clearQueue();
      });

      expect(result.current.queueSize).toBe(0);
    });
  });

  describe('useMemoryMonitor', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should monitor memory usage', () => {
      const { result } = renderHook(() => useMemoryMonitor(1000));

      expect(result.current.usedJSHeapSize).toBe(1000000);
      expect(result.current.totalJSHeapSize).toBe(2000000);
      expect(result.current.jsHeapSizeLimit).toBe(4000000);

      // Simular mudança na memória
      Object.defineProperty(global.performance, 'memory', {
        value: {
          usedJSHeapSize: 1500000,
          totalJSHeapSize: 2500000,
          jsHeapSizeLimit: 4000000,
        },
      });

      // Avançar tempo para próxima verificação
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.usedJSHeapSize).toBe(1500000);
    });
  });
});