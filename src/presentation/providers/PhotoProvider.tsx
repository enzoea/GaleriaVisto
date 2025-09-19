import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { Photo, Location } from '../../domain/photo/Photo';
import { PhotoRepository, PhotoFilters, PhotoSortOptions } from '../../domain/repositories/PhotoRepository';
import { PhotoRepositoryImpl } from '../../data/repositories/PhotoRepositoryImpl';
import { AppError } from '../../core/utils/AppError';

interface PhotoState {
  photos: Photo[];
  loading: boolean;
  error: AppError | null;
  filters: PhotoFilters | null;
  sortOptions: PhotoSortOptions | null;
  selectedPhotos: string[];
}

type PhotoAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: AppError | null }
  | { type: 'SET_PHOTOS'; payload: Photo[] }
  | { type: 'ADD_PHOTO'; payload: Photo }
  | { type: 'UPDATE_PHOTO'; payload: { id: string; photo: Photo } }
  | { type: 'REMOVE_PHOTO'; payload: string }
  | { type: 'REMOVE_PHOTOS'; payload: string[] }
  | { type: 'SET_FILTERS'; payload: PhotoFilters | null }
  | { type: 'SET_SORT_OPTIONS'; payload: PhotoSortOptions | null }
  | { type: 'SET_SELECTED_PHOTOS'; payload: string[] }
  | { type: 'TOGGLE_PHOTO_SELECTION'; payload: string }
  | { type: 'CLEAR_SELECTION' };

interface PhotoContextType {
  state: PhotoState;
  actions: {
    loadPhotos: () => Promise<void>;
    savePhoto: (photoUri: string, location?: Location, title?: string) => Promise<Photo | null>;
    updatePhoto: (id: string, updates: Partial<Omit<Photo, 'id' | 'timestamp'>>) => Promise<void>;
    deletePhoto: (id: string) => Promise<void>;
    deletePhotos: (ids: string[]) => Promise<void>;
    setFilters: (filters: PhotoFilters | null) => void;
    setSortOptions: (sort: PhotoSortOptions | null) => void;
    selectPhoto: (id: string) => void;
    togglePhotoSelection: (id: string) => void;
    clearSelection: () => void;
    clearError: () => void;
    refreshPhotos: () => Promise<void>;
  };
}

const initialState: PhotoState = {
  photos: [],
  loading: false,
  error: null,
  filters: null,
  sortOptions: { field: 'timestamp', direction: 'desc' },
  selectedPhotos: [],
};

function photoReducer(state: PhotoState, action: PhotoAction): PhotoState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_PHOTOS':
      return { ...state, photos: action.payload, loading: false, error: null };
    
    case 'ADD_PHOTO':
      return { 
        ...state, 
        photos: [action.payload, ...state.photos],
        loading: false,
        error: null 
      };
    
    case 'UPDATE_PHOTO':
      return {
        ...state,
        photos: state.photos.map(photo => 
          photo.id === action.payload.id ? action.payload.photo : photo
        ),
        error: null
      };
    
    case 'REMOVE_PHOTO':
      return {
        ...state,
        photos: state.photos.filter(photo => photo.id !== action.payload),
        selectedPhotos: state.selectedPhotos.filter(id => id !== action.payload),
        error: null
      };
    
    case 'REMOVE_PHOTOS':
      return {
        ...state,
        photos: state.photos.filter(photo => !action.payload.includes(photo.id)),
        selectedPhotos: state.selectedPhotos.filter(id => !action.payload.includes(id)),
        error: null
      };
    
    case 'SET_FILTERS':
      return { ...state, filters: action.payload };
    
    case 'SET_SORT_OPTIONS':
      return { ...state, sortOptions: action.payload };
    
    case 'SET_SELECTED_PHOTOS':
      return { ...state, selectedPhotos: action.payload };
    
    case 'TOGGLE_PHOTO_SELECTION':
      const isSelected = state.selectedPhotos.includes(action.payload);
      return {
        ...state,
        selectedPhotos: isSelected
          ? state.selectedPhotos.filter(id => id !== action.payload)
          : [...state.selectedPhotos, action.payload]
      };
    
    case 'CLEAR_SELECTION':
      return { ...state, selectedPhotos: [] };
    
    default:
      return state;
  }
}

