// Configurações da aplicação
export const APP_CONFIG = {
  NAME: 'Galeria Visto',
  VERSION: '1.0.0',
  BUILD_NUMBER: 1,
} as const;

// Configurações de fotos
export const PHOTO_CONFIG = {
  MAX_PHOTOS_PER_PAGE: 20,
  MAX_PHOTO_SIZE_MB: 10,
  SUPPORTED_FORMATS: ['jpg', 'jpeg', 'png', 'webp'] as const,
  THUMBNAIL_SIZE: 200,
  PREVIEW_SIZE: 800,
  QUALITY: {
    THUMBNAIL: 0.7,
    PREVIEW: 0.8,
    ORIGINAL: 1.0,
  },
} as const;

// Configurações de cache
export const CACHE_CONFIG = {
  MAX_CACHE_SIZE_MB: 100,
  CACHE_EXPIRY_HOURS: 24,
  PRELOAD_DISTANCE: 5, // Número de fotos para pré-carregar
  DEFAULT_TTL: 24 * 60 * 60 * 1000, // 24 horas em milissegundos
  PHOTO_TTL: 7 * 24 * 60 * 60 * 1000, // 7 dias em milissegundos
  PHOTO_LIST_TTL: 60 * 60 * 1000, // 1 hora em milissegundos
} as const;

// Configurações de rede
export const NETWORK_CONFIG = {
  TIMEOUT_MS: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
} as const;

// Configurações de analytics
export const ANALYTICS_CONFIG = {
  BATCH_SIZE: 10,
  FLUSH_INTERVAL_MS: 30000,
  MAX_EVENTS_STORED: 100,
} as const;

// Configurações de acessibilidade
export const A11Y_CONFIG = {
  MIN_TOUCH_TARGET_SIZE: 44,
  FOCUS_TIMEOUT_MS: 100,
  SCREEN_READER_DELAY_MS: 500,
} as const;

// Chaves de storage
export const STORAGE_KEYS = {
  PHOTOS: '@galeria_visto:photos',
  SETTINGS: '@galeria_visto:settings',
  THEME: '@galeria_visto:theme',
  CACHE: '@galeria_visto:cache',
  ANALYTICS: '@galeria_visto:analytics',
  OFFLINE_QUEUE: '@galeria_visto:offline_queue',
  OFFLINE_ACTIONS: '@galeria_visto:offline_actions',
  LAST_SYNC_TIME: '@galeria_visto:last_sync_time',
  OFFLINE_CACHE: '@galeria_visto:offline_cache',
} as const;

// Eventos de analytics
export const ANALYTICS_EVENTS = {
  // Eventos de foto
  PHOTO_CAPTURED: 'photo_captured',
  PHOTO_VIEWED: 'photo_viewed',
  PHOTO_SHARED: 'photo_shared',
  PHOTO_DELETED: 'photo_deleted',
  PHOTO_FAVORITED: 'photo_favorited',
  PHOTO_EDITED: 'photo_edited',
  
  // Eventos de navegação
  SCREEN_VIEWED: 'screen_viewed',
  GALLERY_OPENED: 'gallery_opened',
  SEARCH_PERFORMED: 'search_performed',
  FILTER_APPLIED: 'filter_applied',
  
  // Eventos de sistema
  APP_OPENED: 'app_opened',
  APP_BACKGROUNDED: 'app_backgrounded',
  PERMISSION_REQUESTED: 'permission_requested',
  ERROR_OCCURRED: 'error_occurred',
  
  // Eventos de performance
  LOAD_TIME_MEASURED: 'load_time_measured',
  MEMORY_WARNING: 'memory_warning',
  NETWORK_ERROR: 'network_error',
} as const;

// Tipos de erro
export const ERROR_TYPES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  STORAGE_ERROR: 'STORAGE_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MEDIA_ERROR: 'MEDIA_ERROR',
  COMPONENT_ERROR: 'COMPONENT_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

// Severidade de erros
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

// Configurações de tema
export const THEME_CONFIG = {
  ANIMATION_DURATION: 200,
  TRANSITION_EASING: 'ease-in-out',
  DARK_MODE_THRESHOLD: 18, // Hora para ativar modo escuro automaticamente
} as const;

// Configurações de localização
export const LOCATION_CONFIG = {
  ACCURACY: 'high' as const,
  TIMEOUT_MS: 15000,
  MAX_AGE_MS: 300000, // 5 minutos
  DISTANCE_FILTER: 10, // metros
} as const;

// Configurações de backup
export const BACKUP_CONFIG = {
  AUTO_BACKUP_INTERVAL_HOURS: 24,
  MAX_BACKUP_FILES: 5,
  COMPRESSION_QUALITY: 0.8,
} as const;

// Regex patterns
export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-\(\)]+$/,
  COORDINATES: /^-?\d+\.?\d*,-?\d+\.?\d*$/,
} as const;

// Mensagens padrão
export const MESSAGES = {
  ERRORS: {
    NETWORK: 'Erro de conexão. Verifique sua internet.',
    PERMISSION: 'Permissão necessária para continuar.',
    STORAGE: 'Erro ao acessar armazenamento.',
    VALIDATION: 'Dados inválidos fornecidos.',
    MEDIA: 'Erro ao processar mídia.',
    UNKNOWN: 'Erro inesperado. Tente novamente.',
  },
  SUCCESS: {
    PHOTO_SAVED: 'Foto salva com sucesso!',
    PHOTO_DELETED: 'Foto excluída com sucesso!',
    BACKUP_CREATED: 'Backup criado com sucesso!',
    SETTINGS_SAVED: 'Configurações salvas!',
  },
  LOADING: {
    PHOTOS: 'Carregando fotos...',
    SAVING: 'Salvando...',
    DELETING: 'Excluindo...',
    PROCESSING: 'Processando...',
  },
} as const;

// Configurações de desenvolvimento
export const DEV_CONFIG = {
  ENABLE_LOGGING: __DEV__,
  ENABLE_PERFORMANCE_MONITORING: __DEV__,
  ENABLE_REDUX_DEVTOOLS: __DEV__,
  MOCK_DELAYS: __DEV__,
} as const;