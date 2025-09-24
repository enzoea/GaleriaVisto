import React, { memo, useCallback, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Photo } from '../../../domain/photo/types';
import { tokens } from '../../../design-system/tokens';
import { useErrorHandler } from '../../hooks/useErrorHandler';

interface PhotoCardProps {
  photo: Photo;
  onPress?: (photo: Photo) => void;
  onLongPress?: (photo: Photo) => void;
  onDelete?: (photo: Photo) => void;
  isSelected?: boolean;
  showTitle?: boolean;
  showLocation?: boolean;
  showMetadata?: boolean;
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

const { width: screenWidth } = Dimensions.get('window');

export const PhotoCard: React.FC<PhotoCardProps> = memo(({
  photo,
  onPress,
  onLongPress,
  onDelete,
  isSelected = false,
  showTitle = true,
  showLocation = false,
  showMetadata = false,
  size = 'medium',
  style,
}) => {
  const [scaleValue] = useState(new Animated.Value(1));
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const { reportError } = useErrorHandler();

  const cardSize = {
    small: screenWidth * 0.28,
    medium: screenWidth * 0.45,
    large: screenWidth * 0.9,
  }[size];

  const handlePress = useCallback(() => {
    if (onPress) {
      // Animação de feedback
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      onPress(photo);
    }
  }, [onPress, photo, scaleValue]);

  const handleLongPress = useCallback(() => {
    if (onLongPress) {
      // Vibração háptica (se disponível)
      Animated.timing(scaleValue, {
        toValue: 0.98,
        duration: 150,
        useNativeDriver: true,
      }).start();

      onLongPress(photo);
    }
  }, [onLongPress, photo, scaleValue]);

  const handleDelete = useCallback(() => {
    if (onDelete) {
      Alert.alert(
        'Excluir Foto',
        'Tem certeza que deseja excluir esta foto?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Excluir',
            style: 'destructive',
            onPress: () => onDelete(photo),
          },
        ]
      );
    }
  }, [onDelete, photo]);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoading(false);
    reportError({
      type: 'MEDIA_ERROR',
      message: `Erro ao carregar imagem: ${photo.uri}`,
      severity: 'low',
      context: { photoId: photo.id, uri: photo.uri },
    });
  }, [photo, reportError]);

  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
  }, []);

  const formatDate = useCallback((timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }, []);

  const formatLocation = useCallback((location?: { latitude: number; longitude: number }) => {
    if (!location) return null;
    return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: cardSize,
          height: cardSize,
          transform: [{ scale: scaleValue }],
        },
        isSelected && styles.selected,
        style,
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        onLongPress={handleLongPress}
        activeOpacity={0.8}
        style={styles.touchable}
      >
        <View style={styles.imageContainer}>
          {!imageError ? (
            <Image
              source={{ uri: photo.uri }}
              style={styles.image}
              onLoad={handleImageLoad}
              onError={handleImageError}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>📷</Text>
              <Text style={styles.errorMessage}>Erro ao carregar</Text>
            </View>
          )}

          {imageLoading && !imageError && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Carregando...</Text>
            </View>
          )}

          {isSelected && (
            <View style={styles.selectedOverlay}>
              <Text style={styles.selectedIcon}>✓</Text>
            </View>
          )}
        </View>

        {(showTitle || showLocation || showMetadata) && (
          <View style={styles.infoContainer}>
            {showTitle && photo.title && (
              <Text style={styles.title} numberOfLines={1}>
                {photo.title}
              </Text>
            )}

            {showLocation && photo.location && (
              <Text style={styles.location} numberOfLines={1}>
                📍 {formatLocation(photo.location)}
              </Text>
            )}

            {showMetadata && (
              <Text style={styles.metadata} numberOfLines={1}>
                {formatDate(photo.createdAt)}
              </Text>
            )}
          </View>
        )}
      </TouchableOpacity>

      {onDelete && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={16} color="white" />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: tokens.colors.primary['50'],
    borderRadius: tokens.borderRadius.md,
    margin: tokens.spacing[2],
    ...tokens.shadows.sm,
    overflow: 'hidden',
  },
  selected: {
    borderWidth: 2,
    borderColor: tokens.colors.primary['500'],
    ...tokens.shadows.md,
  },
  touchable: {
    flex: 1,
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: tokens.colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: tokens.colors.text.secondary,
    fontSize: tokens.typography.fontSize.sm,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: tokens.colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 24,
    marginBottom: tokens.spacing[2],
  },
  errorMessage: {
    color: tokens.colors.text.secondary,
    fontSize: tokens.typography.fontSize.sm,
    textAlign: 'center',
  },
  selectedOverlay: {
    position: 'absolute',
    top: tokens.spacing[2],
    right: tokens.spacing[2],
    backgroundColor: tokens.colors.primary['500'],
    borderRadius: tokens.borderRadius.full,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIcon: {
    color: tokens.colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoContainer: {
    padding: tokens.spacing[3],
    backgroundColor: tokens.colors.background.primary,
  },
  title: {
    fontSize: tokens.typography.fontSize.base,
    fontWeight: tokens.typography.fontWeight.medium,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing[2],
  },
  location: {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.spacing[2],
  },
  metadata: {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.disabled,
  },
  deleteButton: {
    position: 'absolute',
    top: tokens.spacing[2],
    left: tokens.spacing[2],
    backgroundColor: '#FF8C00',
    borderRadius: tokens.borderRadius.full,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

PhotoCard.displayName = 'PhotoCard';

export default PhotoCard;