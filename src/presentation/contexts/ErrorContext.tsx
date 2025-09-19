import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';

// Tipos de erro
export type ErrorType = 
  | 'network'
  | 'storage'
  | 'permission'
  | 'validation'
  | 'unknown'
  | 'photo_operation'
  | 'file_system'
  | 'camera'
  | 'location';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AppError {
  id: string;
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  details?: string;
  timestamp: number;
  context?: Record<string, any>;
  stack?: string;
  userAction?: string;
  retryable?: boolean;
  retryCount?: number;
  maxRetries?: number;
}

export interface ErrorAction {
  label: string;
  action: () => void | Promise<void>;
  style?: 'default' | 'cancel' | 'destructive';
}

// Estado do contexto de erro
interface ErrorState {
  errors: AppError[];
  currentError: AppError | null;
  isShowingError: boolean;
  globalErrorHandler: boolean;
}

// Ações do reducer
type ErrorActionType =
  | { type: 'ADD_ERROR'; payload: AppError }
  | { type: 'REMOVE_ERROR'; payload: string }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'SET_CURRENT_ERROR'; payload: AppError | null }
  | { type: 'SET_SHOWING_ERROR'; payload: boolean }
  | { type: 'INCREMENT_RETRY_COUNT'; payload: string }
  | { type: 'SET_GLOBAL_HANDLER'; payload: boolean };

// Interface do contexto
interface ErrorContextType {
  state: ErrorState;
  
  // Métodos principais
  reportError: (error: Partial<AppError> & { message: string; type: ErrorType }) => string;
  clearError: (errorId: string) => void;
  clearAllErrors: () => void;
  retryOperation: (errorId: string, operation: () => Promise<void>) => Promise<void>;
  
  // Métodos de exibição
  showError: (error: AppError, actions?: ErrorAction[]) => void;
  hideError: () => void;
  
  // Configuração
  setGlobalErrorHandler: (enabled: boolean) => void;
  
  // Utilitários
  getErrorsByType: (type: ErrorType) => AppError[];
  getErrorsBySeverity: (severity: ErrorSeverity) => AppError[];
  hasErrors: () => boolean;
  getLatestError: () => AppError | null;
}

// Estado inicial
const initialState: ErrorState = {
  errors: [],
  currentError: null,
  isShowingError: false,
  globalErrorHandler: true,
};

// Reducer
function errorReducer(state: ErrorState, action: ErrorActionType): ErrorState {
  switch (action.type) {
    case 'ADD_ERROR':
      return {
        ...state,
        errors: [action.payload, ...state.errors.slice(0, 49)], // Manter apenas 50 erros
      };
      
    case 'REMOVE_ERROR':
      return {
        ...state,
        errors: state.errors.filter(error => error.id !== action.payload),
        currentError: state.currentError?.id === action.payload ? null : state.currentError,
      };
      
    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: [],
        currentError: null,
        isShowingError: false,
      };
      
    case 'SET_CURRENT_ERROR':
      return {
        ...state,
        currentError: action.payload,
      };
      
    case 'SET_SHOWING_ERROR':
      return {
        ...state,
        isShowingError: action.payload,
      };
      
    case 'INCREMENT_RETRY_COUNT':
      return {
        ...state,
        errors: state.errors.map(error =>
          error.id === action.payload
            ? { ...error, retryCount: (error.retryCount || 0) + 1 }
            : error
        ),
      };
      
    case 'SET_GLOBAL_HANDLER':
      return {
        ...state,
        globalErrorHandler: action.payload,
      };
      
    default:
      return state;
  }
}

// Contexto
const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

// Provider
interface ErrorProviderProps {
  children: React.ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(errorReducer, initialState);

