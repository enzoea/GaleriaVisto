import { renderHook, act } from '@testing-library/react-native';
import { usePhotoFilters } from '../../presentation/hooks/usePhotoFilters';
import { Photo } from '../../domain/photo/Photo';

const mockPhotos: Photo[] = [
  {
    id: '1',
    uri: 'file://test-photo-1.jpg',
    timestamp: new Date('2024-01-15').getTime(),
    title: 'Foto de teste 1',
    width: 1920,
    height: 1080,
    location: {
      latitude: -23.5505,
      longitude: -46.6333,
    },
  },
  {
    id: '2',
    uri: 'file://test-photo-2.jpg',
    timestamp: new Date('2024-01-10').getTime(),
    title: 'Foto de teste 2',
    width: 1280,
    height: 720,
  },
];

describe('usePhotoFilters', () => {
  it('deve retornar todas as fotos quando não há filtros aplicados', () => {
    const { result } = renderHook(() => usePhotoFilters(mockPhotos));

    expect(result.current.filteredPhotos).toHaveLength(2);
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it('deve filtrar fotos por texto', () => {
    const { result } = renderHook(() => usePhotoFilters(mockPhotos));

    act(() => {
      result.current.updateFilters({
        searchText: 'teste 1',
        dateFrom: undefined,
        dateTo: undefined,
        hasLocation: undefined,
      });
    });

    expect(result.current.filteredPhotos).toHaveLength(1);
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it('deve limpar filtros', () => {
    const { result } = renderHook(() => usePhotoFilters(mockPhotos));

    act(() => {
      result.current.updateFilters({
        searchText: 'teste',
        dateFrom: undefined,
        dateTo: undefined,
        hasLocation: undefined,
      });
    });

    expect(result.current.hasActiveFilters).toBe(true);

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.hasActiveFilters).toBe(false);
    expect(result.current.filteredPhotos).toHaveLength(2);
  });
});