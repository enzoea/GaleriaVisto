import React, { memo, useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { FlatList, Dimensions, View, ListRenderItem } from 'react-native';
import styled from 'styled-components/native';
import { Photo } from '../../../domain/entities/Photo';
import { MemoizedPhotoCard } from './MemoizedPhotoCard';
import { useVirtualizedList, useRenderPerformance, useBatchOperations } from '../../hooks/usePerformance';
import { performanceUtils } from '../../../utils/helpers';

interface VirtualizedPhotoGridProps {
  photos: Photo[];
  numColumns?: number;
  itemSize?: number;
  spacing?: number;
  onPhotoPress?: (photo: Photo) => void;
  onPhotoLongPress?: (photo: Photo) => void;
  selectedPhotos?: Set<string>;
  quality?: 'low' | 'medium' | 'high';
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  refreshing?: boolean;
  onRefresh?: () => void;
  ListHeaderComponent?: React.ComponentType<any>;
  ListFooterComponent?: React.ComponentType<any>;
  ListEmptyComponent?: React.ComponentType<any>;
  maxToRenderPerBatch?: number;
  windowSize?: number;
  removeClippedSubviews?: boolean;
}

const Container = styled(View)`
  flex: 1;
  background-color: ${props => props.theme.colors.background};
`;

const LoadingIndicator = styled(View)`
  padding: 20px;
  align-items: center;
  justify-content: center;
`;

const LoadingText = styled.Text`
  color: ${props => props.theme.colors.text};
  font-size: 14px;
`;

// Componente de item da grid otimizado
interface GridItemProps {
  item: Photo[];
  index: number;
  numColumns: number;
  itemSize: number;
  spacing: number;
  onPhotoPress?: (photo: Photo) => void;
  onPhotoLongPress?: (photo: Photo) => void;
  selectedPhotos?: Set<string>;
  quality: 'low' | 'medium' | 'high';
}

const GridRow = styled(View)<{ spacing: number }>`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: ${props => props.spacing}px;
  padding-horizontal: ${props => props.spacing / 2}px;
`;

const GridItemComponent: React.FC<GridItemProps> = memo(({
  item: rowPhotos,
  numColumns,
  itemSize,
  spacing,
  onPhotoPress,
  onPhotoLongPress,
  selectedPhotos,
  quality,
}) => {
  useRenderPerformance('GridItem');

  const renderPhoto = useCallback((photo: Photo, index: number) => {
    const isSelected = selectedPhotos?.has(photo.id) || false;
    
    return (
      <MemoizedPhotoCard
        key={photo.id}
        photo={photo}
        size={itemSize}
        onPress={onPhotoPress}
        onLongPress={onPhotoLongPress}
        isSelected={isSelected}
        quality={quality}
        borderRadius={8}
      />
    );
  }, [itemSize, onPhotoPress, onPhotoLongPress, selectedPhotos, quality]);

  // Preenche com espaços vazios se necessário
  const filledRow = useMemo(() => {
    const filled = [...rowPhotos];
    while (filled.length < numColumns) {
      filled.push(null as any);
    }
    return filled;
  }, [rowPhotos, numColumns]);

  return (
    <GridRow spacing={spacing}>
      {filledRow.map((photo, index) => 
        photo ? renderPhoto(photo, index) : (
          <View key={`empty-${index}`} style={{ width: itemSize, height: itemSize }} />
        )
      )}
    </GridRow>
  );
}, (prevProps, nextProps) => {
  // Comparação otimizada para evitar re-renderizações desnecessárias
  return (
    prevProps.item.length === nextProps.item.length &&
    prevProps.item.every((photo, index) => photo?.id === nextProps.item[index]?.id) &&
    prevProps.numColumns === nextProps.numColumns &&
    prevProps.itemSize === nextProps.itemSize &&
    prevProps.spacing === nextProps.spacing &&
    prevProps.quality === nextProps.quality &&
    prevProps.selectedPhotos === nextProps.selectedPhotos
  );
});

const VirtualizedPhotoGridComponent: React.FC<VirtualizedPhotoGridProps> = ({
  photos,
  numColumns = 3,
  itemSize,
  spacing = 8,
  onPhotoPress,
  onPhotoLongPress,
  selectedPhotos,
  quality = 'medium',
  onEndReached,
  onEndReachedThreshold = 0.5,
  refreshing = false,
  onRefresh,
  ListHeaderComponent,
  ListFooterComponent,
  ListEmptyComponent,
  maxToRenderPerBatch = 10,
  windowSize = 10,
  removeClippedSubviews = true,
}) => {
  useRenderPerformance('VirtualizedPhotoGrid');

  const flatListRef = useRef<FlatList>(null);
  const [screenData, setScreenData] = useState(Dimensions.get('window'));

  // Atualiza dimensões da tela
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(window);
    });

    return () => subscription?.remove();
  }, []);

  // Calcula o tamanho do item baseado na tela se não fornecido
  const calculatedItemSize = useMemo(() => {
    if (itemSize) return itemSize;
    
    const availableWidth = screenData.width - (spacing * (numColumns + 1));
    return Math.floor(availableWidth / numColumns);
  }, [itemSize, screenData.width, spacing, numColumns]);

  // Agrupa fotos em linhas para a grid
  const photoRows = useMemo(() => {
    const rows: Photo[][] = [];
    for (let i = 0; i < photos.length; i += numColumns) {
      rows.push(photos.slice(i, i + numColumns));
    }
    return rows;
  }, [photos, numColumns]);

  // Batch operations para operações pesadas
  const { addToQueue, setProcessor } = useBatchOperations<() => void>(5, 50);

  useEffect(() => {
    setProcessor(async (batch) => {
      batch.forEach(operation => operation());
    });
  }, [setProcessor]);

  // Callbacks otimizados
  const handlePhotoPress = useCallback((photo: Photo) => {
    addToQueue(() => onPhotoPress?.(photo));
  }, [onPhotoPress, addToQueue]);

  const handlePhotoLongPress = useCallback((photo: Photo) => {
    addToQueue(() => onPhotoLongPress?.(photo));
  }, [onPhotoLongPress, addToQueue]);

  // Render item otimizado
  const renderItem: ListRenderItem<Photo[]> = useCallback(({ item, index }) => (
    <GridItemComponent
      item={item}
      index={index}
      numColumns={numColumns}
      itemSize={calculatedItemSize}
      spacing={spacing}
      onPhotoPress={handlePhotoPress}
      onPhotoLongPress={handlePhotoLongPress}
      selectedPhotos={selectedPhotos}
      quality={quality}
    />
  ), [
    numColumns,
    calculatedItemSize,
    spacing,
    handlePhotoPress,
    handlePhotoLongPress,
    selectedPhotos,
    quality,
  ]);

  // Key extractor otimizado
  const keyExtractor = useCallback((item: Photo[], index: number) => {
    return `row-${index}-${item.map(p => p?.id).join('-')}`;
  }, []);

  // Função para obter layout do item
  const getItemLayout = useCallback((data: any, index: number) => ({
    length: calculatedItemSize + spacing,
    offset: (calculatedItemSize + spacing) * index,
    index,
  }), [calculatedItemSize, spacing]);

  // Componente de loading otimizado
  const renderFooter = useCallback(() => {
    if (!refreshing) return ListFooterComponent ? <ListFooterComponent /> : null;
    
    return (
      <LoadingIndicator>
        <LoadingText>Carregando mais fotos...</LoadingText>
      </LoadingIndicator>
    );
  }, [refreshing, ListFooterComponent]);

  // Throttled scroll handler
  const handleScroll = useCallback(
    performanceUtils.throttle((event: any) => {
      // Lógica adicional de scroll se necessário
    }, 100),
    []
  );

  return (
    <Container>
      <FlatList
        ref={flatListRef}
        data={photoRows}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={1}
        getItemLayout={getItemLayout}
        onEndReached={onEndReached}
        onEndReachedThreshold={onEndReachedThreshold}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={ListEmptyComponent}
        maxToRenderPerBatch={maxToRenderPerBatch}
        windowSize={windowSize}
        removeClippedSubviews={removeClippedSubviews}
        initialNumToRender={maxToRenderPerBatch}
        onScroll={handleScroll}
        scrollEventThrottle={100}
        // Otimizações de performance
        disableIntervalMomentum={true}
        disableScrollViewPanResponder={true}
        keyboardShouldPersistTaps="handled"
        // Otimizações de memória
        legacyImplementation={false}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10,
        }}
      />
    </Container>
  );
};

