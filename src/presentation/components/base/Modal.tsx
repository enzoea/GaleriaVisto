import React, { useEffect, useRef } from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  ViewStyle,
  TextStyle,
  ModalProps as RNModalProps,
  BackHandler,
} from 'react-native';
import { tokens } from '../../../design-system/tokens';

// Tipos de variantes do modal
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type ModalPosition = 'center' | 'top' | 'bottom';
export type ModalAnimation = 'slide' | 'fade' | 'scale';

// Props do componente
export interface ModalProps extends Omit<RNModalProps, 'animationType'> {
  // Controle de visibilidade
  visible: boolean;
  onClose: () => void;
  
  // Conteúdo
  title?: string;
  children: React.ReactNode;
  
  // Configurações
  size?: ModalSize;
  position?: ModalPosition;
  animation?: ModalAnimation;
  
  // Comportamento
  closeOnBackdropPress?: boolean;
  closeOnBackButton?: boolean;
  showCloseButton?: boolean;
  scrollable?: boolean;
  
  // Estilos customizados
  containerStyle?: ViewStyle;
  contentStyle?: ViewStyle;
  titleStyle?: TextStyle;
  overlayStyle?: ViewStyle;
  
  // Callbacks
  onShow?: () => void;
  onHide?: () => void;
  
  // Acessibilidade
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

// Obter dimensões da tela
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Estilos do overlay
const getOverlayStyles = (position: ModalPosition): ViewStyle => {
  const baseStyle: ViewStyle = {
    flex: 1,
    backgroundColor: tokens.colors.background.overlay,
  };

  const positionStyles: Record<ModalPosition, ViewStyle> = {
    center: {
      justifyContent: 'center',
      alignItems: 'center',
      padding: tokens.spacing[4],
    },
    top: {
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingTop: tokens.spacing[12],
      paddingHorizontal: tokens.spacing[4],
    },
    bottom: {
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingBottom: tokens.spacing[8],
      paddingHorizontal: tokens.spacing[4],
    },
  };

  return {
    ...baseStyle,
    ...positionStyles[position],
  };
};

// Estilos do container do modal
const getModalContainerStyles = (
  size: ModalSize,
  position: ModalPosition
): ViewStyle => {
  const baseStyle: ViewStyle = {
    backgroundColor: tokens.colors.background.primary,
    borderRadius: tokens.borderRadius.xl,
    ...tokens.shadows.lg,
    maxHeight: screenHeight * 0.9,
  };

  // Tamanhos
  const sizeStyles: Record<ModalSize, ViewStyle> = {
    sm: {
      width: Math.min(320, screenWidth - tokens.spacing[8]),
      maxWidth: 320,
    },
    md: {
      width: Math.min(400, screenWidth - tokens.spacing[8]),
      maxWidth: 400,
    },
    lg: {
      width: Math.min(600, screenWidth - tokens.spacing[8]),
      maxWidth: 600,
    },
    xl: {
      width: Math.min(800, screenWidth - tokens.spacing[8]),
      maxWidth: 800,
    },
    full: {
      width: screenWidth - tokens.spacing[8],
      height: screenHeight - tokens.spacing[16],
      maxHeight: screenHeight - tokens.spacing[16],
    },
  };

  // Ajustes por posição
  const positionAdjustments: Record<ModalPosition, ViewStyle> = {
    center: {},
    top: {
      marginTop: 0,
    },
    bottom: {
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      marginBottom: 0,
      width: screenWidth,
      maxWidth: screenWidth,
    },
  };

  return {
    ...baseStyle,
    ...sizeStyles[size],
    ...positionAdjustments[position],
  };
};

// Estilos do header
const getHeaderStyles = (): ViewStyle => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: tokens.spacing[6],
  borderBottomWidth: tokens.borderWidth[1],
  borderBottomColor: tokens.colors.border.light,
});

// Estilos do título
const getTitleStyles = (): TextStyle => ({
  fontSize: tokens.typography.fontSize.xl,
  fontWeight: tokens.typography.fontWeight.semibold,
  color: tokens.colors.text.primary,
  flex: 1,
  marginRight: tokens.spacing[4],
});

