// Re-exportando tipos do novo sistema
export {
  Photo,
  Location,
  PhotoMetadata,
  PhotoId,
  CreatePhotoInput,
  UpdatePhotoInput,
  PhotoFilter,
  PhotoSortOptions,
  OperationResult,
  PaginatedResult,
  PhotoStats,
} from './types';

export { PhotoRepository } from './repository';

// Importando tipos para uso na interface legada
import { Photo, Location } from './types';

// Interface legada para compatibilidade (será removida gradualmente)
export interface LegacyPhotoRepository {
  savePhoto(photoUri: string, location?: Location, title?: string): Promise<Photo>;
  getAllPhotos(): Promise<Photo[]>;
  deletePhoto(id: string): Promise<void>;
}