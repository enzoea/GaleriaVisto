import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useOffline, useOfflinePhotos } from '../../presentation/hooks/useOffline';
import { OfflineManager } from '../../infrastructure/offline/OfflineManager';
import { Photo } from '../../domain/entities/Photo';

// Mock do OfflineManager
jest.mock('../../infrastructure/offline/OfflineManager');
const MockOfflineManager = OfflineManager as jest.MockedClass<typeof OfflineManager>;

// Mock do useErrorHandler
jest.mock('../../presentation/hooks/useErrorHandler', () => ({
  useErrorHandler: () => ({
    reportError: jest.fn(),
  }),
}));

describe('useOffline', () => {
  const mockOfflineManager = {
    initialize: jest.fn().mockResolvedValue(undefined),
    getState: jest.fn().mockReturnValue({
      isOnline: true,
      isInitialized: true,
      pendingActions: [],
      syncInProgress: false,
      lastSyncTime: Date.now(),
    }),
    createPhotoOffline: jest.fn(),
    updatePhotoOffline: jest.fn(),
    deletePhotoOffline: jest.fn(),
    syncPendingActions: jest.fn(),
    clearPendingActions: jest.fn(),
    getCachedPhoto: jest.fn(),
    getCachedPhotoList: jest.fn(),
    cachePhotoList: jest.fn(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    MockOfflineManager.mockImplementation(() => mockOfflineManager as any);
  });

  it('deve inicializar corretamente', async () => {
    const { result } = renderHook(() => useOffline());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    expect(mockOfflineManager.initialize).toHaveBeenCalled();
  });

  it('deve criar foto offline', async () => {
    const mockPhoto: Omit<Photo, 'id'> = {
      uri: 'test-uri',
      title: 'Test Photo',
      description: 'Test Description',
      timestamp: Date.now(),
      metadata: {
        width: 1920,
        height: 1080,
        fileSize: 1024000,
        format: 'jpg',
      },
      tags: ['test'],
      isFavorite: false,
      isPrivate: false,
    };

    const createdPhoto: Photo = { ...mockPhoto, id: 'test-id' };
    mockOfflineManager.createPhotoOffline.mockResolvedValue(createdPhoto);

    const { result } = renderHook(() => useOffline());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    let resultPhoto: Photo;
    await act(async () => {
      resultPhoto = await result.current.createPhoto(mockPhoto);
    });

    expect(mockOfflineManager.createPhotoOffline).toHaveBeenCalledWith(mockPhoto);
    expect(resultPhoto!).toEqual(createdPhoto);
  });

  it('deve atualizar foto offline', async () => {
    const mockPhoto: Photo = {
      id: 'test-id',
      uri: 'test-uri',
      title: 'Updated Photo',
      description: 'Updated Description',
      timestamp: Date.now(),
      metadata: {
        width: 1920,
        height: 1080,
        fileSize: 1024000,
        format: 'jpg',
      },
      tags: ['updated'],
      isFavorite: true,
      isPrivate: false,
    };

    mockOfflineManager.updatePhotoOffline.mockResolvedValue(undefined);

    const { result } = renderHook(() => useOffline());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    await act(async () => {
      await result.current.updatePhoto(mockPhoto);
    });

    expect(mockOfflineManager.updatePhotoOffline).toHaveBeenCalledWith(mockPhoto);
  });

  it('deve deletar foto offline', async () => {
    const photoId = 'test-id';
    mockOfflineManager.deletePhotoOffline.mockResolvedValue(undefined);

    const { result } = renderHook(() => useOffline());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    await act(async () => {
      await result.current.deletePhoto(photoId);
    });

    expect(mockOfflineManager.deletePhotoOffline).toHaveBeenCalledWith(photoId);
  });

  it('deve sincronizar ações pendentes', async () => {
    mockOfflineManager.syncPendingActions.mockResolvedValue(undefined);

    const { result } = renderHook(() => useOffline());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    await act(async () => {
      await result.current.syncNow();
    });

    expect(mockOfflineManager.syncPendingActions).toHaveBeenCalled();
  });

  it('deve limpar ações pendentes', async () => {
    mockOfflineManager.clearPendingActions.mockResolvedValue(undefined);

    const { result } = renderHook(() => useOffline());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    await act(async () => {
      await result.current.clearPendingActions();
    });

    expect(mockOfflineManager.clearPendingActions).toHaveBeenCalled();
  });

  it('deve obter foto do cache', async () => {
    const photoId = 'test-id';
    const cachedPhoto: Photo = {
      id: photoId,
      uri: 'cached-uri',
      title: 'Cached Photo',
      timestamp: Date.now(),
      metadata: {
        width: 1920,
        height: 1080,
        fileSize: 1024000,
        format: 'jpg',
      },
      tags: [],
      isFavorite: false,
      isPrivate: false,
    };

    mockOfflineManager.getCachedPhoto.mockReturnValue(cachedPhoto);

    const { result } = renderHook(() => useOffline());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    const retrievedPhoto = result.current.getCachedPhoto(photoId);

    expect(mockOfflineManager.getCachedPhoto).toHaveBeenCalledWith(photoId);
    expect(retrievedPhoto).toEqual(cachedPhoto);
  });
});

