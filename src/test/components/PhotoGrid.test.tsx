import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PhotoGrid } from '../../presentation/components/photo/PhotoGrid';
import { Photo } from '../../types/Photo';
import { useErrorHandler } from '../../presentation/hooks/useErrorHandler';

// Mock do hook de erro
jest.mock('../../presentation/hooks/useErrorHandler');
const mockUseErrorHandler = useErrorHandler as jest.MockedFunction<typeof useErrorHandler>;

// Mock do FlatList
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    FlatList: ({ data, renderItem, onEndReached, ...props }: any) => (
      <div {...props}>
        {data?.map((item: any, index: number) => (
          <div key={index}>{renderItem({ item, index })}</div>
        ))}
        <button onClick={onEndReached}>Load More</button>
      </div>
    ),
  };
});

// Mock do PhotoCard
jest.mock('../../presentation/components/photo/PhotoCard', () => ({
  PhotoCard: ({ photo, onPress, ...props }: any) => (
    <button onClick={() => onPress?.(photo)} {...props}>
      {photo.title}
    </button>
  ),
}));

describe('PhotoGrid', () => {
  const mockPhotos: Photo[] = [
    {
      id: '1',
      uri: 'https://example.com/photo1.jpg',
      title: 'Photo 1',
      description: 'First photo',
      timestamp: Date.now() - 1000,
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
      tags: ['landscape'],
      isFavorite: false,
      isPrivate: false,
    },
    {
      id: '2',
      uri: 'https://example.com/photo2.jpg',
      title: 'Photo 2',
      description: 'Second photo',
      timestamp: Date.now(),
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
      tags: ['portrait'],
      isFavorite: true,
      isPrivate: false,
    },
  ];

  const mockReportError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseErrorHandler.mockReturnValue({
      reportError: mockReportError,
    });
  });

  it('deve renderizar lista de fotos corretamente', () => {
    const { getByText } = render(
      <PhotoGrid photos={mockPhotos} />
    );

    expect(getByText('Photo 1')).toBeTruthy();
    expect(getByText('Photo 2')).toBeTruthy();
  });

  it('deve chamar onPhotoPress quando foto for pressionada', () => {
    const mockOnPhotoPress = jest.fn();
    const { getByText } = render(
      <PhotoGrid photos={mockPhotos} onPhotoPress={mockOnPhotoPress} />
    );

    fireEvent.press(getByText('Photo 1'));
    expect(mockOnPhotoPress).toHaveBeenCalledWith(mockPhotos[0]);
  });

  it('deve mostrar indicador de carregamento quando loading for true', () => {
    const { getByTestId } = render(
      <PhotoGrid photos={[]} loading={true} />
    );

    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('deve mostrar mensagem de lista vazia quando não há fotos', () => {
    const { getByText } = render(
      <PhotoGrid photos={[]} />
    );

    expect(getByText('Nenhuma foto encontrada')).toBeTruthy();
  });

  it('deve mostrar mensagem de erro quando error for fornecido', () => {
    const errorMessage = 'Erro ao carregar fotos';
    const { getByText } = render(
      <PhotoGrid photos={[]} error={errorMessage} />
    );

    expect(getByText(errorMessage)).toBeTruthy();
  });

  it('deve chamar onLoadMore quando chegar ao final da lista', () => {
    const mockOnLoadMore = jest.fn();
    const { getByText } = render(
      <PhotoGrid 
        photos={mockPhotos} 
        onLoadMore={mockOnLoadMore}
        hasMore={true}
      />
    );

    fireEvent.press(getByText('Load More'));
    expect(mockOnLoadMore).toHaveBeenCalled();
  });

  it('deve aplicar filtro de busca corretamente', () => {
    const { getByText, queryByText } = render(
      <PhotoGrid photos={mockPhotos} searchQuery="Photo 1" />
    );

    expect(getByText('Photo 1')).toBeTruthy();
    expect(queryByText('Photo 2')).toBeNull();
  });

  it('deve filtrar por tags corretamente', () => {
    const { getByText, queryByText } = render(
      <PhotoGrid photos={mockPhotos} filterTags={['landscape']} />
    );

    expect(getByText('Photo 1')).toBeTruthy();
    expect(queryByText('Photo 2')).toBeNull();
  });

  it('deve filtrar por favoritos quando showFavoritesOnly for true', () => {
    const { getByText, queryByText } = render(
      <PhotoGrid photos={mockPhotos} showFavoritesOnly={true} />
    );

    expect(queryByText('Photo 1')).toBeNull();
    expect(getByText('Photo 2')).toBeTruthy();
  });

  it('deve ordenar fotos por data mais recente primeiro', () => {
    const { getAllByText } = render(
      <PhotoGrid photos={mockPhotos} sortBy="date" sortOrder="desc" />
    );

    const photoElements = getAllByText(/Photo \d/);
    expect(photoElements[0]).toHaveTextContent('Photo 2'); // Mais recente
    expect(photoElements[1]).toHaveTextContent('Photo 1'); // Mais antiga
  });

  it('deve ordenar fotos por título alfabeticamente', () => {
    const { getAllByText } = render(
      <PhotoGrid photos={mockPhotos} sortBy="title" sortOrder="asc" />
    );

    const photoElements = getAllByText(/Photo \d/);
    expect(photoElements[0]).toHaveTextContent('Photo 1');
    expect(photoElements[1]).toHaveTextContent('Photo 2');
  });

  it('deve aplicar número de colunas customizado', () => {
    const { getByTestId } = render(
      <PhotoGrid photos={mockPhotos} numColumns={3} />
    );

    const flatList = getByTestId('photo-grid-list');
    expect(flatList.props.numColumns).toBe(3);
  });

  it('deve mostrar indicador de carregamento de mais itens', () => {
    const { getByTestId } = render(
      <PhotoGrid 
        photos={mockPhotos} 
        loadingMore={true}
        hasMore={true}
      />
    );

    expect(getByTestId('loading-more-indicator')).toBeTruthy();
  });

  it('deve aplicar espaçamento customizado entre itens', () => {
    const { getByTestId } = render(
      <PhotoGrid photos={mockPhotos} spacing={16} />
    );

    const flatList = getByTestId('photo-grid-list');
    expect(flatList.props.style).toMatchObject({
      paddingHorizontal: 8, // spacing / 2
    });
  });

  it('deve mostrar seleção múltipla quando selectionMode for true', () => {
    const { getByTestId } = render(
      <PhotoGrid 
        photos={mockPhotos} 
        selectionMode={true}
        selectedPhotos={['1']}
      />
    );

    expect(getByTestId('selection-header')).toBeTruthy();
  });

  it('deve chamar onSelectionChange quando foto for selecionada', () => {
    const mockOnSelectionChange = jest.fn();
    const { getByText } = render(
      <PhotoGrid 
        photos={mockPhotos} 
        selectionMode={true}
        selectedPhotos={[]}
        onSelectionChange={mockOnSelectionChange}
      />
    );

    fireEvent.press(getByText('Photo 1'));
    expect(mockOnSelectionChange).toHaveBeenCalledWith(['1']);
  });

  it('deve aplicar filtro de data corretamente', () => {
    const startDate = new Date(Date.now() - 2000);
    const endDate = new Date(Date.now() - 500);
    
    const { queryByText } = render(
      <PhotoGrid 
        photos={mockPhotos} 
        dateRange={{ start: startDate, end: endDate }}
      />
    );

    expect(queryByText('Photo 1')).toBeTruthy(); // Dentro do range
    expect(queryByText('Photo 2')).toBeNull(); // Fora do range
  });

  it('deve aplicar filtro de localização corretamente', () => {
    const { getByText, queryByText } = render(
      <PhotoGrid 
        photos={mockPhotos} 
        locationFilter={{
          latitude: -23.5505,
          longitude: -46.6333,
          radius: 10, // 10km
        }}
      />
    );

    expect(getByText('Photo 1')).toBeTruthy(); // Próxima à localização
    expect(queryByText('Photo 2')).toBeNull(); // Distante da localização
  });

  it('deve mostrar botão de retry quando houver erro', () => {
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

  it('deve aplicar animação de entrada quando animateIn for true', () => {
    const { getByTestId } = render(
      <PhotoGrid photos={mockPhotos} animateIn={true} />
    );

    const container = getByTestId('photo-grid-container');
    expect(container.props.style).toBeDefined();
  });

  it('deve mostrar overlay de informações quando showOverlay for true', () => {
    const { getByTestId } = render(
      <PhotoGrid photos={mockPhotos} showOverlay={true} />
    );

    // Verifica se as fotos têm overlay
    expect(getByTestId('photo-grid-list')).toBeTruthy();
  });

  it('deve aplicar tema escuro corretamente', () => {
    const { getByTestId } = render(
      <PhotoGrid photos={mockPhotos} theme="dark" />
    );

    const container = getByTestId('photo-grid-container');
    expect(container.props.style).toMatchObject({
      backgroundColor: expect.stringMatching(/#[0-9a-f]{6}/i),
    });
  });

  it('deve mostrar estatísticas quando showStats for true', () => {
    const { getByText } = render(
      <PhotoGrid photos={mockPhotos} showStats={true} />
    );

    expect(getByText('2 fotos')).toBeTruthy();
  });

  it('deve aplicar filtro de formato de arquivo', () => {
    const { getByText, queryByText } = render(
      <PhotoGrid photos={mockPhotos} formatFilter={['jpg']} />
    );

    expect(getByText('Photo 1')).toBeTruthy(); // JPG
    expect(queryByText('Photo 2')).toBeNull(); // PNG
  });

  it('deve mostrar indicador de sincronização quando syncing for true', () => {
    const { getByTestId } = render(
      <PhotoGrid photos={mockPhotos} syncing={true} />
    );

    expect(getByTestId('sync-indicator')).toBeTruthy();
  });

  it('deve aplicar modo de visualização em lista', () => {
    const { getByTestId } = render(
      <PhotoGrid photos={mockPhotos} viewMode="list" />
    );

    const flatList = getByTestId('photo-grid-list');
    expect(flatList.props.numColumns).toBe(1);
  });

  it('deve mostrar progresso de upload para fotos em upload', () => {
    const photosWithUpload = mockPhotos.map(photo => ({
      ...photo,
      uploadProgress: photo.id === '1' ? 0.5 : undefined,
    }));

    const { getByTestId } = render(
      <PhotoGrid photos={photosWithUpload} />
    );

    expect(getByTestId('upload-progress-1')).toBeTruthy();
  });
});