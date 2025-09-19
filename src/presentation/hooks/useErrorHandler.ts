import { useContext, useCallback } from 'react';
import { ErrorContext } from '../contexts/ErrorContext';
import { AppError, ErrorType, ErrorSeverity } from '../contexts/ErrorContext';

export interface UseErrorHandlerReturn {
  reportError: (error: Partial<AppError>) => void;
  clearError: (id: string) => void;
  clearAllErrors: () => void;
  hasErrors: boolean;
  errors: AppError[];
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const context = useContext(ErrorContext);

  if (!context) {
    throw new Error('useErrorHandler must be used within an ErrorProvider');
  }

  const { state, dispatch } = context;

  const reportError = useCallback((error: Partial<AppError>) => {
    const fullError: AppError = {
      id: error.id || Date.now().toString(),
      type: error.type || 'UNKNOWN_ERROR',
      message: error.message || 'Erro desconhecido',
      severity: error.severity || 'medium',
      timestamp: error.timestamp || Date.now(),
      context: error.context,
      stack: error.stack,
      userAgent: error.userAgent,
    };

    dispatch({ type: 'ADD_ERROR', payload: fullError });
  }, [dispatch]);

  const clearError = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ERROR', payload: id });
  }, [dispatch]);

  const clearAllErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ERRORS' });
  }, [dispatch]);

  return {
    reportError,
    clearError,
    clearAllErrors,
    hasErrors: state.errors.length > 0,
    errors: state.errors,
  };
};

// Hook específico para reportar erros de forma simplificada
export const useErrorReporter = () => {
  const { reportError } = useErrorHandler();

  const reportNetworkError = useCallback((message: string, context?: any) => {
    reportError({
      type: 'NETWORK_ERROR',
      message,
      severity: 'high',
      context,
    });
  }, [reportError]);

  const reportValidationError = useCallback((message: string, context?: any) => {
    reportError({
      type: 'VALIDATION_ERROR',
      message,
      severity: 'medium',
      context,
    });
  }, [reportError]);

  const reportPermissionError = useCallback((message: string, context?: any) => {
    reportError({
      type: 'PERMISSION_ERROR',
      message,
      severity: 'high',
      context,
    });
  }, [reportError]);

  const reportStorageError = useCallback((message: string, context?: any) => {
    reportError({
      type: 'STORAGE_ERROR',
      message,
      severity: 'medium',
      context,
    });
  }, [reportError]);

  const reportMediaError = useCallback((message: string, context?: any) => {
    reportError({
      type: 'MEDIA_ERROR',
      message,
      severity: 'low',
      context,
    });
  }, [reportError]);

  const reportUnknownError = useCallback((error: Error, context?: any) => {
    reportError({
      type: 'UNKNOWN_ERROR',
      message: error.message,
      severity: 'high',
      stack: error.stack,
      context,
    });
  }, [reportError]);

  return {
    reportNetworkError,
    reportValidationError,
    reportPermissionError,
    reportStorageError,
    reportMediaError,
    reportUnknownError,
  };
};

// Hook para boundary de erros
export const useErrorBoundary = () => {
  const { reportError } = useErrorHandler();

  const captureError = useCallback((error: Error, errorInfo?: any) => {
    reportError({
      type: 'COMPONENT_ERROR',
      message: `Erro no componente: ${error.message}`,
      severity: 'high',
      stack: error.stack,
      context: {
        componentStack: errorInfo?.componentStack,
        errorBoundary: true,
      },
    });
  }, [reportError]);

  return { captureError };
};