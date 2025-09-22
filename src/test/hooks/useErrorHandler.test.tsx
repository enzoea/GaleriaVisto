import { renderHook, act } from '@testing-library/react-native';
import { useErrorHandler, useErrorReporter, useErrorBoundary } from '../../presentation/hooks/useErrorHandler';
import { ErrorContext, AppError, ErrorType } from '../../presentation/contexts/ErrorContext';
import React from 'react';

// Mock do estado inicial
const mockState = {
  errors: [],
  currentError: null,
  isShowingError: false,
  globalErrorHandler: true,
};

// Mock do dispatch
const mockDispatch = jest.fn();

// Mock do contexto de erro
const mockErrorContext = {
  state: mockState,
  dispatch: mockDispatch,
  reportError: jest.fn().mockReturnValue('mock-error-id'),
  clearError: jest.fn(),
  clearAllErrors: jest.fn(),
  retryOperation: jest.fn(),
  showError: jest.fn(),
  hideError: jest.fn(),
  setGlobalErrorHandler: jest.fn(),
  getErrorsByType: jest.fn().mockReturnValue([]),
  getErrorsBySeverity: jest.fn().mockReturnValue([]),
  hasErrors: jest.fn().mockReturnValue(false),
  getLatestError: jest.fn().mockReturnValue(null),
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ErrorContext.Provider value={mockErrorContext}>
    {children}
  </ErrorContext.Provider>
);

describe('useErrorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDispatch.mockClear();
  });

  it('deve retornar as funções corretas', () => {
    const { result } = renderHook(() => useErrorHandler(), { wrapper });

    expect(result.current.reportError).toBeDefined();
    expect(result.current.clearError).toBeDefined();
    expect(result.current.clearAllErrors).toBeDefined();
    expect(result.current.hasErrors).toBe(false);
    expect(result.current.errors).toEqual([]);
  });

  it('deve reportar erro com informações corretas', () => {
    const { result } = renderHook(() => useErrorHandler(), { wrapper });

    const errorData = {
      type: 'network' as ErrorType,
      message: 'Test error',
      severity: 'high' as const,
      context: { userId: '123' },
    };

    act(() => {
      result.current.reportError(errorData);
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'ADD_ERROR',
      payload: expect.objectContaining({
        type: 'network',
        message: 'Test error',
        severity: 'high',
        context: { userId: '123' },
        id: expect.any(String),
        timestamp: expect.any(Number),
      }),
    });
  });

  it('deve limpar erro específico', () => {
    const { result } = renderHook(() => useErrorHandler(), { wrapper });

    act(() => {
      result.current.clearError('error-id');
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'REMOVE_ERROR',
      payload: 'error-id',
    });
  });

  it('deve limpar todos os erros', () => {
    const { result } = renderHook(() => useErrorHandler(), { wrapper });

    act(() => {
      result.current.clearAllErrors();
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'CLEAR_ERRORS',
    });
  });
});

describe('useErrorReporter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDispatch.mockClear();
  });

  it('deve reportar erro de rede corretamente', () => {
    const { result } = renderHook(() => useErrorReporter(), { wrapper });

    act(() => {
      result.current.reportNetworkError('Network error', { url: 'https://api.example.com' });
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'ADD_ERROR',
      payload: expect.objectContaining({
        type: 'NETWORK_ERROR',
        message: 'Network error',
        severity: 'high',
        context: { url: 'https://api.example.com' },
        id: expect.any(String),
        timestamp: expect.any(Number),
      }),
    });
  });

  it('deve reportar erro de validação corretamente', () => {
    const { result } = renderHook(() => useErrorReporter(), { wrapper });

    act(() => {
      result.current.reportValidationError('Validation failed', { field: 'email', errors: { email: 'Email inválido' } });
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'ADD_ERROR',
      payload: expect.objectContaining({
        type: 'VALIDATION_ERROR',
        message: 'Validation failed',
        severity: 'medium',
        context: { field: 'email', errors: { email: 'Email inválido' } },
        id: expect.any(String),
        timestamp: expect.any(Number),
      }),
    });
  });

  it('deve reportar erro de permissão corretamente', () => {
    const { result } = renderHook(() => useErrorReporter(), { wrapper });

    act(() => {
      result.current.reportPermissionError('Acesso negado', { permission: 'camera' });
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'ADD_ERROR',
      payload: expect.objectContaining({
        type: 'PERMISSION_ERROR',
        message: 'Acesso negado',
        severity: 'high',
        context: { permission: 'camera' },
        id: expect.any(String),
        timestamp: expect.any(Number),
      }),
    });
  });

  it('deve reportar erro de storage corretamente', () => {
    const { result } = renderHook(() => useErrorReporter(), { wrapper });

    act(() => {
      result.current.reportStorageError('Storage full', { operation: 'save_photo' });
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'ADD_ERROR',
      payload: expect.objectContaining({
        type: 'STORAGE_ERROR',
        message: 'Storage full',
        severity: 'medium',
        context: { operation: 'save_photo' },
        id: expect.any(String),
        timestamp: expect.any(Number),
      }),
    });
  });

  it('deve reportar erro de mídia corretamente', () => {
    const { result } = renderHook(() => useErrorReporter(), { wrapper });

    act(() => {
      result.current.reportMediaError('Media error', { type: 'video', size: 1024000 });
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'ADD_ERROR',
      payload: expect.objectContaining({
        type: 'MEDIA_ERROR',
        message: 'Media error',
        severity: 'low',
        context: { type: 'video', size: 1024000 },
        id: expect.any(String),
        timestamp: expect.any(Number),
      }),
    });
  });

  it('deve reportar erro desconhecido corretamente', () => {
    const { result } = renderHook(() => useErrorReporter(), { wrapper });

    const error = new Error('Unknown error');

    act(() => {
      result.current.reportUnknownError(error, { source: 'test' });
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'ADD_ERROR',
      payload: expect.objectContaining({
        type: 'UNKNOWN_ERROR',
        message: 'Unknown error',
        severity: 'high',
        context: { source: 'test' },
        id: expect.any(String),
        timestamp: expect.any(Number),
      }),
    });
  });
});

describe('useErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDispatch.mockClear();
  });

  it('deve capturar erro e reportar corretamente', () => {
    const { result } = renderHook(() => useErrorBoundary(), { wrapper });

    const error = new Error('Component error');

    act(() => {
      result.current.captureError(error, { componentStack: 'Component stack trace' });
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'ADD_ERROR',
      payload: expect.objectContaining({
        type: 'COMPONENT_ERROR',
        message: 'Erro no componente: Component error',
        severity: 'high',
        context: expect.objectContaining({
          componentStack: 'Component stack trace',
          errorBoundary: true,
        }),
        id: expect.any(String),
        timestamp: expect.any(Number),
      }),
    });
  });

  it('deve retornar função captureError', () => {
    const { result } = renderHook(() => useErrorBoundary(), { wrapper });

    expect(typeof result.current.captureError).toBe('function');
  });




});