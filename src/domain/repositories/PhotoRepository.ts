import { Photo, Location } from '../photo/Photo';

export interface PhotoFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // em metros
  };
  hasTitle?: boolean;
  searchText?: string;
}

export interface PhotoSortOptions {
  field: 'timestamp' | 'title' | 'location';
  direction: 'asc' | 'desc';
}

export interface PhotoRepository {
  /**
   * Salva uma nova foto no repositório
   */
  savePhoto(photoUri: string, location?: Location, title?: string): Promise<Photo>;
  
  /**
   * Recupera todas as fotos do repositório
   */
  getAllPhotos(): Promise<Photo[]>;
  
  /**
   * Recupera fotos com filtros e ordenação
   */
  getPhotos(filters?: PhotoFilters, sort?: PhotoSortOptions): Promise<Photo[]>;
  
  /**
   * Recupera uma foto específica por ID
   */
  getPhotoById(id: string): Promise<Photo | null>;
  
  /**
   * Atualiza uma foto existente
   */
  updatePhoto(id: string, updates: Partial<Omit<Photo, 'id' | 'timestamp'>>): Promise<Photo>;
  
  /**
   * Remove uma foto do repositório
   */
  deletePhoto(id: string): Promise<void>;
  
  /**
   * Remove múltiplas fotos
   */
  deletePhotos(ids: string[]): Promise<void>;
  
  /**
   * Verifica se uma foto existe
   */
  photoExists(id: string): Promise<boolean>;
  
  /**
   * Conta o total de fotos
   */
  getPhotosCount(filters?: PhotoFilters): Promise<number>;
  
  /**
   * Limpa todas as fotos (usar com cuidado)
   */
  clearAllPhotos(): Promise<void>;
}