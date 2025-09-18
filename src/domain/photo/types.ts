export type PhotoId = string;
export interface Photo {
  id: PhotoId;
  uri: string;
  createdAt: string;       // ISO
  latitude: number | null;
  longitude: number | null;
  title?: string;
}
