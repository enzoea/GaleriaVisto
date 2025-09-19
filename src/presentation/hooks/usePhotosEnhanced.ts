import { useCallback } from 'react';
import { usePhotoContext, useFilteredPhotos } from '../contexts/PhotoContext';
import { Photo, PhotoId, CreatePhotoInput, UpdatePhotoInput } from '../../domain/photo/types';

/**
 * Hook melhorado que usa o Context API para gerenciamento de estado
 * Mantém compatibilidade com a interface anterior
 */
export const usePhotosEnhanced = () => {
  const {
    state,
    createPhoto,
    updatePhoto,
    deletePhoto,
    loadPhotos,
    refreshPhotos,
    toggleFavorite,
  } = usePhotoContext();

  const filteredPhotos = useFilteredPhotos();

  // Compatibilidade com a interface anterior
  const savePhoto = useCallback(async (photoData: CreatePhotoInput): Promise<Photo> => {
    const result = await createPhoto(photoData);
    
    if (!result.success) {
      throw new Error(result.error?.message || 'Erro ao salvar foto');
    }
    
    return result.data!;
  }, [createPhoto]);

  const getAllPhotos = useCallback(async (): Promise<Photo[]> => {
    await loadPhotos();
    return state.photos;
  }, [loadPhotos, state.photos]);

  const deletePhotoById = useCallback(async (id: PhotoId): Promise<void> => {
    const result = await deletePhoto(id);
    
    if (!result.success) {
      throw new Error(result.error?.message || 'Erro ao deletar foto');
    }
  }, [deletePhoto]);

  const updatePhotoData = useCallback(async (photoData: UpdatePhotoInput): Promise<Photo> => {
    const result = await updatePhoto(photoData);
    
    if (!result.success) {
      throw new Error(result.error?.message || 'Erro ao atualizar foto');
    }
    
    return result.data!;
  }, [updatePhoto]);

  const togglePhotoFavorite = useCallback(async (id: PhotoId): Promise<void> => {
    await toggleFavorite(id);
  }, [toggleFavorite]);

  const refreshPhotoList = useCallback(async (): Promise<void> => {
    await refreshPhotos();
  }, [refreshPhotos]);

  return {
    // Estado
    photos: filteredPhotos,
    allPhotos: state.photos,
    loading: state.loading,
    error: state.error,
    stats: state.stats,
    selectedPhotos: state.selectedPhotos,
    isSelectionMode: state.isSelectionMode,
    filter: state.filter,
    sortOptions: state.sortOptions,

    // Métodos compatíveis com a interface anterior
    savePhoto,
    getAllPhotos,
    deletePhoto: deletePhotoById,
    updatePhoto: updatePhotoData,
    toggleFavorite: togglePhotoFavorite,
    refreshPhotos: refreshPhotoList,

    // Métodos novos do Context API
    createPhoto,
    updatePhoto: updatePhoto,
    deletePhoto: deletePhoto,
    loadPhotos,
    refreshPhotos,
  };
};

// Re-export para compatibilidade
export { usePhotosEnhanced as usePhotos };