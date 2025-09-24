import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { PhotoProvider, usePhotoContext, useFilteredPhotos } from '../../presentation/contexts/PhotoContext';
import { Photo } from '../../domain/photo/types';

// Mock do repositório
const mockRepository = {
  getAll: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  getStats: jest.fn(),
  cleanup: jest.fn(),
  backup: jest.fn(),
  restore: jest.fn(),
};

// Mock do PhotoRepositoryImpl
jest.mock('../../data/repositories/PhotoRepositoryImpl', () => ({
  PhotoRepositoryImpl: jest.fn().mockImplementation(() => mockRepository),
}));

const mockPhotos: Photo[] = [
  {
    id: '1',
    uri: 'photo1.jpg',
    title: 'Beach Sunset',
    description: 'Beautiful sunset at the beach',
    timestamp: Date.now() - 86400000, // 1 day ago
    location: {
      latitude: -23.5505,
      longitude: -46.6333,
      address: 'São Paulo, SP',
    },
    metadata: {
      width: 1920,
      height: 1080,
      fileSize: 1024000,
      format: 'jpg',
      camera: 'iPhone 12',
      settings: {
        iso: 100,
        aperture: 'f/2.8',
        shutterSpeed: '1/60',
        focalLength: '26mm',
      },
    },
    tags: ['sunset', 'beach', 'landscape'],
    isFavorite: false,
    isPrivate: false,
  },
  {
    id: '2',
    uri: 'photo2.jpg',
    title: 'Mountain View',
    description: 'Panoramic mountain view',
    timestamp: Date.now() - 172800000, // 2 days ago
    location: {
      latitude: -22.9068,
      longitude: -43.1729,
      address: 'Rio de Janeiro, RJ',
    },
    metadata: {
      width: 1920,
      height: 1080,
      fileSize: 2048000,
      format: 'png',
      camera: 'Canon EOS',
      settings: {
        iso: 200,
        aperture: 'f/1.8',
        shutterSpeed: '1/120',
        focalLength: '50mm',
      },
    },
    tags: ['mountain', 'landscape', 'panoramic'],
    isFavorite: true,
    isPrivate: false,
  },
  {
    id: '3',
    uri: 'photo3.jpg',
    title: 'City Night',
    description: 'Night cityscape',
    timestamp: Date.now() - 259200000, // 3 days ago
    metadata: {
      width: 1280,
      height: 720,
      fileSize: 512000,
      format: 'jpg',
      camera: 'Samsung Galaxy',
      settings: {
        iso: 800,
        aperture: 'f/1.4',
        shutterSpeed: '1/30',
        focalLength: '35mm',
      },
    },
    tags: ['city', 'night', 'urban'],
    isFavorite: false,
    isPrivate: true,
  },
];

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PhotoProvider>{children}</PhotoProvider>
);

