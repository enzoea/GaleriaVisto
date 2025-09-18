import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, View, Alert, Text, Image, StyleSheet } from 'react-native';
import { useThemeContext } from '../providers/ThemeProvider';

interface Photo {
  id: string;
  uri: string;
  title?: string;
  timestamp: number;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

interface AnimatedPhotoCardProps {
  photo: Photo;
  index: number;
  onDelete: (id: string) => void;
  onPress?: () => void;
}

export const AnimatedPhotoCard: React.FC<AnimatedPhotoCardProps> = ({ 
  photo, 
  index, 
  onDelete,
  onPress 
}) => {
  const { theme } = useThemeContext();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const deleteScaleAnim = useRef(new Animated.Value(1)).current;
  const shareScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, index]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true, // Mudando para true para ser consistente
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true, // Mudando para true para ser consistente
    }).start();
  };

  const handleDeletePressIn = () => {
    Animated.spring(deleteScaleAnim, {
      toValue: 0.95,
      useNativeDriver: true, // Mudando para true para ser consistente
    }).start();
  };

  const handleDeletePressOut = () => {
    Animated.spring(deleteScaleAnim, {
      toValue: 1,
      useNativeDriver: true, // Mudando para true para ser consistente
    }).start();
  };

  const handleSharePressIn = () => {
    Animated.spring(shareScaleAnim, {
      toValue: 0.95,
      useNativeDriver: true, // Já estava correto
    }).start();
  };

  const handleSharePressOut = () => {
    Animated.spring(shareScaleAnim, {
      toValue: 1,
      useNativeDriver: true, // Já estava correto
    }).start();
  };

  const handleSharePhoto = () => {
    Alert.alert('Compartilhar', 'Funcionalidade de compartilhamento');
  };

  const handleDeletePhoto = () => {
    // Remover o Alert.alert daqui para evitar popup duplo
    // Apenas executar a animação e chamar onDelete
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDelete(photo.id);
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border,
      borderWidth: 1,
      padding: theme.spacing(1),
      borderRadius: theme.radius.md,
      marginBottom: theme.spacing(1),
    },
    image: {
      width: '100%',
      height: 120,
      borderRadius: theme.radius.md,
      marginBottom: theme.spacing(0.5),
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing(0.5),
    },
    textContainer: {
      flex: 1,
    },
    title: {
      color: theme.colors.text,
      fontWeight: '600',
      fontSize: 14,
    },
    date: {
      color: theme.colors.text,
      fontSize: 12,
      opacity: 0.7,
    },
    location: {
      color: theme.colors.text,
      fontSize: 11,
      opacity: 0.6,
      marginTop: 2,
    },
    actionsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionButton: {
      paddingVertical: theme.spacing(0.5),
      paddingHorizontal: theme.spacing(1),
      borderRadius: theme.radius.md,
      marginLeft: theme.spacing(0.5),
    },
    actionText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '600',
    },
  });

  return (
    <Pressable 
      onPressIn={handlePressIn} 
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ],
          }
        ]}
      >
          <Animated.Image 
            source={{ uri: photo.uri }} 
            resizeMode="cover"
            style={[styles.image, { opacity: fadeAnim }]}
          />
          <View>
            <View style={styles.infoRow}>
              <View style={styles.textContainer}>
                {photo.title && <Text style={styles.title}>{photo.title}</Text>}
                <Text style={styles.date}>{formatDate(photo.timestamp)}</Text>
                {photo.location && (
                  <Text style={styles.location}>
                    📍 {photo.location.latitude.toFixed(6)}, {photo.location.longitude.toFixed(6)}
                    {photo.location.address && `\n${photo.location.address}`}
                  </Text>
                )}
              </View>
              <View style={styles.actionsContainer}>
                <Pressable
                  onPressIn={handleDeletePressIn}
                  onPressOut={handleDeletePressOut}
                  onPress={handleDeletePhoto}
                >
                  <Animated.View
                    style={[
                      styles.actionButton,
                      { 
                        backgroundColor: '#ff4444', 
                        transform: [{ scale: deleteScaleAnim }] 
                      }
                    ]}
                  >
                    <Text style={styles.actionText}>🗑️</Text>
                  </Animated.View>
                </Pressable>
              </View>
            </View>
          </View>
        </Animated.View>
      </Pressable>
    );
};