// Componentes principais de foto
export { PhotoCard } from './PhotoCard';
export { PhotoGrid } from './PhotoGrid';

// Re-exports dos componentes existentes (para compatibilidade)
export { default as AnimatedPhotoCard } from '../AnimatedPhotoCard';
export { default as PhotoComparisonModal } from '../PhotoComparisonModal';
export { default as PhotoSearchFilter } from '../PhotoSearchFilter';
export { default as PhotoTitleModal } from '../PhotoTitleModal';
export { default as SharePhotoModal } from '../SharePhotoModal';

// Tipos relacionados
export type { Photo, PhotoFilter, PhotoMetadata } from '../../../domain/photo/types';