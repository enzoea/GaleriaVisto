// Tipos base para o domínio de fotos
export type PhotoId = string;

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  country?: string;
}

export interface PhotoMetadata {
  width?: number;
  height?: number;
  size?: number;
  format?: string;
  orientation?: 'portrait' | 'landscape' | 'square';
  exif?: {
    camera?: string;
    lens?: string;
    iso?: number;
    aperture?: string;
    shutterSpeed?: string;
    focalLength?: string;
  };
}

export interface Photo {
  id: PhotoId;
  uri: string;
  timestamp: number;
  title?: string;
  description?: string;
  location?: Location;
  metadata?: PhotoMetadata;
  tags?: string[];
  isFavorite?: boolean;
  isDeleted?: boolean;
  createdAt: number;
  updatedAt: number;
}

// Tipos para operações de busca e filtros
export interface PhotoFilter {
  searchText?: string;
  dateFrom?: Date;
  dateTo?: Date;
  hasLocation?: boolean;
  isFavorite?: boolean;
  tags?: string[];
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // em metros
  };
}

export interface PhotoSortOptions {
  field: 'timestamp' | 'title' | 'createdAt' | 'updatedAt';
  direction: 'asc' | 'desc';
}

// Tipos para operações de resultado
export interface OperationResult<T = void> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Tipos para criação e atualização
export interface CreatePhotoInput {
  uri: string;
  title?: string;
  description?: string;
  location?: Location;
  metadata?: PhotoMetadata;
  tags?: string[];
}

export interface UpdatePhotoInput {
  id: string;
  title?: string;
  description?: string;
  location?: Location;
  tags?: string[];
  isFavorite?: boolean;
}

// Tipos para estatísticas
export interface PhotoStats {
  total: number;
  withLocation: number;
  withTags: number;
  favorites: number;
  totalSize: number;
  averageSize: number;
  oldestPhoto?: Photo;
  newestPhoto?: Photo;
}