const PhotoContext = createContext<PhotoContextType | undefined>(undefined);

interface PhotoProviderProps {
  children: React.ReactNode;
  repository?: PhotoRepository;
}

export const PhotoProvider: React.FC<PhotoProviderProps> = ({ 
  children, 
  repository = new PhotoRepositoryImpl() 
}) => {
  const [state, dispatch] = useReducer(photoReducer, initialState);

  const loadPhotos = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const photos = await repository.getPhotos(state.filters || undefined, state.sortOptions || undefined);
      dispatch({ type: 'SET_PHOTOS', payload: photos });
    } catch (error) {
      const appError = AppError.fromUnknown(error);
      dispatch({ type: 'SET_ERROR', payload: appError });
    }
  }, [repository, state.filters, state.sortOptions]);

  const savePhoto = useCallback(async (photoUri: string, location?: Location, title?: string): Promise<Photo | null> => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      const savedPhoto = await repository.savePhoto(photoUri, location, title);
      dispatch({ type: 'ADD_PHOTO', payload: savedPhoto });
      return savedPhoto;
    } catch (error) {
      const appError = AppError.fromUnknown(error);
      dispatch({ type: 'SET_ERROR', payload: appError });
      return null;
    }
  }, [repository]);

  const updatePhoto = useCallback(async (id: string, updates: Partial<Omit<Photo, 'id' | 'timestamp'>>) => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      const updatedPhoto = await repository.updatePhoto(id, updates);
      dispatch({ type: 'UPDATE_PHOTO', payload: { id, photo: updatedPhoto } });
    } catch (error) {
      const appError = AppError.fromUnknown(error);
      dispatch({ type: 'SET_ERROR', payload: appError });
    }
  }, [repository]);

  const deletePhoto = useCallback(async (id: string) => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      await repository.deletePhoto(id);
      dispatch({ type: 'REMOVE_PHOTO', payload: id });
    } catch (error) {
      const appError = AppError.fromUnknown(error);
      dispatch({ type: 'SET_ERROR', payload: appError });
    }
  }, [repository]);

  const deletePhotos = useCallback(async (ids: string[]) => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      await repository.deletePhotos(ids);
      dispatch({ type: 'REMOVE_PHOTOS', payload: ids });
    } catch (error) {
      const appError = AppError.fromUnknown(error);
      dispatch({ type: 'SET_ERROR', payload: appError });
    }
  }, [repository]);

  const setFilters = useCallback((filters: PhotoFilters | null) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const setSortOptions = useCallback((sort: PhotoSortOptions | null) => {
    dispatch({ type: 'SET_SORT_OPTIONS', payload: sort });
  }, []);

  const selectPhoto = useCallback((id: string) => {
    dispatch({ type: 'SET_SELECTED_PHOTOS', payload: [id] });
  }, []);

  const togglePhotoSelection = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_PHOTO_SELECTION', payload: id });
  }, []);

  const clearSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const refreshPhotos = useCallback(async () => {
    await loadPhotos();
  }, [loadPhotos]);

  // Carregar fotos automaticamente quando filtros ou ordenação mudam
  useEffect(() => {
    loadPhotos();
  }, [state.filters, state.sortOptions]);

  const contextValue: PhotoContextType = {
    state,
    actions: {
      loadPhotos,
      savePhoto,
      updatePhoto,
      deletePhoto,
      deletePhotos,
      setFilters,
      setSortOptions,
      selectPhoto,
      togglePhotoSelection,
      clearSelection,
      clearError,
      refreshPhotos,
    },
  };

  return (
    <PhotoContext.Provider value={contextValue}>
      {children}
    </PhotoContext.Provider>
  );
};

export const usePhotoContext = (): PhotoContextType => {
  const context = useContext(PhotoContext);
  if (context === undefined) {
    throw new Error('usePhotoContext deve ser usado dentro de um PhotoProvider');
  }
  return context;
};