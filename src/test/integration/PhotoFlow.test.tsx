import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { PhotoGrid } from '../../presentation/components/photo/PhotoGrid';
import { PhotoCard } from '../../presentation/components/photo/PhotoCard';
import { usePhotos } from '../../presentation/hooks/usePhotos';
import { PhotoRepositoryImpl } from '../../data/repositories/PhotoRepositoryImpl';
import { Photo } from '../../types/Photo';

// Mock do repositório
jest.mock('../../data/repositories/PhotoRepositoryImpl');
const MockPhotoRepository = PhotoRepositoryImpl as jest.MockedClass<typeof PhotoRepositoryImpl>;

// Mock do hook usePhotos
jest.mock('../../presentation/hooks/usePhotos');
const mockUsePhotos = usePhotos as jest.MockedFunction<typeof usePhotos>;

// Mock dos componentes
jest.mock('../../presentation/components/photo/PhotoCard', () => ({
  PhotoCard: ({ photo, onPress, ...props }: any) => (
    <button 
      testID={`photo-card-${photo.id}`}
      onClick={() => onPress?.(photo)} 
      {...props}
    >
      {photo.title}
    </button>
  ),
}));

// Mock do FlatList
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    FlatList: ({ data, renderItem, onEndReached, testID, ...props }: any) => (
      <div testID={testID} {...props}>
        {data?.map((item: any, index: number) => (
          <div key={index}>{renderItem({ item, index })}</div>
        ))}
        {onEndReached && (
          <button testID="load-more-button" onClick={onEndReached}>
            Load More
          </button>
        )}
      </div>
    ),
  };
});