describe('useOfflinePhotos', () => {
  const mockOfflineManager = {
    initialize: jest.fn().mockResolvedValue(undefined),
    getState: jest.fn().mockReturnValue({
      isOnline: true,
      isInitialized: true,
      pendingActions: [],
      syncInProgress: false,
      lastSyncTime: Date.now(),
    }),
    getCachedPhotoList: jest.fn(),
    cachePhotoList: jest.fn(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    MockOfflineManager.mockImplementation(() => mockOfflineManager as any);
  });

  it('deve buscar fotos offline com cache', async () => {
    const mockPhotos: Photo[] = [
      {
        id: '1',
        uri: 'photo1.jpg',
        title: 'Beach Sunset',
        description: 'Beautiful sunset at the beach',
        timestamp: Date.now(),
        metadata: {
          width: 1920,
          height: 1080,
          fileSize: 1024000,
          format: 'jpg',
        },
        tags: ['sunset', 'beach'],
        isFavorite: false,
        isPrivate: false,
      },
      {
        id: '2',
        uri: 'photo2.jpg',
        title: 'Mountain View',
        description: 'Panoramic mountain view',
        timestamp: Date.now(),
        metadata: {
          width: 1920,
          height: 1080,
          fileSize: 2048000,
          format: 'png',
        },
        tags: ['mountain', 'landscape'],
        isFavorite: true,
        isPrivate: false,
      },
    ];

    const { result } = renderHook(() => useOfflinePhotos());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    // Teste de busca
    const searchResults = result.current.searchPhotosOffline('sunset', mockPhotos);
    expect(searchResults).toHaveLength(1);
    expect(searchResults[0].title).toBe('Beach Sunset');

    // Teste de busca por tag
    const tagResults = result.current.searchPhotosOffline('mountain', mockPhotos);
    expect(tagResults).toHaveLength(1);
    expect(tagResults[0].title).toBe('Mountain View');
  });

  it('deve retornar fotos de fallback quando cache estiver vazio', async () => {
    const fallbackPhotos: Photo[] = [
      {
        id: 'fallback',
        uri: 'fallback.jpg',
        title: 'Fallback Photo',
        timestamp: Date.now(),
        metadata: {
          width: 1920,
          height: 1080,
          fileSize: 1024000,
          format: 'jpg',
        },
        tags: [],
        isFavorite: false,
        isPrivate: false,
      },
    ];

    mockOfflineManager.getCachedPhotoList.mockReturnValue(null);

    const { result } = renderHook(() => useOfflinePhotos());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    const photos = result.current.getCachedPhotosWithFallback('test-key', fallbackPhotos);
    expect(photos).toEqual(fallbackPhotos);
  });
});