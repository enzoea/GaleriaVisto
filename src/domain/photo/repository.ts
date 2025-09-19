import {
  Photo,
  PhotoId,
  CreatePhotoInput,
  UpdatePhotoInput,
  PhotoFilter,
  PhotoSortOptions,
  OperationResult,
  PaginatedResult,
  PhotoStats,
} from './types';

// Interface principal do repositório de fotos
export interface PhotoRepository {
  // Operações básicas CRUD
  create(input: CreatePhotoInput): Promise<OperationResult<Photo>>;
  findById(id: PhotoId): Promise<OperationResult<Photo>>;
  update(input: UpdatePhotoInput): Promise<OperationResult<Photo>>;
  delete(id: PhotoId): Promise<OperationResult<void>>;
  
  // Operações de listagem e busca
  findAll(options?: {
    filter?: PhotoFilter;
    sort?: PhotoSortOptions;
    pagination?: {
      page: number;
      pageSize: number;
    };
  }): Promise<OperationResult<PaginatedResult<Photo>>>;
  
  // Operações específicas
  findByLocation(
    latitude: number,
    longitude: number,
    radius: number
  ): Promise<OperationResult<Photo[]>>;
  
  findByTags(tags: string[]): Promise<OperationResult<Photo[]>>;
  findFavorites(): Promise<OperationResult<Photo[]>>;
  
  // Operações de estatísticas
  getStats(): Promise<OperationResult<PhotoStats>>;
  
  // Operações de manutenção
  cleanup(): Promise<OperationResult<{ deletedCount: number }>>;
  backup(): Promise<OperationResult<{ backupPath: string }>>;
  restore(backupPath: string): Promise<OperationResult<{ restoredCount: number }>>;
}

// Interface para cache de fotos
export interface PhotoCacheRepository {
  get(key: string): Promise<Photo | null>;
  set(key: string, photo: Photo, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
}

// Interface para sincronização
export interface PhotoSyncRepository {
  sync(): Promise<OperationResult<{ syncedCount: number }>>;
  getLastSyncTime(): Promise<number>;
  markForSync(photoId: PhotoId): Promise<void>;
  getPendingSync(): Promise<PhotoId[]>;
}

// Interface para operações de arquivo
export interface PhotoFileRepository {
  saveFile(uri: string, filename?: string): Promise<OperationResult<string>>;
  deleteFile(uri: string): Promise<OperationResult<void>>;
  getFileInfo(uri: string): Promise<OperationResult<{
    size: number;
    exists: boolean;
    lastModified: number;
  }>>;
  copyFile(source: string, destination: string): Promise<OperationResult<void>>;
  moveFile(source: string, destination: string): Promise<OperationResult<void>>;
}

// Interface para metadados
export interface PhotoMetadataRepository {
  extractMetadata(uri: string): Promise<OperationResult<any>>;
  updateMetadata(photoId: PhotoId, metadata: any): Promise<OperationResult<void>>;
  getMetadata(photoId: PhotoId): Promise<OperationResult<any>>;
}

// Interface agregada para todas as operações
export interface PhotoService {
  repository: PhotoRepository;
  cache: PhotoCacheRepository;
  sync: PhotoSyncRepository;
  files: PhotoFileRepository;
  metadata: PhotoMetadataRepository;
}

// Tipos para eventos do repositório
export interface PhotoRepositoryEvents {
  'photo:created': (photo: Photo) => void;
  'photo:updated': (photo: Photo) => void;
  'photo:deleted': (photoId: PhotoId) => void;
  'photos:synced': (count: number) => void;
  'error': (error: Error) => void;
}

// Interface para observadores
export interface PhotoRepositoryObserver {
  on<K extends keyof PhotoRepositoryEvents>(
    event: K,
    listener: PhotoRepositoryEvents[K]
  ): void;
  off<K extends keyof PhotoRepositoryEvents>(
    event: K,
    listener: PhotoRepositoryEvents[K]
  ): void;
  emit<K extends keyof PhotoRepositoryEvents>(
    event: K,
    ...args: Parameters<PhotoRepositoryEvents[K]>
  ): void;
}