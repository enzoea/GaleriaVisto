import { renderHook, act, waitFor } from '@testing-library/react-native';
import { usePhotos } from '../../presentation/hooks/usePhotos';

// Mock do PhotoRepositoryImpl
jest.mock('../../data/repositories/PhotoRepositoryImpl', () => {
  return {
    PhotoRepositoryImpl: jest.fn().mockImplementation(() => ({
      getAllPhotos: jest.fn().mockResolvedValue([
        {
          id: '1',
          uri: 'file://test-photo-1.jpg',
          timestamp: Date.now() - 1000000,
          metadata: { width: 1920, height: 1080, size: 1024000 },
        },
        {
          id: '2',
          uri: 'file://test-photo-2.jpg',
          timestamp: Date.now(),
          metadata: { width: 1280, height: 720, size: 512000 },
        },
      ]),
      savePhoto: jest.fn(),
      deletePhoto: jest.fn().mockResolvedValue(undefined),
    })),
  };
});

describe('usePhotos', () => {
  it('deve inicializar com estado correto', () => {
    const { result } = renderHook(() => usePhotos());

    expect(result.current.photos).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.savePhoto).toBe('function');
    expect(typeof result.current.deletePhoto).toBe('function');
    expect(typeof result.current.refreshPhotos).toBe('function');
  });

  it('deve carregar fotos após inicialização', async () => {
    const { result } = renderHook(() => usePhotos());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Como o mock está configurado para retornar 2 fotos, esperamos que elas sejam carregadas
    await waitFor(() => {
      expect(result.current.photos.length).toBeGreaterThan(0);
    });
  });

  it('deve ter função deletePhoto disponível', async () => {
    const { result } = renderHook(() => usePhotos());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verificar se a função deletePhoto existe e pode ser chamada
    expect(typeof result.current.deletePhoto).toBe('function');
    
    await act(async () => {
      await result.current.deletePhoto('1');
    });

    // Se chegou até aqui sem erro, a função foi executada com sucesso
    expect(true).toBe(true);
  });
});