describe('PhotoContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRepository.getAll.mockResolvedValue({
      success: true,
      data: mockPhotos,
    });
    mockRepository.getStats.mockResolvedValue({
      success: true,
      data: {
        totalPhotos: 3,
        totalSize: 3584000,
        favoriteCount: 1,
        privateCount: 1,
      },
    });
  });

  it('deve inicializar com estado correto', async () => {
    const { result } = renderHook(() => usePhotoContext(), { wrapper });

    expect(result.current.state.photos).toEqual([]);
    expect(result.current.state.loading).toBe(true);
    expect(result.current.state.error).toBeNull();
  });

  it('deve carregar fotos na inicialização', async () => {
    const { result, waitForNextUpdate } = renderHook(() => usePhotoContext(), { wrapper });

    await waitForNextUpdate();

    expect(result.current.state.photos).toEqual(mockPhotos);
    expect(result.current.state.loading).toBe(false);
    expect(mockRepository.getAll).toHaveBeenCalled();
  });

  it('deve criar nova foto', async () => {
    const newPhoto: Photo = {
      id: '4',
      uri: 'photo4.jpg',
      title: 'New Photo',
      description: 'A new photo',
      timestamp: Date.now(),
      metadata: {
        width: 1920,
        height: 1080,
        fileSize: 1024000,
        format: 'jpg',
      },
      tags: ['new'],
      isFavorite: false,
      isPrivate: false,
    };

    mockRepository.create.mockResolvedValue({
      success: true,
      data: newPhoto,
    });

    const { result, waitForNextUpdate } = renderHook(() => usePhotoContext(), { wrapper });

    await waitForNextUpdate(); // Aguarda carregamento inicial

    await act(async () => {
      await result.current.createPhoto({
        uri: 'photo4.jpg',
        title: 'New Photo',
        description: 'A new photo',
        tags: ['new'],
      });
    });

    expect(mockRepository.create).toHaveBeenCalled();
    expect(result.current.state.photos).toContainEqual(newPhoto);
  });

  it('deve atualizar foto existente', async () => {
    const updatedPhoto = { ...mockPhotos[0], title: 'Updated Title' };

    mockRepository.update.mockResolvedValue({
      success: true,
      data: updatedPhoto,
    });

    const { result, waitForNextUpdate } = renderHook(() => usePhotoContext(), { wrapper });

    await waitForNextUpdate(); // Aguarda carregamento inicial

    await act(async () => {
      await result.current.updatePhoto({
        id: '1',
        title: 'Updated Title',
      });
    });

    expect(mockRepository.update).toHaveBeenCalledWith({
      id: '1',
      title: 'Updated Title',
    });

    const updatedPhotoInState = result.current.state.photos.find(p => p.id === '1');
    expect(updatedPhotoInState?.title).toBe('Updated Title');
  });

  it('deve deletar foto', async () => {
    mockRepository.delete.mockResolvedValue({
      success: true,
    });

    const { result, waitForNextUpdate } = renderHook(() => usePhotoContext(), { wrapper });

    await waitForNextUpdate(); // Aguarda carregamento inicial

    await act(async () => {
      await result.current.deletePhoto('1');
    });

    expect(mockRepository.delete).toHaveBeenCalledWith('1');
    expect(result.current.state.photos.find(p => p.id === '1')).toBeUndefined();
  });

  it('deve alternar favorito', async () => {
    const updatedPhoto = { ...mockPhotos[0], isFavorite: true };

    mockRepository.update.mockResolvedValue({
      success: true,
      data: updatedPhoto,
    });

    const { result, waitForNextUpdate } = renderHook(() => usePhotoContext(), { wrapper });

    await waitForNextUpdate(); // Aguarda carregamento inicial

    await act(async () => {
      await result.current.toggleFavorite('1');
    });

    expect(mockRepository.update).toHaveBeenCalledWith({
      id: '1',
      isFavorite: true,
    });

    const photoInState = result.current.state.photos.find(p => p.id === '1');
    expect(photoInState?.isFavorite).toBe(true);
  });

  it('deve aplicar filtro de busca', async () => {
    const { result, waitForNextUpdate } = renderHook(() => usePhotoContext(), { wrapper });

    await waitForNextUpdate(); // Aguarda carregamento inicial

    act(() => {
      result.current.setFilter({ searchText: 'sunset' });
    });

    expect(result.current.state.filter.searchText).toBe('sunset');
  });

  it('deve aplicar filtro de favoritos', async () => {
    const { result, waitForNextUpdate } = renderHook(() => usePhotoContext(), { wrapper });

    await waitForNextUpdate(); // Aguarda carregamento inicial

    act(() => {
      result.current.setFilter({ isFavorite: true });
    });

    expect(result.current.state.filter.isFavorite).toBe(true);
  });

  it('deve aplicar ordenação', async () => {
    const { result, waitForNextUpdate } = renderHook(() => usePhotoContext(), { wrapper });

    await waitForNextUpdate(); // Aguarda carregamento inicial

    act(() => {
      result.current.setSortOptions({ field: 'title', direction: 'asc' });
    });

    expect(result.current.state.sortOptions.field).toBe('title');
    expect(result.current.state.sortOptions.direction).toBe('asc');
  });

  it('deve tratar erro ao carregar fotos', async () => {
    mockRepository.getAll.mockResolvedValue({
      success: false,
      error: { message: 'Erro ao carregar fotos' },
    });

    const { result, waitForNextUpdate } = renderHook(() => usePhotoContext(), { wrapper });

    await waitForNextUpdate();

    expect(result.current.state.error).toBe('Erro ao carregar fotos');
    expect(result.current.state.loading).toBe(false);
  });
});

