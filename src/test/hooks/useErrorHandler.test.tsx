import { renderHook, act } from '@testing-library/react-native';
import { useErrorHandler, useErrorReporter, useErrorBoundary } from '../../presentation/hooks/useErrorHandler';
import { ErrorContext } from '../../presentation/contexts/ErrorContext';
import React from 'react';

// Mock do contexto de erro
const mockErrorContext = {
  errors: [],
  reportError: jest.fn(),
  clearError: jest.fn(),
  clearAllErrors: jest.fn(),
  retryOperation: jest.fn(),
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ErrorContext.Provider value={mockErrorContext}>
    {children}
  </ErrorContext.Provider>
);

describe('useErrorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar função reportError do contexto', () => {
    const { result } = renderHook(() => useErrorHandler(), { wrapper });

    expect(result.current.reportError).toBe(mockErrorContext.reportError);
  });

  it('deve reportar erro com informações corretas', () => {
    const { result } = renderHook(() => useErrorHandler(), { wrapper });

    const error = new Error('Test error');
    const context = { userId: '123' };

    act(() => {
      result.current.reportError(error, 'test_error', context);
    });

    expect(mockErrorContext.reportError).toHaveBeenCalledWith(
      error,
      'test_error',
      context
    );
  });

  it('deve funcionar sem contexto opcional', () => {
    const { result } = renderHook(() => useErrorHandler(), { wrapper });

    const error = new Error('Test error');

    act(() => {
      result.current.reportError(error, 'test_error');
    });

    expect(mockErrorContext.reportError).toHaveBeenCalledWith(
      error,
      'test_error',
      undefined
    );
  });
});

describe('useErrorReporter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve reportar erro de rede corretamente', () => {
    const { result } = renderHook(() => useErrorReporter(), { wrapper });

    const error = new Error('Network error');

    act(() => {
      result.current.reportNetworkError(error, 'https://api.example.com');
    });

    expect(mockErrorContext.reportError).toHaveBeenCalledWith(
      error,
      'network_error',
      { url: 'https://api.example.com' }
    );
  });

  it('deve reportar erro de validação corretamente', () => {
    const { result } = renderHook(() => useErrorReporter(), { wrapper });

    const validationErrors = { email: 'Email inválido' };

    act(() => {
      result.current.reportValidationError(validationErrors, 'user_form');
    });

    expect(mockErrorContext.reportError).toHaveBeenCalledWith(
      expect.any(Error),
      'validation_error',
      { field: 'user_form', errors: validationErrors }
    );
  });

  it('deve reportar erro de permissão corretamente', () => {
    const { result } = renderHook(() => useErrorReporter(), { wrapper });

    act(() => {
      result.current.reportPermissionError('camera', 'Acesso negado');
    });

    expect(mockErrorContext.reportError).toHaveBeenCalledWith(
      expect.any(Error),
      'permission_error',
      { permission: 'camera', reason: 'Acesso negado' }
    );
  });

  it('deve reportar erro de storage corretamente', () => {
    const { result } = renderHook(() => useErrorReporter(), { wrapper });

    const error = new Error('Storage full');

    act(() => {
      result.current.reportStorageError(error, 'save_photo');
    });

    expect(mockErrorContext.reportError).toHaveBeenCalledWith(
      error,
      'storage_error',
      { operation: 'save_photo' }
    );
  });

  it('deve reportar erro de performance corretamente', () => {
    const { result } = renderHook(() => useErrorReporter(), { wrapper });

    act(() => {
      result.current.reportPerformanceError('slow_render', 5000, { component: 'PhotoGrid' });
    });

    expect(mockErrorContext.reportError).toHaveBeenCalledWith(
      expect.any(Error),
      'performance_error',
      { 
        metric: 'slow_render', 
        value: 5000, 
        threshold: 1000,
        context: { component: 'PhotoGrid' }
      }
    );
  });

  it('deve reportar erro de API corretamente', () => {
    const { result } = renderHook(() => useErrorReporter(), { wrapper });

    act(() => {
      result.current.reportApiError(404, 'Not Found', '/api/photos', { userId: '123' });
    });

    expect(mockErrorContext.reportError).toHaveBeenCalledWith(
      expect.any(Error),
      'api_error',
      { 
        status: 404, 
        message: 'Not Found', 
        endpoint: '/api/photos',
        context: { userId: '123' }
      }
    );
  });

  it('deve reportar erro de sincronização corretamente', () => {
    const { result } = renderHook(() => useErrorReporter(), { wrapper });

    const error = new Error('Sync failed');

    act(() => {
      result.current.reportSyncError(error, 'photos', { lastSync: '2023-01-01' });
    });

    expect(mockErrorContext.reportError).toHaveBeenCalledWith(
      error,
      'sync_error',
      { type: 'photos', context: { lastSync: '2023-01-01' } }
    );
  });

  it('deve reportar erro de upload corretamente', () => {
    const { result } = renderHook(() => useErrorReporter(), { wrapper });

    const error = new Error('Upload failed');

    act(() => {
      result.current.reportUploadError(error, 'photo123.jpg', { size: 1024000 });
    });

    expect(mockErrorContext.reportError).toHaveBeenCalledWith(
      error,
      'upload_error',
      { fileName: 'photo123.jpg', context: { size: 1024000 } }
    );
  });

  it('deve reportar erro de cache corretamente', () => {
    const { result } = renderHook(() => useErrorReporter(), { wrapper });

    const error = new Error('Cache error');

    act(() => {
      result.current.reportCacheError(error, 'get', 'photo_123');
    });

    expect(mockErrorContext.reportError).toHaveBeenCalledWith(
      error,
      'cache_error',
      { operation: 'get', key: 'photo_123' }
    );
  });

  it('deve reportar erro de analytics corretamente', () => {
    const { result } = renderHook(() => useErrorReporter(), { wrapper });

    const error = new Error('Analytics error');

    act(() => {
      result.current.reportAnalyticsError(error, 'photo_view', { photoId: '123' });
    });

    expect(mockErrorContext.reportError).toHaveBeenCalledWith(
      error,
      'analytics_error',
      { event: 'photo_view', data: { photoId: '123' } }
    );
  });
});

