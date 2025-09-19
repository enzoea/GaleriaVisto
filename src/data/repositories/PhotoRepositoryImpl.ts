import { Photo, Location } from '../../domain/photo/Photo';
import { PhotoRepository, PhotoFilters, PhotoSortOptions } from '../../domain/repositories/PhotoRepository';
import { AppError, ErrorCode } from '../../core/utils/AppError';
import { File, Paths } from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PHOTOS_STORAGE_KEY = '@galeria_visto_photos';

export class PhotoRepositoryImpl implements PhotoRepository {
  async savePhoto(photoUri: string, location?: Location, title?: string): Promise<Photo> {
    try {
      // Gerar ID único
      const id = Date.now().toString();
      const timestamp = Date.now();
      
      // Criar arquivo no diretório de documentos
      const fileName = `photo_${id}.jpg`;
      const file = new File(Paths.document, fileName);
      
      // Copiar foto para diretório permanente
      const sourceFile = new File(photoUri);
      await sourceFile.copy(file);

      // Obter informações da imagem
      const imageInfo = { exists: file.exists, size: file.size };
      
      const photo: Photo = {
        id,
        uri: file.uri,
        timestamp,
        location,
        title,
      };

      // Salvar no AsyncStorage
      const existingPhotos = await this.getAllPhotos();
      const updatedPhotos = [photo, ...existingPhotos];
      
      await AsyncStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(updatedPhotos));
      
      return photo;
    } catch (error) {
      console.error('Erro ao salvar foto:', error);
      throw new Error('Não foi possível salvar a foto');
    }
  }

  async getAllPhotos(): Promise<Photo[]> {
    try {
      const photosJson = await AsyncStorage.getItem(PHOTOS_STORAGE_KEY);
      if (!photosJson) {
        return [];
      }
      
      const photos: Photo[] = JSON.parse(photosJson);
      
      // Verificar se os arquivos ainda existem
      const validPhotos: Photo[] = [];
      for (const photo of photos) {
        const file = new File(photo.uri);
        if (file.exists) {
          validPhotos.push(photo);
        }
      }
      
      // Se alguma foto foi removida, atualizar o storage
      if (validPhotos.length !== photos.length) {
        await AsyncStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(validPhotos));
      }
      
      return validPhotos;
    } catch (error) {
      console.error('Erro ao carregar fotos:', error);
      return [];
    }
  }

  async deletePhoto(id: string): Promise<void> {
    try {
      const photos = await this.getAllPhotos();
      const photoToDelete = photos.find(p => p.id === id);
      
      if (photoToDelete) {
        // Deletar arquivo físico
        const file = new File(photoToDelete.uri);
        if (file.exists) {
          await file.delete();
        }
        
        // Remover do storage
        const updatedPhotos = photos.filter(p => p.id !== id);
        await AsyncStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(updatedPhotos));
      }
    } catch (error) {
      console.error('Erro ao deletar foto:', error);
      throw AppError.fromUnknown(error, { photoId: id });
    }
  }

  async getPhotos(filters?: PhotoFilters, sort?: PhotoSortOptions): Promise<Photo[]> {
    try {
      let photos = await this.getAllPhotos();

      // Aplicar filtros
      if (filters) {
        if (filters.dateRange) {
          photos = photos.filter(photo => {
            const photoDate = new Date(photo.timestamp);
            return photoDate >= filters.dateRange!.start && photoDate <= filters.dateRange!.end;
          });
        }

        if (filters.hasTitle !== undefined) {
          photos = photos.filter(photo => filters.hasTitle ? !!photo.title : !photo.title);
        }

        if (filters.searchText) {
          const searchLower = filters.searchText.toLowerCase();
          photos = photos.filter(photo => 
            photo.title?.toLowerCase().includes(searchLower) ||
            photo.location?.address?.toLowerCase().includes(searchLower)
          );
        }

        if (filters.location) {
          photos = photos.filter(photo => {
            if (!photo.location) return false;
            const distance = this.calculateDistance(
              filters.location!.latitude,
              filters.location!.longitude,
              photo.location.latitude,
              photo.location.longitude
            );
            return distance <= filters.location!.radius;
          });
        }
      }

      // Aplicar ordenação
      if (sort) {
        photos.sort((a, b) => {
          let aValue: any, bValue: any;
          
          switch (sort.field) {
            case 'timestamp':
              aValue = a.timestamp;
              bValue = b.timestamp;
              break;
            case 'title':
              aValue = a.title || '';
              bValue = b.title || '';
              break;
            case 'location':
              aValue = a.location?.address || '';
              bValue = b.location?.address || '';
              break;
          }

          if (sort.direction === 'asc') {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        });
      }

      return photos;
    } catch (error) {
      throw AppError.fromUnknown(error);
    }
  }

  async getPhotoById(id: string): Promise<Photo | null> {
    try {
      const photos = await this.getAllPhotos();
      return photos.find(photo => photo.id === id) || null;
    } catch (error) {
      throw AppError.fromUnknown(error, { photoId: id });
    }
  }

  async updatePhoto(id: string, updates: Partial<Omit<Photo, 'id' | 'timestamp'>>): Promise<Photo> {
    try {
      const photos = await this.getAllPhotos();
      const photoIndex = photos.findIndex(photo => photo.id === id);
      
      if (photoIndex === -1) {
        throw AppError.photoNotFound(id);
      }

      const updatedPhoto = { ...photos[photoIndex], ...updates };
      photos[photoIndex] = updatedPhoto;
      
      await AsyncStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(photos));
      return updatedPhoto;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw AppError.fromUnknown(error, { photoId: id, updates });
    }
  }

  async deletePhotos(ids: string[]): Promise<void> {
    try {
      const photos = await this.getAllPhotos();
      const photosToDelete = photos.filter(photo => ids.includes(photo.id));
      
      // Deletar arquivos físicos
      for (const photo of photosToDelete) {
        const file = new File(photo.uri);
        if (file.exists) {
          await file.delete();
        }
      }
      
      // Remover do storage
      const remainingPhotos = photos.filter(photo => !ids.includes(photo.id));
      await AsyncStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(remainingPhotos));
    } catch (error) {
      throw AppError.fromUnknown(error, { photoIds: ids });
    }
  }

  async photoExists(id: string): Promise<boolean> {
    try {
      const photo = await this.getPhotoById(id);
      return photo !== null;
    } catch (error) {
      return false;
    }
  }

  async getPhotosCount(filters?: PhotoFilters): Promise<number> {
    try {
      const photos = await this.getPhotos(filters);
      return photos.length;
    } catch (error) {
      throw AppError.fromUnknown(error);
    }
  }

  async clearAllPhotos(): Promise<void> {
    try {
      const photos = await this.getAllPhotos();
      
      // Deletar todos os arquivos físicos
      for (const photo of photos) {
        const file = new File(photo.uri);
        if (file.exists) {
          await file.delete();
        }
      }
      
      // Limpar storage
      await AsyncStorage.removeItem(PHOTOS_STORAGE_KEY);
    } catch (error) {
      throw AppError.fromUnknown(error);
    }
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Raio da Terra em metros
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }
}