// Estilos do conteúdo
const getContentStyles = (scrollable: boolean): ViewStyle => ({
  padding: tokens.spacing[6],
  ...(scrollable ? {} : { flex: 1 }),
});

// Estilos do botão de fechar
const getCloseButtonStyles = (): ViewStyle => ({
  width: 32,
  height: 32,
  borderRadius: tokens.borderRadius.full,
  backgroundColor: tokens.colors.gray[100],
  alignItems: 'center',
  justifyContent: 'center',
});

// Componente Modal
export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  size = 'md',
  position = 'center',
  animation = 'fade',
  closeOnBackdropPress = true,
  closeOnBackButton = true,
  showCloseButton = true,
  scrollable = true,
  containerStyle,
  contentStyle,
  titleStyle,
  overlayStyle,
  onShow,
  onHide,
  accessibilityLabel,
  accessibilityHint,
  ...props
}) => {
  const scaleAnimation = useRef(new Animated.Value(0)).current;
  const slideAnimation = useRef(new Animated.Value(screenHeight)).current;
  const fadeAnimation = useRef(new Animated.Value(0)).current;

  // Configurar animações
  useEffect(() => {
    if (visible) {
      // Animações de entrada
      const animations = [];
      
      if (animation === 'scale') {
        animations.push(
          Animated.spring(scaleAnimation, {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          })
        );
      }
      
      if (animation === 'slide') {
        animations.push(
          Animated.spring(slideAnimation, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          })
        );
      }
      
      animations.push(
        Animated.timing(fadeAnimation, {
          toValue: 1,
          duration: tokens.animation.duration.normal,
          useNativeDriver: true,
        })
      );
      
      Animated.parallel(animations).start();
      onShow?.();
    } else {
      // Animações de saída
      const animations = [];
      
      if (animation === 'scale') {
        animations.push(
          Animated.timing(scaleAnimation, {
            toValue: 0,
            duration: tokens.animation.duration.fast,
            useNativeDriver: true,
          })
        );
      }
      
      if (animation === 'slide') {
        animations.push(
          Animated.timing(slideAnimation, {
            toValue: position === 'bottom' ? screenHeight : -screenHeight,
            duration: tokens.animation.duration.normal,
            useNativeDriver: true,
          })
        );
      }
      
      animations.push(
        Animated.timing(fadeAnimation, {
          toValue: 0,
          duration: tokens.animation.duration.fast,
          useNativeDriver: true,
        })
      );
      
      Animated.parallel(animations).start(() => {
        onHide?.();
      });
    }
  }, [visible, animation, position]);

  // Handler do botão voltar do Android
  useEffect(() => {
    if (!visible || !closeOnBackButton) return;

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });

    return () => backHandler.remove();
  }, [visible, closeOnBackButton, onClose]);

  // Estilos
  const overlayStyles = getOverlayStyles(position);
  const modalContainerStyles = getModalContainerStyles(size, position);
  const headerStyles = getHeaderStyles();
  const titleStyles = getTitleStyles();
  const contentStyles = getContentStyles(scrollable);
  const closeButtonStyles = getCloseButtonStyles();

  // Transformações de animação
  const getAnimationTransform = () => {
    const transforms = [];
    
    if (animation === 'scale') {
      transforms.push({ scale: scaleAnimation });
    }
    
    if (animation === 'slide') {
      transforms.push({ translateY: slideAnimation });
    }
    
    return transforms;
  };

  // Handler do backdrop
  const handleBackdropPress = () => {
    if (closeOnBackdropPress) {
      onClose();
    }
  };

  // Conteúdo do modal
  const renderContent = () => (
    <Animated.View
      style={[
        modalContainerStyles,
        containerStyle,
        {
          opacity: fadeAnimation,
          transform: getAnimationTransform(),
        },
      ]}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole="none"
      accessibilityModal={true}
    >
      {/* Header */}
      {(title || showCloseButton) && (
        <View style={headerStyles}>
          {title && (
            <Text style={[titleStyles, titleStyle]} numberOfLines={2}>
              {title}
            </Text>
          )}
          
          {showCloseButton && (
            <TouchableOpacity
              style={closeButtonStyles}
              onPress={onClose}
              accessibilityLabel="Fechar modal"
              accessibilityRole="button"
            >
              <Text style={{ fontSize: 18, color: tokens.colors.text.secondary }}>
                ✕
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      
      {/* Conteúdo */}
      {scrollable ? (
        <ScrollView
          style={[contentStyles, contentStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[contentStyles, contentStyle]}>
          {children}
        </View>
      )}
    </Animated.View>
  );

  return (
    <RNModal
      visible={visible}
      transparent={true}
      statusBarTranslucent={true}
      animationType="none"
      onRequestClose={onClose}
      {...props}
    >
      <TouchableOpacity
        style={[overlayStyles, overlayStyle]}
        activeOpacity={1}
        onPress={handleBackdropPress}
      >
        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          {renderContent()}
        </TouchableOpacity>
      </TouchableOpacity>
    </RNModal>
  );
};

// Componentes especializados
export const AlertModal: React.FC<
  Omit<ModalProps, 'children'> & {
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    type?: 'info' | 'warning' | 'error' | 'success';
  }
> = ({
  message,
  confirmText = 'OK',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  type = 'info',
  onClose,
  ...props
}) => {
  const getTypeColor = () => {
    switch (type) {
      case 'warning': return tokens.colors.warning[500];
      case 'error': return tokens.colors.error[500];
      case 'success': return tokens.colors.success[500];
      default: return tokens.colors.info[500];
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'success': return '✅';
      default: return 'ℹ️';
    }
  };

  return (
    <Modal size="sm" {...props} onClose={onClose}>
      <View style={{ alignItems: 'center', marginBottom: tokens.spacing[6] }}>
        <Text style={{ fontSize: 48, marginBottom: tokens.spacing[4] }}>
          {getTypeIcon()}
        </Text>
        <Text
          style={{
            fontSize: tokens.typography.fontSize.base,
            color: tokens.colors.text.primary,
            textAlign: 'center',
            lineHeight: tokens.typography.fontSize.base * tokens.typography.lineHeight.relaxed,
          }}
        >
          {message}
        </Text>
      </View>
      
      <View style={{ flexDirection: 'row', gap: tokens.spacing[3] }}>
        {onCancel && (
          <TouchableOpacity
            style={{
              flex: 1,
              height: 44,
              backgroundColor: tokens.colors.gray[200],
              borderRadius: tokens.borderRadius.md,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => {
              onCancel();
              onClose();
            }}
          >
            <Text style={{
              color: tokens.colors.text.primary,
              fontWeight: tokens.typography.fontWeight.medium,
            }}>
              {cancelText}
            </Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={{
            flex: 1,
            height: 44,
            backgroundColor: getTypeColor(),
            borderRadius: tokens.borderRadius.md,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => {
            onConfirm?.();
            onClose();
          }}
        >
          <Text style={{
            color: tokens.colors.text.inverse,
            fontWeight: tokens.typography.fontWeight.medium,
          }}>
            {confirmText}
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export const BottomSheet: React.FC<Omit<ModalProps, 'position' | 'animation'>> = (props) => (
  <Modal position="bottom" animation="slide" {...props} />
);

export const FullScreenModal: React.FC<Omit<ModalProps, 'size'>> = (props) => (
  <Modal size="full" {...props} />
);

// Hook para controlar estado do modal
export const useModal = (initialState = false) => {
  const [isVisible, setIsVisible] = React.useState(initialState);
  
  const show = React.useCallback(() => setIsVisible(true), []);
  const hide = React.useCallback(() => setIsVisible(false), []);
  const toggle = React.useCallback(() => setIsVisible(prev => !prev), []);
  
  return {
    isVisible,
    show,
    hide,
    toggle,
    setIsVisible,
  };
};

export default Modal;