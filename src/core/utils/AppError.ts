export enum ErrorCode {
  // Photo related errors
  PHOTO_NOT_FOUND = 'PHOTO_NOT_FOUND',
  PHOTO_SAVE_FAILED = 'PHOTO_SAVE_FAILED',
  PHOTO_DELETE_FAILED = 'PHOTO_DELETE_FAILED',
  PHOTO_UPDATE_FAILED = 'PHOTO_UPDATE_FAILED',
  PHOTO_LOAD_FAILED = 'PHOTO_LOAD_FAILED',
  
  // File system errors
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  FILE_ACCESS_DENIED = 'FILE_ACCESS_DENIED',
  STORAGE_FULL = 'STORAGE_FULL',
  
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  
  // Permission errors
  CAMERA_PERMISSION_DENIED = 'CAMERA_PERMISSION_DENIED',
  LOCATION_PERMISSION_DENIED = 'LOCATION_PERMISSION_DENIED',
  STORAGE_PERMISSION_DENIED = 'STORAGE_PERMISSION_DENIED',
  
  // Validation errors
  INVALID_INPUT = 'INVALID_INPUT',
  INVALID_FILE_FORMAT = 'INVALID_FILE_FORMAT',
  
  // Generic errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode?: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
    statusCode?: number,
    isOperational: boolean = true,
    context?: Record<string, any>
  ) {
    super(message);
    
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;

    // Mantém o stack trace correto
    Error.captureStackTrace(this, AppError);
  }

  /**
   * Cria um erro de foto não encontrada
   */
  static photoNotFound(photoId: string): AppError {
    return new AppError(
      `Foto com ID ${photoId} não foi encontrada`,
      ErrorCode.PHOTO_NOT_FOUND,
      404,
      true,
      { photoId }
    );
  }

  /**
   * Cria um erro de falha ao salvar foto
   */
  static photoSaveFailed(reason?: string): AppError {
    return new AppError(
      `Falha ao salvar foto${reason ? `: ${reason}` : ''}`,
      ErrorCode.PHOTO_SAVE_FAILED,
      500,
      true,
      { reason }
    );
  }

  /**
   * Cria um erro de permissão negada
   */
  static permissionDenied(permission: string): AppError {
    const codeMap: Record<string, ErrorCode> = {
      camera: ErrorCode.CAMERA_PERMISSION_DENIED,
      location: ErrorCode.LOCATION_PERMISSION_DENIED,
      storage: ErrorCode.STORAGE_PERMISSION_DENIED,
    };

    return new AppError(
      `Permissão de ${permission} foi negada`,
      codeMap[permission] || ErrorCode.UNKNOWN_ERROR,
      403,
      true,
      { permission }
    );
  }

  /**
   * Cria um erro de validação
   */
  static validationError(field: string, value: any): AppError {
    return new AppError(
      `Valor inválido para o campo ${field}`,
      ErrorCode.INVALID_INPUT,
      400,
      true,
      { field, value }
    );
  }

  /**
   * Converte um erro desconhecido em AppError
   */
  static fromUnknown(error: unknown, context?: Record<string, any>): AppError {
    if (error instanceof AppError) {
      return error;
    }

    if (error instanceof Error) {
      return new AppError(
        error.message,
        ErrorCode.UNKNOWN_ERROR,
        500,
        false,
        { ...context, originalError: error.name }
      );
    }

    return new AppError(
      'Erro desconhecido',
      ErrorCode.UNKNOWN_ERROR,
      500,
      false,
      { ...context, originalError: String(error) }
    );
  }
}