import { Photo, Location, PhotoRepository } from '../../domain/photo/Photo';
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
      throw new Error('Não foi possível deletar a foto');
    }
  }
}