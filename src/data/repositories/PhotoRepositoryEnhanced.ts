import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { File, Paths } from 'expo-file-system';
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
  Location,
  PhotoMetadata,
} from '../../domain/photo/types';
import { PhotoRepository, PhotoRepositoryObserver } from '../../domain/photo/repository';

const PHOTOS_STORAGE_KEY = '@galeria_visto_photos_v2';
const METADATA_STORAGE_KEY = '@galeria_visto_metadata_v2';

export class PhotoRepositoryEnhanced implements PhotoRepository, PhotoRepositoryObserver {
  private listeners: Map<string, Function[]> = new Map();

  // Implementação do padrão Observer
  on<K extends keyof any>(event: K, listener: Function): void {
    if (!this.listeners.has(event as string)) {
      this.listeners.set(event as string, []);
    }
    this.listeners.get(event as string)!.push(listener);
  }

  off<K extends keyof any>(event: K, listener: Function): void {
    const eventListeners = this.listeners.get(event as string);
    if (eventListeners) {
      const index = eventListeners.indexOf(listener);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  emit<K extends keyof any>(event: K, ...args: any[]): void {
    const eventListeners = this.listeners.get(event as string);
    if (eventListeners) {
      eventListeners.forEach(listener => listener(...args));
    }
  }

  async create(input: CreatePhotoInput): Promise<OperationResult<Photo>> {
    try {
      const now = Date.now();
      const id = `photo_${now}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Salvar arquivo físico
      const fileResult = await this.savePhotoFile(input.uri, id);
      if (!fileResult.success) {
        return {
          success: false,
          error: fileResult.error,
        };
      }

      // Extrair metadados se não fornecidos
      let metadata = input.metadata;
      if (!metadata) {
        const metadataResult = await this.extractBasicMetadata(input.uri);
        if (metadataResult.success) {
          metadata = metadataResult.data;
        }
      }

      const photo: Photo = {
        id,
        uri: fileResult.data!,
        timestamp: now,
        title: input.title,
        description: input.description,
        location: input.location,
        metadata,
        tags: input.tags || [],
        isFavorite: false,
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
      };

      // Salvar no storage
      const photos = await this.loadPhotosFromStorage();
      photos.unshift(photo);
      await this.savePhotosToStorage(photos);

      this.emit('photo:created', photo);
      
      return {
        success: true,
        data: photo,
      };
    } catch (error) {
      const errorResult = {
        success: false,
        error: {
          code: 'CREATE_FAILED',
          message: 'Falha ao criar foto',
          details: error,
        },
      } as OperationResult<Photo>;
      
      this.emit('error', new Error(errorResult.error!.message));
      return errorResult;
    }
  }

  async findById(id: PhotoId): Promise<OperationResult<Photo>> {
    try {
      const photos = await this.loadPhotosFromStorage();
      const photo = photos.find(p => p.id === id && !p.isDeleted);
      
      if (!photo) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Foto não encontrada',
          },
        };
      }

      return {
        success: true,
        data: photo,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'FIND_FAILED',
          message: 'Falha ao buscar foto',
          details: error,
        },
      };
    }
  }

  async update(input: UpdatePhotoInput): Promise<OperationResult<Photo>> {
    try {
      const photos = await this.loadPhotosFromStorage();
      const photoIndex = photos.findIndex(p => p.id === input.id && !p.isDeleted);
      
      if (photoIndex === -1) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Foto não encontrada',
          },
        };
      }

      const updatedPhoto: Photo = {
        ...photos[photoIndex],
        ...input,
        updatedAt: Date.now(),
      };

      photos[photoIndex] = updatedPhoto;
      await this.savePhotosToStorage(photos);

      this.emit('photo:updated', updatedPhoto);

      return {
        success: true,
        data: updatedPhoto,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UPDATE_FAILED',
          message: 'Falha ao atualizar foto',
          details: error,
        },
      };
    }
  }

  async delete(id: PhotoId): Promise<OperationResult<void>> {
    try {
      const photos = await this.loadPhotosFromStorage();
      const photoIndex = photos.findIndex(p => p.id === id);
      
      if (photoIndex === -1) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Foto não encontrada',
          },
        };
      }

      const photo = photos[photoIndex];
      
      // Soft delete
      photo.isDeleted = true;
      photo.updatedAt = Date.now();
      
      await this.savePhotosToStorage(photos);

      // Deletar arquivo físico
      try {
        const file = new File(photo.uri);
        if (file.exists) {
          await file.delete();
        }
      } catch (fileError) {
        console.warn('Erro ao deletar arquivo físico:', fileError);
      }

      this.emit('photo:deleted', id);

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DELETE_FAILED',
          message: 'Falha ao deletar foto',
          details: error,
        },
      };
    }
  }

  async findAll(options?: {
    filter?: PhotoFilter;
    sort?: PhotoSortOptions;
    pagination?: { page: number; pageSize: number };
  }): Promise<OperationResult<PaginatedResult<Photo>>> {
    try {
      let photos = await this.loadPhotosFromStorage();
      
      // Filtrar fotos não deletadas
      photos = photos.filter(p => !p.isDeleted);

      // Aplicar filtros
      if (options?.filter) {
        photos = this.applyFilters(photos, options.filter);
      }

      // Aplicar ordenação
      if (options?.sort) {
        photos = this.applySorting(photos, options.sort);
      }

      // Aplicar paginação
      const pagination = options?.pagination || { page: 1, pageSize: photos.length };
      const startIndex = (pagination.page - 1) * pagination.pageSize;
      const endIndex = startIndex + pagination.pageSize;
      const paginatedPhotos = photos.slice(startIndex, endIndex);

      const result: PaginatedResult<Photo> = {
        items: paginatedPhotos,
        total: photos.length,
        page: pagination.page,
        pageSize: pagination.pageSize,
        hasNext: endIndex < photos.length,
        hasPrevious: pagination.page > 1,
      };

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'FIND_ALL_FAILED',
          message: 'Falha ao buscar fotos',
          details: error,
        },
      };
    }
  }

  async findByLocation(
    latitude: number,
    longitude: number,
    radius: number
  ): Promise<OperationResult<Photo[]>> {
    try {
      const photos = await this.loadPhotosFromStorage();
      const nearbyPhotos = photos.filter(photo => {
        if (!photo.location || photo.isDeleted) return false;
        
        const distance = this.calculateDistance(
          latitude,
          longitude,
          photo.location.latitude,
          photo.location.longitude
        );
        
        return distance <= radius;
      });

      return {
        success: true,
        data: nearbyPhotos,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'FIND_BY_LOCATION_FAILED',
          message: 'Falha ao buscar fotos por localização',
          details: error,
        },
      };
    }
  }

  async findByTags(tags: string[]): Promise<OperationResult<Photo[]>> {
    try {
      const photos = await this.loadPhotosFromStorage();
      const taggedPhotos = photos.filter(photo => {
        if (!photo.tags || photo.isDeleted) return false;
        return tags.some(tag => photo.tags!.includes(tag));
      });

      return {
        success: true,
        data: taggedPhotos,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'FIND_BY_TAGS_FAILED',
          message: 'Falha ao buscar fotos por tags',
          details: error,
        },
      };
    }
  }

  async findFavorites(): Promise<OperationResult<Photo[]>> {
    try {
      const photos = await this.loadPhotosFromStorage();
      const favorites = photos.filter(photo => photo.isFavorite && !photo.isDeleted);

      return {
        success: true,
        data: favorites,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'FIND_FAVORITES_FAILED',
          message: 'Falha ao buscar fotos favoritas',
          details: error,
        },
      };
    }
  }

  async getStats(): Promise<OperationResult<PhotoStats>> {
    try {
      const photos = await this.loadPhotosFromStorage();
      const activePhotos = photos.filter(p => !p.isDeleted);
      
      const stats: PhotoStats = {
        total: activePhotos.length,
        withLocation: activePhotos.filter(p => p.location).length,
        withTags: activePhotos.filter(p => p.tags && p.tags.length > 0).length,
        favorites: activePhotos.filter(p => p.isFavorite).length,
        totalSize: activePhotos.reduce((sum, p) => sum + (p.metadata?.size || 0), 0),
        averageSize: 0,
        oldestPhoto: activePhotos.sort((a, b) => a.timestamp - b.timestamp)[0],
        newestPhoto: activePhotos.sort((a, b) => b.timestamp - a.timestamp)[0],
      };

      stats.averageSize = stats.total > 0 ? stats.totalSize / stats.total : 0;

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'GET_STATS_FAILED',
          message: 'Falha ao obter estatísticas',
          details: error,
        },
      };
    }
  }

  async cleanup(): Promise<OperationResult<{ deletedCount: number }>> {
    try {
      const photos = await this.loadPhotosFromStorage();
      const deletedPhotos = photos.filter(p => p.isDeleted);
      const activePhotos = photos.filter(p => !p.isDeleted);
      
      // Remover arquivos físicos das fotos deletadas
      for (const photo of deletedPhotos) {
        try {
          const file = new File(photo.uri);
          if (file.exists) {
            await file.delete();
          }
        } catch (error) {
          console.warn(`Erro ao deletar arquivo ${photo.uri}:`, error);
        }
      }

      // Salvar apenas fotos ativas
      await this.savePhotosToStorage(activePhotos);

      return {
        success: true,
        data: { deletedCount: deletedPhotos.length },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CLEANUP_FAILED',
          message: 'Falha na limpeza',
          details: error,
        },
      };
    }
  }

  async backup(): Promise<OperationResult<{ backupPath: string }>> {
    try {
      const photos = await this.loadPhotosFromStorage();
      const backupData = {
        photos,
        timestamp: Date.now(),
        version: '2.0',
      };

      const backupFileName = `backup_${Date.now()}.json`;
      const backupFile = new File(Paths.document, backupFileName);
      
      await backupFile.write(JSON.stringify(backupData, null, 2));

      return {
        success: true,
        data: { backupPath: backupFile.uri },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'BACKUP_FAILED',
          message: 'Falha no backup',
          details: error,
        },
      };
    }
  }

  async restore(backupPath: string): Promise<OperationResult<{ restoredCount: number }>> {
    try {
      const backupFile = new File(backupPath);
      if (!backupFile.exists) {
        return {
          success: false,
          error: {
            code: 'BACKUP_NOT_FOUND',
            message: 'Arquivo de backup não encontrado',
          },
        };
      }

      const backupContent = await FileSystem.readAsStringAsync(backupPath);
      const backupData = JSON.parse(backupContent);
      
      if (!backupData.photos || !Array.isArray(backupData.photos)) {
        return {
          success: false,
          error: {
            code: 'INVALID_BACKUP',
            message: 'Arquivo de backup inválido',
          },
        };
      }

      await this.savePhotosToStorage(backupData.photos);

      return {
        success: true,
        data: { restoredCount: backupData.photos.length },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'RESTORE_FAILED',
          message: 'Falha na restauração',
          details: error,
        },
      };
    }
  }

  // Métodos auxiliares privados
  private async loadPhotosFromStorage(): Promise<Photo[]> {
    try {
      const photosJson = await AsyncStorage.getItem(PHOTOS_STORAGE_KEY);
      return photosJson ? JSON.parse(photosJson) : [];
    } catch (error) {
      console.error('Erro ao carregar fotos do storage:', error);
      return [];
    }
  }

  private async savePhotosToStorage(photos: Photo[]): Promise<void> {
    await AsyncStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(photos));
  }

  private async savePhotoFile(sourceUri: string, photoId: string): Promise<OperationResult<string>> {
    try {
      const fileName = `${photoId}.jpg`;
      const destinationFile = new File(Paths.document, fileName);
      const sourceFile = new File(sourceUri);
      
      await sourceFile.copy(destinationFile);
      
      return {
        success: true,
        data: destinationFile.uri,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'FILE_SAVE_FAILED',
          message: 'Falha ao salvar arquivo',
          details: error,
        },
      };
    }
  }

  private async extractBasicMetadata(uri: string): Promise<OperationResult<PhotoMetadata>> {
    try {
      const file = new File(uri);
      const metadata: PhotoMetadata = {
        size: file.size,
        format: 'jpg', // Assumindo JPG por padrão
      };

      return {
        success: true,
        data: metadata,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'METADATA_EXTRACTION_FAILED',
          message: 'Falha ao extrair metadados',
          details: error,
        },
      };
    }
  }

  private applyFilters(photos: Photo[], filter: PhotoFilter): Photo[] {
    return photos.filter(photo => {
      // Filtro por texto
      if (filter.searchText) {
        const searchLower = filter.searchText.toLowerCase();
        const titleMatch = photo.title?.toLowerCase().includes(searchLower);
        const descriptionMatch = photo.description?.toLowerCase().includes(searchLower);
        const tagsMatch = photo.tags?.some(tag => tag.toLowerCase().includes(searchLower));
        
        if (!titleMatch && !descriptionMatch && !tagsMatch) {
          return false;
        }
      }

      // Filtro por data
      if (filter.dateFrom || filter.dateTo) {
        const photoDate = new Date(photo.timestamp);
        
        if (filter.dateFrom && photoDate < filter.dateFrom) return false;
        if (filter.dateTo && photoDate > filter.dateTo) return false;
      }

      // Filtro por localização
      if (filter.hasLocation !== undefined) {
        const hasLocation = !!photo.location;
        if (filter.hasLocation !== hasLocation) return false;
      }

      // Filtro por favoritos
      if (filter.isFavorite !== undefined) {
        if (filter.isFavorite !== photo.isFavorite) return false;
      }

      // Filtro por tags
      if (filter.tags && filter.tags.length > 0) {
        if (!photo.tags || !filter.tags.some(tag => photo.tags!.includes(tag))) {
          return false;
        }
      }

      // Filtro por localização geográfica
      if (filter.location) {
        if (!photo.location) return false;
        
        const distance = this.calculateDistance(
          filter.location.latitude,
          filter.location.longitude,
          photo.location.latitude,
          photo.location.longitude
        );
        
        if (distance > filter.location.radius) return false;
      }

      return true;
    });
  }

  private applySorting(photos: Photo[], sort: PhotoSortOptions): Photo[] {
    return photos.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sort.field) {
        case 'timestamp':
          aValue = a.timestamp;
          bValue = b.timestamp;
          break;
        case 'title':
          aValue = a.title || '';
          bValue = b.title || '';
          break;
        case 'createdAt':
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        case 'updatedAt':
          aValue = a.updatedAt;
          bValue = b.updatedAt;
          break;
        default:
          return 0;
      }

      if (sort.direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Raio da Terra em metros
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}