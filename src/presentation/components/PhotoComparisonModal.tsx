import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '../providers/ThemeProvider';

interface Photo {
  id: string;
  uri: string;
  timestamp: number;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  title?: string;
}

interface PhotoComparisonModalProps {
  visible: boolean;
  photos: Photo[];
  onClose: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const PhotoComparisonModal: React.FC<PhotoComparisonModalProps> = ({
  visible,
  photos,
  onClose,
}) => {
  const { theme } = useThemeContext();
  const [selectedPhotos, setSelectedPhotos] = useState<Photo[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.9)).current;

  React.useEffect(() => {
    if (visible) {
      setSelectedPhotos([]);
      setIsComparing(false);
      Animated.parallel([
        Animated.timing(modalOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(modalScale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(modalOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(modalScale, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [visible]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePhotoSelect = (photo: Photo) => {
    if (selectedPhotos.find(p => p.id === photo.id)) {
      setSelectedPhotos(selectedPhotos.filter(p => p.id !== photo.id));
    } else if (selectedPhotos.length < 2) {
      setSelectedPhotos([...selectedPhotos, photo]);
    }
  };

  const startComparison = () => {
    if (selectedPhotos.length === 2) {
      setIsComparing(true);
    }
  };

  const resetSelection = () => {
    setSelectedPhotos([]);
    setIsComparing(false);
  };

  const renderPhotoGrid = () => (
    <ScrollView style={styles.photoGrid} showsVerticalScrollIndicator={false}>
      <View style={styles.gridContainer}>
        {photos.map((photo) => {
          const isSelected = selectedPhotos.find(p => p.id === photo.id);
          const selectionIndex = selectedPhotos.findIndex(p => p.id === photo.id);
          
          return (
            <TouchableOpacity
              key={photo.id}
              style={[
                styles.gridPhoto,
                isSelected && { borderColor: theme.colors.primary, borderWidth: 3 }
              ]}
              onPress={() => handlePhotoSelect(photo)}
              disabled={!isSelected && selectedPhotos.length >= 2}
            >
              <Image source={{ uri: photo.uri }} style={styles.gridPhotoImage} />
              {isSelected && (
                <View style={[styles.selectionBadge, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.selectionNumber}>{selectionIndex + 1}</Text>
                </View>
              )}
              {!isSelected && selectedPhotos.length >= 2 && (
                <View style={styles.disabledOverlay} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );

  const renderComparison = () => (
    <ScrollView style={styles.comparisonContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.comparisonPhotos}>
        {selectedPhotos.map((photo, index) => (
          <View key={photo.id} style={styles.comparisonPhotoContainer}>
            <Text style={[styles.comparisonTitle, { color: theme.colors.text }]}>
              Foto {index + 1}
            </Text>
            <Image source={{ uri: photo.uri }} style={styles.comparisonPhoto} />
            <View style={[styles.photoDetails, { backgroundColor: theme.colors.background }]}>
              <Text style={[styles.photoTitle, { color: theme.colors.text }]}>
                {photo.title || 'Sem título'}
              </Text>
              <Text style={[styles.photoDate, { color: theme.colors.subtext }]}>
                📅 {formatDate(photo.timestamp)}
              </Text>
              {photo.location && (
                <Text style={[styles.photoLocation, { color: theme.colors.subtext }]}>
                  📍 {photo.location.address || 
                    `${photo.location.latitude.toFixed(6)}, ${photo.location.longitude.toFixed(6)}`}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>
      
      <View style={[styles.comparisonSummary, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>
          Resumo da Comparação
        </Text>
        
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: theme.colors.subtext }]}>
            Diferença de tempo:
          </Text>
          <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
            {Math.abs(selectedPhotos[0].timestamp - selectedPhotos[1].timestamp) > 86400000 
              ? `${Math.floor(Math.abs(selectedPhotos[0].timestamp - selectedPhotos[1].timestamp) / 86400000)} dias`
              : `${Math.floor(Math.abs(selectedPhotos[0].timestamp - selectedPhotos[1].timestamp) / 3600000)} horas`
            }
          </Text>
        </View>
        
        {selectedPhotos[0].location && selectedPhotos[1].location && (
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: theme.colors.subtext }]}>
              Distância aproximada:
            </Text>
            <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
              {calculateDistance(
                selectedPhotos[0].location.latitude,
                selectedPhotos[0].location.longitude,
                selectedPhotos[1].location.latitude,
                selectedPhotos[1].location.longitude
              ).toFixed(2)} km
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          styles.overlay,
          {
            backgroundColor: theme.colors.modalOverlay,
            opacity: modalOpacity,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.modal,
            {
              backgroundColor: theme.colors.card,
              transform: [{ scale: modalScale }],
            },
          ]}
        >
          <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {isComparing ? 'Comparação de Fotos' : 'Selecionar Fotos para Comparar'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.subtext} />
            </TouchableOpacity>
          </View>

          {!isComparing && (
            <View style={styles.instructions}>
              <Text style={[styles.instructionText, { color: theme.colors.subtext }]}>
                Selecione 2 fotos para comparar ({selectedPhotos.length}/2)
              </Text>
            </View>
          )}

          <View style={styles.content}>
            {isComparing ? renderComparison() : renderPhotoGrid()}
          </View>

          <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
            {isComparing ? (
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton, { borderColor: theme.colors.border }]}
                onPress={resetSelection}
              >
                <Text style={[styles.buttonText, { color: theme.colors.text }]}>
                  Nova Comparação
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.primaryButton,
                  { backgroundColor: theme.colors.primary },
                  selectedPhotos.length !== 2 && styles.disabledButton
                ]}
                onPress={startComparison}
                disabled={selectedPhotos.length !== 2}
              >
                <Text style={styles.primaryButtonText}>Comparar</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    height: '90%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  instructions: {
    padding: 16,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  photoGrid: {
    flex: 1,
    padding: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridPhoto: {
    width: (screenWidth - 60) / 2,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  gridPhotoImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
  selectionBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionNumber: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  disabledOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
  },
  comparisonContainer: {
    flex: 1,
    padding: 16,
  },
  comparisonPhotos: {
    gap: 20,
  },
  comparisonPhotoContainer: {
    marginBottom: 20,
  },
  comparisonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  comparisonPhoto: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  photoDetails: {
    padding: 12,
    borderRadius: 8,
  },
  photoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  photoDate: {
    fontSize: 12,
    marginBottom: 4,
  },
  photoLocation: {
    fontSize: 12,
  },
  comparisonSummary: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});