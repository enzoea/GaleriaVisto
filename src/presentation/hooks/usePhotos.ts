import { useState, useEffect, useCallback } from 'react';
import { Photo, Location } from '../../domain/photo/Photo';
import { PhotoRepositoryImpl } from '../../data/repositories/PhotoRepositoryImpl';

const photoRepository = new PhotoRepositoryImpl();

export const usePhotos = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPhotos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedPhotos = await photoRepository.getAllPhotos();
      setPhotos(loadedPhotos);
    } catch (err) {
      setError('Erro ao carregar fotos');
      console.error('Erro ao carregar fotos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const savePhoto = useCallback(async (photoUri: string, location?: Location, title?: string): Promise<Photo | null> => {
    try {
      setError(null);
      const savedPhoto = await photoRepository.savePhoto(photoUri, location, title);
      setPhotos(prevPhotos => [savedPhoto, ...prevPhotos]);
      return savedPhoto;
    } catch (err) {
      setError('Erro ao salvar foto');
      console.error('Erro ao salvar foto:', err);
      return null;
    }
  }, []);

  const deletePhoto = useCallback(async (id: string) => {
    try {
      setError(null);
      await photoRepository.deletePhoto(id);
      setPhotos(prevPhotos => prevPhotos.filter(photo => photo.id !== id));
    } catch (err) {
      setError('Erro ao deletar foto');
      console.error('Erro ao deletar foto:', err);
    }
  }, []);

  const refreshPhotos = useCallback(() => {
    loadPhotos();
  }, [loadPhotos]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  return {
    photos,
    loading,
    error,
    savePhoto,
    deletePhoto,
    refreshPhotos,
  };
};