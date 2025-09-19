import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PhotoCard } from '../../presentation/components/photo/PhotoCard';
import { Photo } from '../../types/Photo';
import { useErrorHandler } from '../../presentation/hooks/useErrorHandler';

// Mock do hook de erro
jest.mock('../../presentation/hooks/useErrorHandler');
const mockUseErrorHandler = useErrorHandler as jest.MockedFunction<typeof useErrorHandler>;

// Mock do Animated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock do styled-components
jest.mock('styled-components/native', () => ({
  default: {
    View: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    Image: ({ children, ...props }: any) => <img {...props}>{children}</img>,
    Text: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    TouchableOpacity: ({ children, onPress, ...props }: any) => (
      <button onClick={onPress} {...props}>{children}</button>
    ),
  },
}));

describe('PhotoCard', () => {
  const mockPhoto: Photo = {
    id: '1',
    uri: 'https://example.com/photo.jpg',
    title: 'Test Photo',
    description: 'A test photo description',
    timestamp: Date.now(),
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
    tags: ['landscape', 'city'],
    isFavorite: false,
    isPrivate: false,
  };

  const mockReportError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseErrorHandler.mockReturnValue({
      reportError: mockReportError,
    });
  });

  it('deve renderizar corretamente com dados da foto', () => {
    const { getByText, getByRole } = render(
      <PhotoCard photo={mockPhoto} />
    );

    expect(getByText('Test Photo')).toBeTruthy();
    expect(getByRole('img')).toBeTruthy();
  });

  it('deve chamar onPress quando pressionado', () => {
    const mockOnPress = jest.fn();
    const { getByRole } = render(
      <PhotoCard photo={mockPhoto} onPress={mockOnPress} />
    );

    fireEvent.press(getByRole('button'));
    expect(mockOnPress).toHaveBeenCalledWith(mockPhoto);
  });

  it('deve mostrar indicador de carregamento inicialmente', () => {
    const { getByTestId } = render(
      <PhotoCard photo={mockPhoto} />
    );

    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('deve esconder indicador de carregamento após imagem carregar', async () => {
    const { getByRole, queryByTestId } = render(
      <PhotoCard photo={mockPhoto} />
    );

    const image = getByRole('img');
    fireEvent(image, 'onLoad');

    await waitFor(() => {
      expect(queryByTestId('loading-indicator')).toBeNull();
    });
  });

  it('deve mostrar indicador de erro quando imagem falha ao carregar', async () => {
    const { getByRole, getByTestId } = render(
      <PhotoCard photo={mockPhoto} />
    );

    const image = getByRole('img');
    fireEvent(image, 'onError', { nativeEvent: { error: 'Load failed' } });

    await waitFor(() => {
      expect(getByTestId('error-indicator')).toBeTruthy();
    });

    expect(mockReportError).toHaveBeenCalledWith(
      expect.any(Error),
      'photo_load_error',
      { photoId: '1', uri: 'https://example.com/photo.jpg' }
    );
  });

  it('deve aplicar estilo de selecionado quando selected for true', () => {
    const { getByTestId } = render(
      <PhotoCard photo={mockPhoto} selected={true} />
    );

    const container = getByTestId('photo-card-container');
    expect(container.props.style).toMatchObject({
      borderColor: expect.any(String),
      borderWidth: 2,
    });
  });

  it('deve mostrar overlay quando showOverlay for true', () => {
    const { getByTestId } = render(
      <PhotoCard photo={mockPhoto} showOverlay={true} />
    );

    expect(getByTestId('photo-overlay')).toBeTruthy();
    expect(getByTestId('photo-title')).toBeTruthy();
  });

  it('deve aplicar tamanho customizado', () => {
    const customSize = { width: 200, height: 150 };
    const { getByTestId } = render(
      <PhotoCard photo={mockPhoto} size={customSize} />
    );

    const container = getByTestId('photo-card-container');
    expect(container.props.style).toMatchObject({
      width: 200,
      height: 150,
    });
  });

  it('deve mostrar ícone de favorito quando isFavorite for true', () => {
    const favoritePhoto = { ...mockPhoto, isFavorite: true };
    const { getByTestId } = render(
      <PhotoCard photo={favoritePhoto} showOverlay={true} />
    );

    expect(getByTestId('favorite-icon')).toBeTruthy();
  });

  it('deve mostrar ícone de privado quando isPrivate for true', () => {
    const privatePhoto = { ...mockPhoto, isPrivate: true };
    const { getByTestId } = render(
      <PhotoCard photo={privatePhoto} showOverlay={true} />
    );

    expect(getByTestId('private-icon')).toBeTruthy();
  });

  it('deve aplicar animação de entrada quando animateIn for true', () => {
    const { getByTestId } = render(
      <PhotoCard photo={mockPhoto} animateIn={true} />
    );

    const container = getByTestId('photo-card-container');
    // Verifica se o componente tem propriedades de animação
    expect(container.props.style).toBeDefined();
  });

  it('deve chamar onLongPress quando pressionado longamente', () => {
    const mockOnLongPress = jest.fn();
    const { getByRole } = render(
      <PhotoCard photo={mockPhoto} onLongPress={mockOnLongPress} />
    );

    fireEvent(getByRole('button'), 'onLongPress');
    expect(mockOnLongPress).toHaveBeenCalledWith(mockPhoto);
  });

  it('deve aplicar borderRadius customizado', () => {
    const { getByTestId } = render(
      <PhotoCard photo={mockPhoto} borderRadius={16} />
    );

    const container = getByTestId('photo-card-container');
    expect(container.props.style).toMatchObject({
      borderRadius: 16,
    });
  });

  it('deve mostrar placeholder quando URI estiver vazia', () => {
    const photoWithoutUri = { ...mockPhoto, uri: '' };
    const { getByTestId } = render(
      <PhotoCard photo={photoWithoutUri} />
    );

    expect(getByTestId('placeholder-icon')).toBeTruthy();
  });

  it('deve aplicar opacidade reduzida quando disabled for true', () => {
    const { getByTestId } = render(
      <PhotoCard photo={mockPhoto} disabled={true} />
    );

    const container = getByTestId('photo-card-container');
    expect(container.props.style).toMatchObject({
      opacity: 0.5,
    });
  });

  it('deve não chamar onPress quando disabled for true', () => {
    const mockOnPress = jest.fn();
    const { getByRole } = render(
      <PhotoCard photo={mockPhoto} onPress={mockOnPress} disabled={true} />
    );

    fireEvent.press(getByRole('button'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('deve aplicar tema escuro corretamente', () => {
    const { getByTestId } = render(
      <PhotoCard photo={mockPhoto} theme="dark" />
    );

    const container = getByTestId('photo-card-container');
    expect(container.props.style).toMatchObject({
      backgroundColor: expect.stringMatching(/#[0-9a-f]{6}/i),
    });
  });

  it('deve mostrar informações de localização quando disponível', () => {
    const { getByText } = render(
      <PhotoCard photo={mockPhoto} showOverlay={true} showLocation={true} />
    );

    expect(getByText('São Paulo, SP')).toBeTruthy();
  });

  it('deve mostrar data formatada quando showDate for true', () => {
    const { getByTestId } = render(
      <PhotoCard photo={mockPhoto} showOverlay={true} showDate={true} />
    );

    expect(getByTestId('photo-date')).toBeTruthy();
  });

  it('deve aplicar estilo de hover em plataformas web', () => {
    const { getByTestId } = render(
      <PhotoCard photo={mockPhoto} enableHover={true} />
    );

    const container = getByTestId('photo-card-container');
    fireEvent(container, 'onMouseEnter');
    
    // Verifica se o estilo de hover foi aplicado
    expect(container.props.style).toBeDefined();
  });

  it('deve mostrar badge de contagem quando hasMultiple for true', () => {
    const { getByTestId } = render(
      <PhotoCard photo={mockPhoto} hasMultiple={true} multipleCount={5} />
    );

    expect(getByTestId('multiple-badge')).toBeTruthy();
    expect(getByTestId('multiple-count')).toBeTruthy();
  });

  it('deve aplicar filtro de cor quando colorFilter for fornecido', () => {
    const { getByRole } = render(
      <PhotoCard photo={mockPhoto} colorFilter="sepia" />
    );

    const image = getByRole('img');
    expect(image.props.style).toMatchObject({
      filter: 'sepia(1)',
    });
  });

  it('deve mostrar progresso de upload quando uploadProgress for fornecido', () => {
    const { getByTestId } = render(
      <PhotoCard photo={mockPhoto} uploadProgress={0.5} />
    );

    expect(getByTestId('upload-progress')).toBeTruthy();
  });

  it('deve aplicar transformação de escala quando scale for fornecido', () => {
    const { getByTestId } = render(
      <PhotoCard photo={mockPhoto} scale={1.2} />
    );

    const container = getByTestId('photo-card-container');
    expect(container.props.style).toMatchObject({
      transform: [{ scale: 1.2 }],
    });
  });
});