describe('useFilteredPhotos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRepository.getAll.mockResolvedValue({
      success: true,
      data: mockPhotos,
    });
  });

  it('deve filtrar fotos por texto de busca', async () => {
    const { result: contextResult, waitForNextUpdate } = renderHook(() => usePhotoContext(), { wrapper });
    const { result: filteredResult } = renderHook(() => useFilteredPhotos(), { wrapper });

    await waitForNextUpdate(); // Aguarda carregamento inicial

    act(() => {
      contextResult.current.setFilter({ searchText: 'sunset' });
    });

    const filteredPhotos = filteredResult.current;
    expect(filteredPhotos).toHaveLength(1);
    expect(filteredPhotos[0].title).toBe('Beach Sunset');
  });

  it('deve filtrar fotos por favoritos', async () => {
    const { result: contextResult, waitForNextUpdate } = renderHook(() => usePhotoContext(), { wrapper });
    const { result: filteredResult } = renderHook(() => useFilteredPhotos(), { wrapper });

    await waitForNextUpdate(); // Aguarda carregamento inicial

    act(() => {
      contextResult.current.setFilter({ isFavorite: true });
    });

    const filteredPhotos = filteredResult.current;
    expect(filteredPhotos).toHaveLength(1);
    expect(filteredPhotos[0].title).toBe('Mountain View');
  });

  it('deve filtrar fotos por localização', async () => {
    const { result: contextResult, waitForNextUpdate } = renderHook(() => usePhotoContext(), { wrapper });
    const { result: filteredResult } = renderHook(() => useFilteredPhotos(), { wrapper });

    await waitForNextUpdate(); // Aguarda carregamento inicial

    act(() => {
      contextResult.current.setFilter({ hasLocation: true });
    });

    const filteredPhotos = filteredResult.current;
    expect(filteredPhotos).toHaveLength(2); // Beach Sunset e Mountain View têm localização
  });

  it('deve ordenar fotos por timestamp', async () => {
    const { result: contextResult, waitForNextUpdate } = renderHook(() => usePhotoContext(), { wrapper });
    const { result: filteredResult } = renderHook(() => useFilteredPhotos(), { wrapper });

    await waitForNextUpdate(); // Aguarda carregamento inicial

    act(() => {
      contextResult.current.setSortOptions({ field: 'timestamp', direction: 'desc' });
    });

    const filteredPhotos = filteredResult.current;
    expect(filteredPhotos[0].title).toBe('Beach Sunset'); // Mais recente
    expect(filteredPhotos[2].title).toBe('City Night'); // Mais antiga
  });

  it('deve ordenar fotos por título', async () => {
    const { result: contextResult, waitForNextUpdate } = renderHook(() => usePhotoContext(), { wrapper });
    const { result: filteredResult } = renderHook(() => useFilteredPhotos(), { wrapper });

    await waitForNextUpdate(); // Aguarda carregamento inicial

    act(() => {
      contextResult.current.setSortOptions({ field: 'title', direction: 'asc' });
    });

    const filteredPhotos = filteredResult.current;
    expect(filteredPhotos[0].title).toBe('Beach Sunset');
    expect(filteredPhotos[1].title).toBe('City Night');
    expect(filteredPhotos[2].title).toBe('Mountain View');
  });
});