  // Gerador de ID único
  const generateErrorId = useCallback(() => {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Mapear tipos de erro para mensagens amigáveis
  const getErrorMessage = useCallback((error: AppError): string => {
    const baseMessage = error.message;
    
    switch (error.type) {
      case 'network':
        return 'Problema de conexão. Verifique sua internet e tente novamente.';
      case 'storage':
        return 'Erro ao acessar o armazenamento. Verifique o espaço disponível.';
      case 'permission':
        return 'Permissão necessária. Verifique as configurações do app.';
      case 'validation':
        return baseMessage || 'Dados inválidos fornecidos.';
      case 'photo_operation':
        return 'Erro ao processar foto. Tente novamente.';
      case 'file_system':
        return 'Erro no sistema de arquivos. Verifique o armazenamento.';
      case 'camera':
        return 'Erro na câmera. Verifique as permissões e tente novamente.';
      case 'location':
        return 'Erro ao obter localização. Verifique as permissões de GPS.';
      default:
        return baseMessage || 'Ocorreu um erro inesperado.';
    }
  }, []);

  // Reportar erro
  const reportError = useCallback((errorInput: Partial<AppError> & { message: string; type: ErrorType }): string => {
    const errorId = generateErrorId();
    
    const error: AppError = {
      id: errorId,
      type: errorInput.type,
      severity: errorInput.severity || 'medium',
      message: errorInput.message,
      details: errorInput.details,
      timestamp: Date.now(),
      context: errorInput.context,
      stack: errorInput.stack,
      userAction: errorInput.userAction,
      retryable: errorInput.retryable || false,
      retryCount: 0,
      maxRetries: errorInput.maxRetries || 3,
    };

    dispatch({ type: 'ADD_ERROR', payload: error });

    // Auto-exibir erros críticos ou de alta severidade
    if (state.globalErrorHandler && (error.severity === 'critical' || error.severity === 'high')) {
      showError(error);
    }

    // Log do erro para desenvolvimento
    if (__DEV__) {
      console.error('Error reported:', error);
    }

    return errorId;
  }, [generateErrorId, state.globalErrorHandler]);

  // Limpar erro específico
  const clearError = useCallback((errorId: string) => {
    dispatch({ type: 'REMOVE_ERROR', payload: errorId });
  }, []);

  // Limpar todos os erros
  const clearAllErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ERRORS' });
  }, []);

  // Tentar novamente operação
  const retryOperation = useCallback(async (errorId: string, operation: () => Promise<void>) => {
    const error = state.errors.find(e => e.id === errorId);
    
    if (!error || !error.retryable) {
      return;
    }

    if ((error.retryCount || 0) >= (error.maxRetries || 3)) {
      reportError({
        type: error.type,
        severity: 'high',
        message: 'Máximo de tentativas excedido',
        details: `Operação falhou após ${error.maxRetries} tentativas`,
        context: { originalErrorId: errorId },
      });
      return;
    }

    dispatch({ type: 'INCREMENT_RETRY_COUNT', payload: errorId });

    try {
      await operation();
      clearError(errorId);
    } catch (retryError) {
      reportError({
        type: error.type,
        severity: error.severity,
        message: retryError instanceof Error ? retryError.message : 'Erro na tentativa',
        details: `Tentativa ${(error.retryCount || 0) + 1} de ${error.maxRetries}`,
        context: { originalErrorId: errorId, retryError },
        retryable: true,
      });
    }
  }, [state.errors, reportError, clearError]);

  // Exibir erro
  const showError = useCallback((error: AppError, actions?: ErrorAction[]) => {
    dispatch({ type: 'SET_CURRENT_ERROR', payload: error });
    dispatch({ type: 'SET_SHOWING_ERROR', payload: true });

    const message = getErrorMessage(error);
    const title = error.severity === 'critical' ? 'Erro Crítico' : 
                  error.severity === 'high' ? 'Erro' : 
                  error.severity === 'medium' ? 'Atenção' : 'Aviso';

    const alertActions = [
      ...(actions || []).map(action => ({
        text: action.label,
        onPress: action.action,
        style: action.style,
      })),
    ];

    // Adicionar ação de retry se aplicável
    if (error.retryable && (error.retryCount || 0) < (error.maxRetries || 3)) {
      alertActions.unshift({
        text: 'Tentar Novamente',
        onPress: () => {
          // Implementar retry genérico se necessário
          hideError();
        },
      });
    }

    // Adicionar ação de fechar
    alertActions.push({
      text: 'OK',
      onPress: hideError,
      style: 'cancel' as const,
    });

    Alert.alert(title, message, alertActions);
  }, [getErrorMessage]);