describe('useErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve detectar erro e reportar corretamente', () => {
    const { result } = renderHook(() => useErrorBoundary(), { wrapper });

    const error = new Error('Component error');
    const errorInfo = { componentStack: 'Component stack trace' };

    act(() => {
      result.current.onError(error, errorInfo);
    });

    expect(mockErrorContext.reportError).toHaveBeenCalledWith(
      error,
      'component_error',
      { componentStack: 'Component stack trace' }
    );
  });

  it('deve resetar estado de erro', () => {
    const { result } = renderHook(() => useErrorBoundary(), { wrapper });

    // Simula um erro
    const error = new Error('Component error');
    act(() => {
      result.current.onError(error, { componentStack: '' });
    });

    expect(result.current.hasError).toBe(true);

    // Reset do erro
    act(() => {
      result.current.resetError();
    });

    expect(result.current.hasError).toBe(false);
  });

  it('deve retornar estado inicial correto', () => {
    const { result } = renderHook(() => useErrorBoundary(), { wrapper });

    expect(result.current.hasError).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.onError).toBe('function');
    expect(typeof result.current.resetError).toBe('function');
  });

  it('deve manter informações do erro após detecção', () => {
    const { result } = renderHook(() => useErrorBoundary(), { wrapper });

    const error = new Error('Test error');
    const errorInfo = { componentStack: 'Stack trace' };

    act(() => {
      result.current.onError(error, errorInfo);
    });

    expect(result.current.hasError).toBe(true);
    expect(result.current.error).toBe(error);
  });

  it('deve limpar informações do erro após reset', () => {
    const { result } = renderHook(() => useErrorBoundary(), { wrapper });

    // Simula erro
    act(() => {
      result.current.onError(new Error('Test'), { componentStack: '' });
    });

    // Reset
    act(() => {
      result.current.resetError();
    });

    expect(result.current.hasError).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('deve permitir múltiplos erros consecutivos', () => {
    const { result } = renderHook(() => useErrorBoundary(), { wrapper });

    const error1 = new Error('First error');
    const error2 = new Error('Second error');

    act(() => {
      result.current.onError(error1, { componentStack: '' });
    });

    expect(result.current.error).toBe(error1);

    act(() => {
      result.current.onError(error2, { componentStack: '' });
    });

    expect(result.current.error).toBe(error2);
    expect(mockErrorContext.reportError).toHaveBeenCalledTimes(2);
  });

  it('deve funcionar com errorInfo opcional', () => {
    const { result } = renderHook(() => useErrorBoundary(), { wrapper });

    const error = new Error('Test error');

    act(() => {
      result.current.onError(error);
    });

    expect(mockErrorContext.reportError).toHaveBeenCalledWith(
      error,
      'component_error',
      {}
    );
  });

  it('deve manter estado consistente durante múltiplos resets', () => {
    const { result } = renderHook(() => useErrorBoundary(), { wrapper });

    // Primeiro ciclo
    act(() => {
      result.current.onError(new Error('Error 1'), { componentStack: '' });
    });
    
    act(() => {
      result.current.resetError();
    });

    expect(result.current.hasError).toBe(false);

    // Segundo ciclo
    act(() => {
      result.current.onError(new Error('Error 2'), { componentStack: '' });
    });

    expect(result.current.hasError).toBe(true);

    act(() => {
      result.current.resetError();
    });

    expect(result.current.hasError).toBe(false);
  });
});