import { useCallback } from 'react';
import { Alert } from 'react-native';
import { AppError, ErrorCode } from '../../core/utils/AppError';

interface ErrorHandlerOptions {
  showAlert?: boolean;
  customTitle?: string;
  onError?: (error: AppError) => void;
}

export const useErrorHandler = () => {
  const getErrorMessage = useCallback((error: AppError): string => {
    switch (error.code) {
      case ErrorCode.PHOTO_NOT_FOUND:
        return 'Foto não encontrada. Ela pode ter sido removida.';
      
      case ErrorCode.PHOTO_SAVE_FAILED:
        return 'Não foi possível salvar a foto. Verifique o espaço disponível.';
      
      case ErrorCode.PHOTO_DELETE_FAILED:
        return 'Não foi possível deletar a foto. Tente novamente.';
      
      case ErrorCode.PHOTO_UPDATE_FAILED:
        return 'Não foi possível atualizar a foto. Tente novamente.';
      
      case ErrorCode.PHOTO_LOAD_FAILED:
        return 'Erro ao carregar fotos. Verifique sua conexão.';
      
      case ErrorCode.FILE_NOT_FOUND:
        return 'Arquivo não encontrado. Ele pode ter sido movido ou deletado.';
      
      case ErrorCode.FILE_ACCESS_DENIED:
        return 'Acesso negado ao arquivo. Verifique as permissões.';
      
      case ErrorCode.STORAGE_FULL:
        return 'Espaço de armazenamento insuficiente. Libere espaço e tente novamente.';
      
      case ErrorCode.NETWORK_ERROR:
        return 'Erro de conexão. Verifique sua internet e tente novamente.';
      
      case ErrorCode.TIMEOUT_ERROR:
        return 'Operação demorou muito para responder. Tente novamente.';
      
      case ErrorCode.CAMERA_PERMISSION_DENIED:
        return 'Permissão de câmera negada. Ative nas configurações do app.';
      
      case ErrorCode.LOCATION_PERMISSION_DENIED:
        return 'Permissão de localização negada. Ative nas configurações do app.';
      
      case ErrorCode.STORAGE_PERMISSION_DENIED:
        return 'Permissão de armazenamento negada. Ative nas configurações do app.';
      
      case ErrorCode.INVALID_INPUT:
        return 'Dados inválidos fornecidos. Verifique as informações.';
      
      case ErrorCode.INVALID_FILE_FORMAT:
        return 'Formato de arquivo não suportado. Use JPG, PNG ou similar.';
      
      case ErrorCode.UNKNOWN_ERROR:
      default:
        return error.message || 'Ocorreu um erro inesperado. Tente novamente.';
    }
  }, []);

  const getErrorTitle = useCallback((error: AppError): string => {
    switch (error.code) {
      case ErrorCode.PHOTO_NOT_FOUND:
      case ErrorCode.PHOTO_SAVE_FAILED:
      case ErrorCode.PHOTO_DELETE_FAILED:
      case ErrorCode.PHOTO_UPDATE_FAILED:
      case ErrorCode.PHOTO_LOAD_FAILED:
        return 'Erro com Foto';
      
      case ErrorCode.FILE_NOT_FOUND:
      case ErrorCode.FILE_ACCESS_DENIED:
      case ErrorCode.STORAGE_FULL:
        return 'Erro de Arquivo';
      
      case ErrorCode.NETWORK_ERROR:
      case ErrorCode.TIMEOUT_ERROR:
        return 'Erro de Conexão';
      
      case ErrorCode.CAMERA_PERMISSION_DENIED:
      case ErrorCode.LOCATION_PERMISSION_DENIED:
      case ErrorCode.STORAGE_PERMISSION_DENIED:
        return 'Permissão Necessária';
      
      case ErrorCode.INVALID_INPUT:
      case ErrorCode.INVALID_FILE_FORMAT:
        return 'Dados Inválidos';
      
      default:
        return 'Erro';
    }
  }, []);

  const handleError = useCallback((
    error: AppError | Error | unknown,
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showAlert = true,
      customTitle,
      onError
    } = options;

    // Converter para AppError se necessário
    const appError = error instanceof AppError 
      ? error 
      : AppError.fromUnknown(error);

    // Log do erro para debugging
    console.error('Error handled:', {
      code: appError.code,
      message: appError.message,
      context: appError.context,
      stack: appError.stack
    });

    // Callback customizado
    if (onError) {
      onError(appError);
    }

    // Mostrar alert se solicitado
    if (showAlert) {
      const title = customTitle || getErrorTitle(appError);
      const message = getErrorMessage(appError);

      Alert.alert(
        title,
        message,
        [
          {
            text: 'OK',
            style: 'default'
          }
        ],
        { cancelable: true }
      );
    }

    return appError;
  }, [getErrorMessage, getErrorTitle]);

  const handleErrorWithRetry = useCallback((
    error: AppError | Error | unknown,
    retryAction: () => void | Promise<void>,
    options: ErrorHandlerOptions = {}
  ) => {
    const appError = handleError(error, { ...options, showAlert: false });
    
    const title = options.customTitle || getErrorTitle(appError);
    const message = getErrorMessage(appError);

    Alert.alert(
      title,
      message,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Tentar Novamente',
          style: 'default',
          onPress: () => {
            try {
              const result = retryAction();
              if (result instanceof Promise) {
                result.catch(retryError => handleError(retryError, options));
              }
            } catch (retryError) {
              handleError(retryError, options);
            }
          }
        }
      ],
      { cancelable: true }
    );

    return appError;
  }, [handleError, getErrorMessage, getErrorTitle]);

  const isPermissionError = useCallback((error: AppError): boolean => {
    return [
      ErrorCode.CAMERA_PERMISSION_DENIED,
      ErrorCode.LOCATION_PERMISSION_DENIED,
      ErrorCode.STORAGE_PERMISSION_DENIED
    ].includes(error.code);
  }, []);

  const isNetworkError = useCallback((error: AppError): boolean => {
    return [
      ErrorCode.NETWORK_ERROR,
      ErrorCode.TIMEOUT_ERROR
    ].includes(error.code);
  }, []);

  const isRecoverableError = useCallback((error: AppError): boolean => {
    return error.isOperational && ![
      ErrorCode.CAMERA_PERMISSION_DENIED,
      ErrorCode.LOCATION_PERMISSION_DENIED,
      ErrorCode.STORAGE_PERMISSION_DENIED,
      ErrorCode.INVALID_FILE_FORMAT
    ].includes(error.code);
  }, []);

  return {
    handleError,
    handleErrorWithRetry,
    getErrorMessage,
    getErrorTitle,
    isPermissionError,
    isNetworkError,
    isRecoverableError
  };
};