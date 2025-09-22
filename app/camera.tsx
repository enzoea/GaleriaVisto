import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePhotosEnhanced } from '../src/presentation/hooks/usePhotosEnhanced';
import { useLocation } from '../src/presentation/hooks/useLocation';
import { PhotoTitleModal } from '../src/presentation/components/PhotoTitleModal';

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [capturedPhotoData, setCapturedPhotoData] = useState<{
    uri: string;
    location: any;
  } | null>(null);
  
  const cameraRef = useRef<CameraView>(null);
  const { savePhoto } = usePhotosEnhanced();
  const { requestLocation, isLoading: locationLoading } = useLocation();

  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Precisamos da sua permissão para usar a câmera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Conceder permissão</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  async function takePicture() {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        console.log('Foto capturada:', photo);
        
        // Capturar localização
        const location = await requestLocation();
        console.log('Localização capturada:', location);
        
        // Armazenar dados da foto e mostrar modal de título
        setCapturedPhotoData({
          uri: photo.uri,
          location: location || undefined,
        });
        setShowTitleModal(true);
      } catch (error) {
        console.error('Erro ao capturar foto:', error);
        Alert.alert('Erro', 'Não foi possível capturar a foto');
      }
    }
  }

  const handleSaveWithTitle = async (title: string) => {
    if (!capturedPhotoData) return;
    
    try {
      // Salvar a foto com localização e título
      const photoData = {
        uri: capturedPhotoData.uri,
        title: title,
        location: capturedPhotoData.location,
      };
      const savedPhoto = await savePhoto(photoData);
      
      if (savedPhoto) {
        const locationText = capturedPhotoData.location 
          ? `\nLocalização: ${capturedPhotoData.location.latitude.toFixed(6)}, ${capturedPhotoData.location.longitude.toFixed(6)}`
          : '\nLocalização não disponível';
        
        Alert.alert('Sucesso', `Foto "${title}" salva na galeria!${locationText}`, [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Erro', 'Não foi possível salvar a foto');
      }
    } catch (error) {
      console.error('Erro ao salvar foto:', error);
      Alert.alert('Erro', 'Não foi possível salvar a foto');
    } finally {
      setCapturedPhotoData(null);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
            <Ionicons name="camera-reverse" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.captureContainer}>
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        </View>
      </CameraView>
      
      <PhotoTitleModal
        visible={showTitleModal}
        onClose={() => {
          setShowTitleModal(false);
          setCapturedPhotoData(null);
        }}
        onSave={handleSaveWithTitle}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    fontSize: 16,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 20,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  backButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    padding: 10,
  },
  flipButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    padding: 10,
  },
  captureContainer: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  captureButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    margin: 20,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});