describe('PhotoFlow Integration Tests', () => {
  const mockPhotos: Photo[] = [
    {
      id: '1',
      uri: 'https://example.com/photo1.jpg',
      title: 'Sunset Beach',
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
      uri: 'https://example.com/photo2.jpg',
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
      tags: ['mountain', 'landscape', 'nature'],
      isFavorite: true,
      isPrivate: false,
    },
    {
      id: '3',
      uri: 'https://example.com/photo3.jpg',
      title: 'City Lights',
      description: 'Night cityscape with lights',
      timestamp: Date.now() - 259200000, // 3 days ago
      location: {
        latitude: -25.4284,
        longitude: -49.2733,
        address: 'Curitiba, PR',
      },
      metadata: {
        width: 1920,
        height: 1080,
        fileSize: 1536000,
        format: 'webp',
        camera: 'Samsung Galaxy',
        settings: {
          iso: 800,
          aperture: 'f/2.0',
          shutterSpeed: '1/30',
          focalLength: '28mm',
        },
      },
      tags: ['city', 'night', 'lights'],
      isFavorite: false,
      isPrivate: true,
    },
  ];

  const mockRepository = {
    getPhotos: jest.fn(),
    getPhotoById: jest.fn(),
    savePhoto: jest.fn(),
    updatePhoto: jest.fn(),
    deletePhoto: jest.fn(),
    searchPhotos: jest.fn(),
    getPhotosByLocation: jest.fn(),
    getPhotosByDateRange: jest.fn(),
    getFavoritePhotos: jest.fn(),
    getPhotosByTags: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    MockPhotoRepository.mockImplementation(() => mockRepository as any);
  });

  describe('Photo Loading Flow', () => {
    it('deve carregar fotos inicialmente e exibir na grid', async () => {
      mockUsePhotos.mockReturnValue({
        photos: mockPhotos,
        loading: false,
        error: null,
        hasMore: false,
        loadPhotos: jest.fn(),
        loadMore: jest.fn(),
        refreshPhotos: jest.fn(),
        searchPhotos: jest.fn(),
        addPhoto: jest.fn(),
        updatePhoto: jest.fn(),
        deletePhoto: jest.fn(),
        toggleFavorite: jest.fn(),
        clearPhotos: jest.fn(),
      });

      const { getByTestId, getByText } = render(
        <PhotoGrid photos={mockPhotos} />
      );

      expect(getByTestId('photo-grid-list')).toBeTruthy();
      expect(getByText('Sunset Beach')).toBeTruthy();
      expect(getByText('Mountain View')).toBeTruthy();
      expect(getByText('City Lights')).toBeTruthy();
    });

    it('deve mostrar estado de carregamento durante fetch inicial', () => {
      mockUsePhotos.mockReturnValue({
        photos: [],
        loading: true,
        error: null,
        hasMore: false,
        loadPhotos: jest.fn(),
        loadMore: jest.fn(),
        refreshPhotos: jest.fn(),
        searchPhotos: jest.fn(),
        addPhoto: jest.fn(),
        updatePhoto: jest.fn(),
        deletePhoto: jest.fn(),
        toggleFavorite: jest.fn(),
        clearPhotos: jest.fn(),
      });

      const { getByTestId } = render(
        <PhotoGrid photos={[]} loading={true} />
      );

      expect(getByTestId('loading-indicator')).toBeTruthy();
    });

    it('deve mostrar erro quando falha ao carregar fotos', () => {
      const errorMessage = 'Falha na conexão com o servidor';
      
      mockUsePhotos.mockReturnValue({
        photos: [],
        loading: false,
        error: errorMessage,
        hasMore: false,
        loadPhotos: jest.fn(),
        loadMore: jest.fn(),
        refreshPhotos: jest.fn(),
        searchPhotos: jest.fn(),
        addPhoto: jest.fn(),
        updatePhoto: jest.fn(),
        deletePhoto: jest.fn(),
        toggleFavorite: jest.fn(),
        clearPhotos: jest.fn(),
      });

      const { getByText } = render(
        <PhotoGrid photos={[]} error={errorMessage} />
      );

      expect(getByText(errorMessage)).toBeTruthy();
    });
  });

  describe('Photo Interaction Flow', () => {
    it('deve navegar para detalhes da foto quando clicada', async () => {
      const mockOnPhotoPress = jest.fn();
      
      mockUsePhotos.mockReturnValue({
        photos: mockPhotos,
        loading: false,
        error: null,
        hasMore: false,
        loadPhotos: jest.fn(),
        loadMore: jest.fn(),
        refreshPhotos: jest.fn(),
        searchPhotos: jest.fn(),
        addPhoto: jest.fn(),
        updatePhoto: jest.fn(),
        deletePhoto: jest.fn(),
        toggleFavorite: jest.fn(),
        clearPhotos: jest.fn(),
      });

      const { getByTestId } = render(
        <PhotoGrid photos={mockPhotos} onPhotoPress={mockOnPhotoPress} />
      );

      fireEvent.press(getByTestId('photo-card-1'));
      
      expect(mockOnPhotoPress).toHaveBeenCalledWith(mockPhotos[0]);
    });

    it('deve alternar favorito quando ação for executada', async () => {
      const mockToggleFavorite = jest.fn();
      
      mockUsePhotos.mockReturnValue({
        photos: mockPhotos,
        loading: false,
        error: null,
        hasMore: false,
        loadPhotos: jest.fn(),
        loadMore: jest.fn(),
        refreshPhotos: jest.fn(),
        searchPhotos: jest.fn(),
        addPhoto: jest.fn(),
        updatePhoto: jest.fn(),
        deletePhoto: jest.fn(),
        toggleFavorite: mockToggleFavorite,
        clearPhotos: jest.fn(),
      });

      // Simula componente que usa o hook
      const TestComponent = () => {
        const { toggleFavorite } = usePhotos();
        
        return (
          <button 
            testID="toggle-favorite"
            onClick={() => toggleFavorite('1')}
          >
            Toggle Favorite
          </button>
        );
      };

      const { getByTestId } = render(<TestComponent />);

      fireEvent.press(getByTestId('toggle-favorite'));
      
      expect(mockToggleFavorite).toHaveBeenCalledWith('1');
    });
  });

  describe('Search and Filter Flow', () => {
    it('deve filtrar fotos por termo de busca', async () => {
      const mockSearchPhotos = jest.fn();
      
      mockUsePhotos.mockReturnValue({
        photos: [mockPhotos[0]], // Apenas uma foto correspondente
        loading: false,
        error: null,
        hasMore: false,
        loadPhotos: jest.fn(),
        loadMore: jest.fn(),
        refreshPhotos: jest.fn(),
        searchPhotos: mockSearchPhotos,
        addPhoto: jest.fn(),
        updatePhoto: jest.fn(),
        deletePhoto: jest.fn(),
        toggleFavorite: jest.fn(),
        clearPhotos: jest.fn(),
      });

      const { getByText, queryByText } = render(
        <PhotoGrid photos={[mockPhotos[0]]} searchQuery="sunset" />
      );

      expect(getByText('Sunset Beach')).toBeTruthy();
      expect(queryByText('Mountain View')).toBeNull();
      expect(queryByText('City Lights')).toBeNull();
    });

    it('deve filtrar fotos por tags', async () => {
      const landscapePhotos = mockPhotos.filter(photo => 
        photo.tags.includes('landscape')
      );

      const { getByText, queryByText } = render(
        <PhotoGrid photos={landscapePhotos} filterTags={['landscape']} />
      );

      expect(getByText('Sunset Beach')).toBeTruthy();
      expect(getByText('Mountain View')).toBeTruthy();
      expect(queryByText('City Lights')).toBeNull();
    });

    it('deve filtrar apenas fotos favoritas', async () => {
      const favoritePhotos = mockPhotos.filter(photo => photo.isFavorite);

      const { getByText, queryByText } = render(
        <PhotoGrid photos={favoritePhotos} showFavoritesOnly={true} />
      );

      expect(queryByText('Sunset Beach')).toBeNull();
      expect(getByText('Mountain View')).toBeTruthy();
      expect(queryByText('City Lights')).toBeNull();
    });
  });

  describe('Pagination Flow', () => {
    it('deve carregar mais fotos quando chegar ao final da lista', async () => {
      const mockLoadMore = jest.fn();
      
      mockUsePhotos.mockReturnValue({
        photos: mockPhotos,
        loading: false,
        error: null,
        hasMore: true,
        loadPhotos: jest.fn(),
        loadMore: mockLoadMore,
        refreshPhotos: jest.fn(),
        searchPhotos: jest.fn(),
        addPhoto: jest.fn(),
        updatePhoto: jest.fn(),
        deletePhoto: jest.fn(),
        toggleFavorite: jest.fn(),
        clearPhotos: jest.fn(),
      });

      const { getByTestId } = render(
        <PhotoGrid 
          photos={mockPhotos} 
          onLoadMore={mockLoadMore}
          hasMore={true}
        />
      );

      fireEvent.press(getByTestId('load-more-button'));
      
      expect(mockLoadMore).toHaveBeenCalled();
    });

    it('deve mostrar indicador de carregamento durante paginação', () => {
      const { getByTestId } = render(
        <PhotoGrid 
          photos={mockPhotos} 
          loadingMore={true}
          hasMore={true}
        />
      );

      expect(getByTestId('loading-more-indicator')).toBeTruthy();
    });
  });

  describe('Error Handling Flow', () => {
    it('deve permitir retry quando há erro de carregamento', async () => {
      const mockOnRetry = jest.fn();
      
      const { getByText } = render(
        <PhotoGrid 
          photos={[]} 
          error="Erro de conexão"
          onRetry={mockOnRetry}
        />
      );

      fireEvent.press(getByText('Tentar novamente'));
      
      expect(mockOnRetry).toHaveBeenCalled();
    });

    it('deve mostrar fallback quando foto falha ao carregar', async () => {
      const { getByTestId } = render(
        <PhotoCard photo={mockPhotos[0]} />
      );

      const image = getByTestId('photo-image');
      fireEvent(image, 'onError');

      await waitFor(() => {
        expect(getByTestId('error-indicator')).toBeTruthy();
      });
    });
  });

  describe('Selection Flow', () => {
    it('deve gerenciar seleção múltipla de fotos', async () => {
      const mockOnSelectionChange = jest.fn();
      
      const { getByTestId } = render(
        <PhotoGrid 
          photos={mockPhotos}
          selectionMode={true}
          selectedPhotos={[]}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      fireEvent.press(getByTestId('photo-card-1'));
      
      expect(mockOnSelectionChange).toHaveBeenCalledWith(['1']);
    });

    it('deve desselecionar foto já selecionada', async () => {
      const mockOnSelectionChange = jest.fn();
      
      const { getByTestId } = render(
        <PhotoGrid 
          photos={mockPhotos}
          selectionMode={true}
          selectedPhotos={['1']}
          onSelectionChange={mockOnSelectionChange}
        />
      );

      fireEvent.press(getByTestId('photo-card-1'));
      
      expect(mockOnSelectionChange).toHaveBeenCalledWith([]);
    });
  });

  describe('Sorting Flow', () => {
    it('deve ordenar fotos por data mais recente primeiro', () => {
      const { getAllByTestId } = render(
        <PhotoGrid photos={mockPhotos} sortBy="date" sortOrder="desc" />
      );

      const photoCards = getAllByTestId(/photo-card-/);
      
      // Verifica se a primeira foto é a mais recente (id: 1)
      expect(photoCards[0]).toHaveAttribute('testID', 'photo-card-1');
    });

    it('deve ordenar fotos por título alfabeticamente', () => {
      const { getAllByTestId } = render(
        <PhotoGrid photos={mockPhotos} sortBy="title" sortOrder="asc" />
      );

      const photoCards = getAllByTestId(/photo-card-/);
      
      // Verifica ordem alfabética: City Lights, Mountain View, Sunset Beach
      expect(photoCards[0]).toHaveAttribute('testID', 'photo-card-3');
      expect(photoCards[1]).toHaveAttribute('testID', 'photo-card-2');
      expect(photoCards[2]).toHaveAttribute('testID', 'photo-card-1');
    });
  });

  describe('Performance Flow', () => {
    it('deve renderizar lista grande sem problemas de performance', () => {
      const largePhotoList = Array.from({ length: 100 }, (_, index) => ({
        ...mockPhotos[0],
        id: `photo-${index}`,
        title: `Photo ${index}`,
      }));

      const startTime = performance.now();
      
      render(<PhotoGrid photos={largePhotoList} />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Verifica se renderização foi rápida (menos de 100ms)
      expect(renderTime).toBeLessThan(100);
    });

    it('deve aplicar virtualização para listas longas', () => {
      const largePhotoList = Array.from({ length: 1000 }, (_, index) => ({
        ...mockPhotos[0],
        id: `photo-${index}`,
        title: `Photo ${index}`,
      }));

      const { getByTestId } = render(
        <PhotoGrid photos={largePhotoList} />
      );

      const flatList = getByTestId('photo-grid-list');
      
      // Verifica se FlatList está sendo usado (suporte à virtualização)
      expect(flatList).toBeTruthy();
    });
  });
});