// Função de comparação para React.memo
const arePropsEqual = (
  prevProps: VirtualizedPhotoGridProps,
  nextProps: VirtualizedPhotoGridProps
): boolean => {
  return (
    prevProps.photos.length === nextProps.photos.length &&
    prevProps.photos.every((photo, index) => photo.id === nextProps.photos[index]?.id) &&
    prevProps.numColumns === nextProps.numColumns &&
    prevProps.itemSize === nextProps.itemSize &&
    prevProps.spacing === nextProps.spacing &&
    prevProps.quality === nextProps.quality &&
    prevProps.selectedPhotos === nextProps.selectedPhotos &&
    prevProps.refreshing === nextProps.refreshing
  );
};

export const VirtualizedPhotoGrid = memo(VirtualizedPhotoGridComponent, arePropsEqual);

// Hook para usar o grid virtualizado com configurações otimizadas
export const useVirtualizedPhotoGrid = (
  photos: Photo[],
  options: Partial<VirtualizedPhotoGridProps> = {}
) => {
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  // Callbacks otimizados
  const handlePhotoPress = useCallback((photo: Photo) => {
    options.onPhotoPress?.(photo);
  }, [options.onPhotoPress]);

  const handlePhotoLongPress = useCallback((photo: Photo) => {
    setSelectedPhotos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(photo.id)) {
        newSet.delete(photo.id);
      } else {
        newSet.add(photo.id);
      }
      return newSet;
    });
    options.onPhotoLongPress?.(photo);
  }, [options.onPhotoLongPress]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await options.onRefresh?.();
    } finally {
      setRefreshing(false);
    }
  }, [options.onRefresh]);

  const clearSelection = useCallback(() => {
    setSelectedPhotos(new Set());
  }, []);

  const selectAll = useCallback(() => {
    setSelectedPhotos(new Set(photos.map(p => p.id)));
  }, [photos]);

  return {
    selectedPhotos,
    refreshing,
    handlePhotoPress,
    handlePhotoLongPress,
    handleRefresh,
    clearSelection,
    selectAll,
    VirtualizedPhotoGrid,
  };
};

export default VirtualizedPhotoGrid;