  // Ocultar erro
  const hideError = useCallback(() => {
    dispatch({ type: 'SET_SHOWING_ERROR', payload: false });
    dispatch({ type: 'SET_CURRENT_ERROR', payload: null });
  }, []);

  // Configurar handler global
  const setGlobalErrorHandler = useCallback((enabled: boolean) => {
    dispatch({ type: 'SET_GLOBAL_HANDLER', payload: enabled });
  }, []);

  // Utilitários
  const getErrorsByType = useCallback((type: ErrorType): AppError[] => {
    return state.errors.filter(error => error.type === type);
  }, [state.errors]);

  const getErrorsBySeverity = useCallback((severity: ErrorSeverity): AppError[] => {
    return state.errors.filter(error => error.severity === severity);
  }, [state.errors]);

  const hasErrors = useCallback((): boolean => {
    return state.errors.length > 0;
  }, [state.errors]);

  const getLatestError = useCallback((): AppError | null => {
    return state.errors[0] || null;
  }, [state.errors]);

  // Handler global de erros não capturados
  useEffect(() => {
    if (!state.globalErrorHandler) return;

    const handleError = (error: Error) => {
      reportError({
        type: 'unknown',
        severity: 'high',
        message: error.message,
        stack: error.stack,
        details: 'Erro não capturado',
      });
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      reportError({
        type: 'unknown',
        severity: 'high',
        message: event.reason?.message || 'Promise rejeitada',
        details: 'Promise rejection não capturada',
        context: { reason: event.reason },
      });
    };

    // Note: React Native não tem window.addEventListener para estes eventos
    // Implementar conforme necessário para React Native

    return () => {
      // Cleanup se necessário
    };
  }, [state.globalErrorHandler, reportError]);

  const contextValue: ErrorContextType = {
    state,
    reportError,
    clearError,
    clearAllErrors,
    retryOperation,
    showError,
    hideError,
    setGlobalErrorHandler,
    getErrorsByType,
    getErrorsBySeverity,
    hasErrors,
    getLatestError,
  };

  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
    </ErrorContext.Provider>
  );
};

// Hook para usar o contexto
export const useErrorHandler = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useErrorHandler deve ser usado dentro de um ErrorProvider');
  }
  return context;
};

// Hook simplificado para reportar erros
export const useErrorReporter = () => {
  const { reportError } = useErrorHandler();
  
  return useCallback((
    message: string,
    type: ErrorType = 'unknown',
    severity: ErrorSeverity = 'medium',
    options?: Partial<AppError>
  ) => {
    return reportError({
      message,
      type,
      severity,
      ...options,
    });
  }, [reportError]);
};

// Hook para operações com tratamento automático de erro
export const useErrorBoundary = () => {
  const { reportError } = useErrorHandler();
  
  const executeWithErrorBoundary = async <T,>(
    operation: () => Promise<T>,
    errorType: ErrorType = 'unknown',
    errorMessage?: string
  ): Promise<T | null> => {
    try {
      return await operation();
    } catch (error) {
      reportError({
        type: errorType,
        severity: 'medium',
        message: errorMessage || (error instanceof Error ? error.message : 'Operação falhou'),
        stack: error instanceof Error ? error.stack : undefined,
        retryable: true,
      });
      return null;
    }
  };

  return executeWithErrorBoundary;
};