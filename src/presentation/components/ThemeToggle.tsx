import React, { useState, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '../providers/ThemeProvider';
import { ThemeMode } from '../theme';

interface ThemeToggleProps {
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  showLabel = false, 
  size = 'medium' 
}) => {
  const { theme, themeMode, setTheme } = useThemeContext();
  const [showModal, setShowModal] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.8)).current;

  const iconSize = size === 'small' ? 16 : size === 'large' ? 28 : 20;
  const buttonSize = size === 'small' ? 32 : size === 'large' ? 48 : 40;

  const themeOptions: { mode: ThemeMode; label: string; icon: string; description: string }[] = [
    {
      mode: 'light',
      label: 'Claro',
      icon: 'sunny',
      description: 'Sempre usar tema claro'
    },
    {
      mode: 'dark',
      label: 'Escuro',
      icon: 'moon',
      description: 'Sempre usar tema escuro'
    },
    {
      mode: 'auto',
      label: 'Automático',
      icon: 'settings',
      description: 'Seguir configuração do sistema'
    }
  ];

  const handleOptionSelect = async (mode: ThemeMode) => {
    // Animação de rotação ao mudar tema
    Animated.sequence([
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 0,
        useNativeDriver: false,
      }),
    ]).start();

    await setTheme(mode);
    closeModal();
  };

  const openModal = () => {
    setShowModal(true);
    Animated.parallel([
      Animated.timing(modalOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.spring(modalScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(modalOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(modalScale, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setShowModal(false);
    });
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: false,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: false,
    }).start();
  };

  const getIcon = () => {
    switch (themeMode) {
      case 'light':
        return 'sunny';
      case 'dark':
        return 'moon';
      case 'auto':
        return 'phone-portrait';
      default:
        return 'phone-portrait';
    }
  };

  const getThemeModeLabel = () => {
    switch (themeMode) {
      case 'light':
        return 'Claro';
      case 'dark':
        return 'Escuro';
      case 'auto':
        return 'Automático';
      default:
        return 'Automático';
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={openModal}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.toggleButton,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
              width: buttonSize,
              height: buttonSize,
              transform: [
                { scale: scaleAnim },
                { rotate: spin },
              ],
            }
          ]}
        >
          <Ionicons 
            name={getIcon() as any} 
            size={iconSize} 
            color={theme.colors.text} 
          />
        </Animated.View>
      </TouchableOpacity>

      {showLabel && (
        <Text style={[styles.label, { color: theme.colors.subtext }]}>
          {getThemeModeLabel()}
        </Text>
      )}

      <Modal
        visible={showModal}
        transparent
        animationType="none"
        onRequestClose={closeModal}
      >
        <Animated.View 
          style={[
            styles.modalOverlay, 
            { 
              backgroundColor: 'rgba(0,0,0,0.5)',
              opacity: modalOpacity,
            }
          ]}
        >
          <TouchableOpacity 
            style={{ flex: 1 }}
            onPress={closeModal}
            activeOpacity={1}
          >
            <Animated.View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 20,
              }}
            >
              <TouchableOpacity onPress={(e) => e.stopPropagation()} activeOpacity={1}>
                <Animated.View 
                  style={[
                    styles.modalContent, 
                    { 
                      backgroundColor: theme.colors.card,
                      transform: [{ scale: modalScale }],
                    }
                  ]}
                >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Escolher Tema
              </Text>
              <TouchableOpacity
                onPress={closeModal}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={theme.colors.subtext} />
              </TouchableOpacity>
            </View>

            <View style={styles.optionsContainer}>
              {themeOptions.map((option) => (
                <TouchableOpacity
                  key={option.mode}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor: themeMode === option.mode 
                        ? theme.colors.primary + '20' 
                        : 'transparent',
                      borderColor: themeMode === option.mode 
                        ? theme.colors.primary 
                        : theme.colors.border,
                    }
                  ]}
                  onPress={() => handleOptionSelect(option.mode)}
                >
                  <View style={styles.optionContent}>
                    <View style={styles.optionHeader}>
                      <Ionicons 
                        name={option.icon as any} 
                        size={24} 
                        color={themeMode === option.mode 
                          ? theme.colors.primary 
                          : theme.colors.subtext
                        } 
                      />
                      <Text style={[
                        styles.optionLabel,
                        {
                          color: themeMode === option.mode 
                            ? theme.colors.primary 
                            : theme.colors.text
                        }
                      ]}>
                        {option.label}
                      </Text>
                      {themeMode === option.mode && (
                        <Ionicons 
                          name="checkmark-circle" 
                          size={20} 
                          color={theme.colors.primary} 
                        />
                      )}
                    </View>
                    <Text style={[
                      styles.optionDescription,
                      { color: theme.colors.subtext }
                    ]}>
                      {option.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
                </Animated.View>
              </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  toggleButton: {
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  label: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    borderRadius: 16,
    padding: 0,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  optionsContainer: {
    padding: 20,
  },
  optionButton: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  optionContent: {
    padding: 16,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  optionDescription: {
    fontSize: 14,
    marginLeft: 36,
  },
});