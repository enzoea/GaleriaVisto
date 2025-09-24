import React, { memo, useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  View,
  StyleSheet,
  Dimensions,
  RefreshControl,
  Text,
  ActivityIndicator,
} from 'react-native';
import { Photo, PhotoFilter } from '../../../domain/photo/types';
import { PhotoCard } from './PhotoCard';
import { tokens } from '../../../design-system/tokens';
import { useErrorHandler } from '../../hooks/useErrorHandler';

interface PhotoGridProps {
  photos: Photo[];
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onLoadMore?: () => void;
  onPhotoPress?: (photo: Photo) => void;
  onPhotoLongPress?: (photo: Photo) => void;
  onPhotoDelete?: (photo: Photo) => void;
  selectedPhotos?: string[];
  numColumns?: number;
  showTitles?: boolean;
  showLocation?: boolean;
  showMetadata?: boolean;
  emptyMessage?: string;
  errorMessage?: string;
  filter?: PhotoFilter;
  style?: any;
}

const { width: screenWidth } = Dimensions.get('window');

export const PhotoGrid: React.FC<PhotoGridProps> = memo(({
  photos,
  loading = false,
  refreshing = false,
  onRefresh,
  onLoadMore,
  onPhotoPress,
  onPhotoLongPress,
  onPhotoDelete,
  selectedPhotos = [],
  numColumns = 2,
  showTitles = false,
  showLocation = false,
  showMetadata = false,
  emptyMessage = 'Nenhuma foto encontrada',
  errorMessage,
  filter,
  style,
}) => {
  const [loadingMore, setLoadingMore] = useState(false);
  const { reportError } = useErrorHandler();

  // Filtrar fotos baseado no filtro
  const filteredPhotos = useMemo(() => {
    if (!filter) return photos;

    return photos.filter(photo => {
      // Filtro por texto
      if (filter.searchText) {
        const searchLower = filter.searchText.toLowerCase();
        const titleMatch = photo.title?.toLowerCase().includes(searchLower);
        const locationMatch = photo.location && 
          `${photo.location.latitude},${photo.location.longitude}`.includes(searchLower);
        
        if (!titleMatch && !locationMatch) return false;
      }

      // Filtro por data
      if (filter.dateRange) {
        const photoDate = photo.createdAt;
        if (filter.dateRange.start && photoDate < filter.dateRange.start) return false;
        if (filter.dateRange.end && photoDate > filter.dateRange.end) return false;
      }

      // Filtro por localização
      if (filter.location && photo.location) {
        const distance = calculateDistance(
          filter.location.latitude,
          filter.location.longitude,
          photo.location.latitude,
          photo.location.longitude
        );
        if (distance > (filter.location.radius || 1000)) return false;
      }

      // Filtro por favoritos
      if (filter.favoritesOnly && !photo.isFavorite) return false;

      return true;
    });
  }, [photos, filter]);

  // Calcular tamanho dos itens baseado no número de colunas
  const itemSize = useMemo(() => {
    const spacing = tokens.spacing.sm;
    const totalSpacing = spacing * (numColumns + 1);
    return (screenWidth - totalSpacing) / numColumns;
  }, [numColumns]);

  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !onLoadMore) return;

    try {
      setLoadingMore(true);
      await onLoadMore();
    } catch (error) {
      reportError({
        type: 'NETWORK_ERROR',
        message: 'Erro ao carregar mais fotos',
        severity: 'medium',
        context: { error },
      });
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, onLoadMore, reportError]);

  const renderPhoto = useCallback(({ item: photo, index }: { item: Photo; index: number }) => {
    const isSelected = selectedPhotos.includes(photo.id);

    return (
      <PhotoCard
        photo={photo}
        onPress={onPhotoPress}
        onLongPress={onPhotoLongPress}
        onDelete={onPhotoDelete}
        isSelected={isSelected}
        showTitle={showTitles}
        showLocation={showLocation}
        showMetadata={showMetadata}
        size="medium"
        style={{
          width: itemSize,
          height: itemSize,
        }}
      />
    );
  }, [
    selectedPhotos,
    onPhotoPress,
    onPhotoLongPress,
    onPhotoDelete,
    showTitles,
    showLocation,
    showMetadata,
    itemSize,
  ]);

  const renderEmpty = useCallback(() => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={tokens.colors.primary.main} />
          <Text style={styles.loadingText}>Carregando fotos...</Text>
        </View>
      );
    }

    if (errorMessage) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>❌</Text>
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        </View>
      );
    }

    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyIcon}>📷</Text>
        <Text style={styles.emptyMessage}>{emptyMessage}</Text>
        {filter && (
          <Text style={styles.filterHint}>
            Tente ajustar os filtros de busca
          </Text>
        )}
      </View>
    );
  }, [loading, errorMessage, emptyMessage, filter]);

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={tokens.colors.primary.main} />
        <Text style={styles.footerText}>Carregando mais...</Text>
      </View>
    );
  }, [loadingMore]);

  const keyExtractor = useCallback((item: Photo) => item.id, []);

  const getItemLayout = useCallback((data: any, index: number) => ({
    length: itemSize,
    offset: itemSize * index,
    index,
  }), [itemSize]);

  return (
    <View style={[styles.container, style]}>
      <FlatList
        data={filteredPhotos}
        renderItem={renderPhoto}
        keyExtractor={keyExtractor}
        numColumns={numColumns}
        contentContainerStyle={styles.contentContainer}
        columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[tokens.colors.primary.main]}
              tintColor={tokens.colors.primary.main}
            />
          ) : undefined
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        getItemLayout={getItemLayout}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={6}
        updateCellsBatchingPeriod={50}
      />

      {/* Indicador de filtros ativos */}
      {filter && (
        <View style={styles.filterIndicator}>
          <Text style={styles.filterText}>
            {filteredPhotos.length} de {photos.length} fotos
          </Text>
        </View>
      )}
    </View>
  );
});

// Função auxiliar para calcular distância entre coordenadas
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c * 1000; // Retorna em metros
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background.primary,
  },
  contentContainer: {
    padding: tokens.spacing.sm,
    flexGrow: 1,
  },
  row: {
    justifyContent: 'space-around',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: tokens.spacing.xl,
  },
  loadingText: {
    marginTop: tokens.spacing.md,
    fontSize: tokens.typography.fontSize.md,
    color: tokens.colors.text.secondary,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: tokens.spacing.md,
  },
  emptyMessage: {
    fontSize: tokens.typography.fontSize.lg,
    color: tokens.colors.text.secondary,
    textAlign: 'center',
    marginBottom: tokens.spacing.sm,
  },
  filterHint: {
    fontSize: tokens.typography.sizes.small,
    color: tokens.colors.text.tertiary,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 48,
    marginBottom: tokens.spacing.md,
  },
  errorMessage: {
    fontSize: tokens.typography.sizes.medium,
    color: tokens.colors.error.main,
    textAlign: 'center',
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: tokens.spacing.md,
  },
  footerText: {
    marginLeft: tokens.spacing.sm,
    fontSize: tokens.typography.sizes.small,
    color: tokens.colors.text.secondary,
  },
  filterIndicator: {
    position: 'absolute',
    bottom: tokens.spacing.md,
    right: tokens.spacing.md,
    backgroundColor: tokens.colors.surface.primary,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.borderRadius.medium,
    ...tokens.shadows.small,
  },
  filterText: {
    fontSize: tokens.typography.sizes.small,
    color: tokens.colors.text.secondary,
  },
});

PhotoGrid.displayName = 'PhotoGrid';

export default PhotoGrid;