export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface Photo {
  id: string;
  uri: string;
  timestamp: number;
  width?: number;
  height?: number;
  location?: Location;
  title?: string;
}

export interface PhotoRepository {
  savePhoto(photoUri: string, location?: Location, title?: string): Promise<Photo>;
  getAllPhotos(): Promise<Photo[]>;
  deletePhoto(id: string): Promise<void>;
}