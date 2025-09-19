import React, { memo, useMemo, useCallback } from 'react';
import { Pressable, View } from 'react-native';
import styled from 'styled-components/native';
import { Photo } from '../../../domain/entities/Photo';
import { useRenderPerformance, useMemoizedData } from '../../hooks/usePerformance';
import { formatters } from '../../../utils/formatters';

interface MemoizedPhotoCardProps {
  photo: Photo;
  size: number;
  onPress?: (photo: Photo) => void;
  onLongPress?: (photo: Photo) => void;
  isSelected?: boolean;
  showOverlay?: boolean;
  borderRadius?: number;
  quality?: 'low' | 'medium' | 'high';
}

const Container = styled(Pressable)<{ 
  size: number; 
  borderRadius: number;
  isSelected: boolean;
}>`
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  border-radius: ${props => props.borderRadius}px;
  overflow: hidden;
  border-width: ${props => props.isSelected ? 3 : 0}px;
  border-color: ${props => props.theme.colors.primary};
  margin: 2px;
`;

const PhotoImage = styled.Image<{ size: number }>`
  width: 100%;
  height: 100%;
  resize-mode: cover;
`;

const Overlay = styled(View)<{ visible: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  opacity: ${props => props.visible ? 1 : 0};
  justify-content: center;
  align-items: center;
`;

const OverlayText = styled.Text`
  color: white;
  font-size: 12px;
  font-weight: bold;
  text-align: center;
`;

const SelectionIndicator = styled(View)<{ visible: boolean }>`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background-color: ${props => props.theme.colors.primary};
  opacity: ${props => props.visible ? 1 : 0};
  justify-content: center;
  align-items: center;
`;

const CheckIcon = styled.Text`
  color: white;
  font-size: 16px;
  font-weight: bold;
`;

// Componente interno memoizado para evitar re-renderizações desnecessárias
const MemoizedPhotoCardComponent: React.FC<MemoizedPhotoCardProps> = ({
  photo,
  size,
  onPress,
  onLongPress,
  isSelected = false,
  showOverlay = false,
  borderRadius = 8,
  quality = 'medium',
}) => {
  // Monitoramento de performance
  useRenderPerformance('MemoizedPhotoCard');

  // Memoização dos dados da foto com comparação customizada
  const memoizedPhoto = useMemoizedData(
    photo,
    [photo.id, photo.uri, photo.title, photo.createdAt],
    (prev, next) => {
      return prev.id === next.id && 
             prev.uri === next.uri && 
             prev.title === next.title &&
             prev.createdAt === next.createdAt;
    }
  );

  // Memoização da URI otimizada baseada na qualidade
  const optimizedUri = useMemo(() => {
    const baseUri = memoizedPhoto.uri;
    
    // Simula otimização de qualidade da imagem
    switch (quality) {
      case 'low':
        return `${baseUri}?w=${Math.floor(size * 0.5)}&q=60`;
      case 'medium':
        return `${baseUri}?w=${size}&q=80`;
      case 'high':
        return `${baseUri}?w=${Math.floor(size * 1.5)}&q=95`;
      default:
        return baseUri;
    }
  }, [memoizedPhoto.uri, size, quality]);

  // Memoização dos estilos computados
  const containerStyle = useMemo(() => ({
    size,
    borderRadius,
    isSelected,
  }), [size, borderRadius, isSelected]);

  // Callbacks memoizados para evitar re-criação
  const handlePress = useCallback(() => {
    onPress?.(memoizedPhoto);
  }, [onPress, memoizedPhoto]);

  const handleLongPress = useCallback(() => {
    onLongPress?.(memoizedPhoto);
  }, [onLongPress, memoizedPhoto]);

  // Memoização do texto do overlay
  const overlayText = useMemo(() => {
    if (!showOverlay) return '';
    
    return formatters.formatPhotoInfo(memoizedPhoto);
  }, [showOverlay, memoizedPhoto]);

  // Memoização das props da imagem
  const imageProps = useMemo(() => ({
    source: { uri: optimizedUri },
    size,
    // Otimizações de carregamento
    resizeMode: 'cover' as const,
    fadeDuration: 200,
    // Cache da imagem
    cache: 'force-cache' as const,
  }), [optimizedUri, size]);

  return (
    <Container
      {...containerStyle}
      onPress={handlePress}
      onLongPress={handleLongPress}
      android_ripple={{ 
        color: 'rgba(255, 255, 255, 0.2)',
        borderless: false 
      }}
    >
      <PhotoImage {...imageProps} />
      
      <Overlay visible={showOverlay}>
        <OverlayText>{overlayText}</OverlayText>
      </Overlay>
      
      <SelectionIndicator visible={isSelected}>
        <CheckIcon>✓</CheckIcon>
      </SelectionIndicator>
    </Container>
  );
};

// Função de comparação customizada para React.memo
const arePropsEqual = (
  prevProps: MemoizedPhotoCardProps,
  nextProps: MemoizedPhotoCardProps
): boolean => {
  // Comparação otimizada das props
  return (
    prevProps.photo.id === nextProps.photo.id &&
    prevProps.photo.uri === nextProps.photo.uri &&
    prevProps.size === nextProps.size &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.showOverlay === nextProps.showOverlay &&
    prevProps.borderRadius === nextProps.borderRadius &&
    prevProps.quality === nextProps.quality &&
    prevProps.onPress === nextProps.onPress &&
    prevProps.onLongPress === nextProps.onLongPress
  );
};

// Exporta o componente memoizado
export const MemoizedPhotoCard = memo(MemoizedPhotoCardComponent, arePropsEqual);

// Hook para usar o componente com otimizações automáticas
export const useMemoizedPhotoCard = (
  photos: Photo[],
  size: number,
  quality: 'low' | 'medium' | 'high' = 'medium'
) => {
  // Memoização da lista de fotos
  const memoizedPhotos = useMemoizedData(
    photos,
    [photos.length, photos.map(p => p.id).join(',')],
    (prev, next) => {
      if (prev.length !== next.length) return false;
      return prev.every((photo, index) => photo.id === next[index]?.id);
    }
  );

  // Memoização das props do componente
  const getPhotoCardProps = useCallback((
    photo: Photo,
    additionalProps: Partial<MemoizedPhotoCardProps> = {}
  ): MemoizedPhotoCardProps => ({
    photo,
    size,
    quality,
    ...additionalProps,
  }), [size, quality]);

  return {
    memoizedPhotos,
    getPhotoCardProps,
    MemoizedPhotoCard,
  };
};

export default MemoizedPhotoCard;