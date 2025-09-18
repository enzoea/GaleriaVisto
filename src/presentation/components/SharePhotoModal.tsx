import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Share,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
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

interface SharePhotoModalProps {
  visible: boolean;
  photo: Photo | null;
  onClose: () => void;
}

export const SharePhotoModal: React.FC<SharePhotoModalProps> = ({
  visible,
  photo,
  onClose,
}) => {
  const { theme } = useThemeContext();
  const [isSharing, setIsSharing] = useState(false);
  
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.8)).current;

  React.useEffect(() => {
    if (visible) {
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
          toValue: 0.8,
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

  const generateMetadataText = () => {
    if (!photo) return '';
    
    let metadata = `📸 Foto: ${photo.title || 'Sem título'}\n`;
    metadata += `📅 Data: ${formatDate(photo.timestamp)}\n`;
    
    if (photo.location) {
      metadata += `📍 Localização: ${photo.location.address || `${photo.location.latitude.toFixed(6)}, ${photo.location.longitude.toFixed(6)}`}\n`;
    }
    
    return metadata;
  };

  const sharePhotoOnly = async () => {
    if (!photo) return;
    
    setIsSharing(true);
    try {
      const result = await Share.share({
        url: photo.uri,
        title: photo.title || 'Foto compartilhada',
      });
      
      if (result.action === Share.sharedAction) {
        Alert.alert('Sucesso', 'Foto compartilhada com sucesso!');
        onClose();
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível compartilhar a foto.');
    } finally {
      setIsSharing(false);
    }
  };

  const sharePhotoWithMetadata = async () => {
    if (!photo) return;
    
    setIsSharing(true);
    try {
      const metadata = generateMetadataText();
      
      const result = await Share.share({
        message: metadata,
        url: photo.uri,
        title: photo.title || 'Foto com metadados',
      });
      
      if (result.action === Share.sharedAction) {
        Alert.alert('Sucesso', 'Foto e metadados compartilhados com sucesso!');
        onClose();
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível compartilhar a foto com metadados.');
    } finally {
      setIsSharing(false);
    }
  };

  const shareMetadataOnly = async () => {
    if (!photo) return;
    
    setIsSharing(true);
    try {
      const metadata = generateMetadataText();
      
      const result = await Share.share({
        message: metadata,
        title: 'Metadados da foto',
      });
      
      if (result.action === Share.sharedAction) {
        Alert.alert('Sucesso', 'Metadados compartilhados com sucesso!');
        onClose();
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível compartilhar os metadados.');
    } finally {
      setIsSharing(false);
    }
  };

  const saveToGallery = async () => {
    if (!photo) return;
    
    setIsSharing(true);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'É necessário permitir acesso à galeria para salvar a foto.');
        return;
      }

      const asset = await MediaLibrary.createAssetAsync(photo.uri);
      await MediaLibrary.createAlbumAsync('Galeria Visto', asset, false);
      
      Alert.alert('Sucesso', 'Foto salva na galeria com sucesso!');
      onClose();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar a foto na galeria.');
    } finally {
      setIsSharing(false);
    }
  };

  if (!photo) return null;

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
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={onClose}
          activeOpacity={1}
        />
        
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
              Compartilhar Foto
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.subtext} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={[styles.metadataPreview, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
              <Text style={[styles.metadataTitle, { color: theme.colors.text }]}>
                Metadados da foto:
              </Text>
              <Text style={[styles.metadataText, { color: theme.colors.subtext }]}>
                {generateMetadataText()}
              </Text>
            </View>

            <View style={styles.options}>
              <TouchableOpacity
                style={[styles.option, { backgroundColor: theme.colors.primary }]}
                onPress={sharePhotoOnly}
                disabled={isSharing}
              >
                <Ionicons name="image" size={24} color="white" />
                <Text style={styles.optionText}>Apenas Foto</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.option, { backgroundColor: theme.colors.warning }]}
                onPress={sharePhotoWithMetadata}
                disabled={isSharing}
              >
                <Ionicons name="document-text" size={24} color="white" />
                <Text style={styles.optionText}>Foto + Metadados</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.option, { backgroundColor: theme.colors.success }]}
                onPress={shareMetadataOnly}
                disabled={isSharing}
              >
                <Ionicons name="information-circle" size={24} color="white" />
                <Text style={styles.optionText}>Apenas Metadados</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.option, { backgroundColor: theme.colors.success }]}
                onPress={saveToGallery}
                disabled={isSharing}
              >
                <Ionicons name="download" size={24} color="white" />
                <Text style={styles.optionText}>Salvar na Galeria</Text>
              </TouchableOpacity>
            </View>
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
    maxWidth: 400,
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
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  metadataPreview: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
  },
  metadataTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  metadataText: {
    fontSize: 12,
    lineHeight: 18,
  },
  options: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 12,
  },
  optionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});