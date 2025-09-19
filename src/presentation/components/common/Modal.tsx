import React, { useEffect, useRef } from 'react';
import { 
  Modal as RNModal, 
  View, 
  Text, 
  Pressable, 
  Animated, 
  Dimensions,
  BackHandler,
  ViewStyle 
} from 'react-native';
import styled, { DefaultTheme } from 'styled-components/native';
import { useThemeContext } from '../../providers/ThemeProvider';
import { Button } from './Button';
import { 
  ModalProps, 
  withModalDefaults, 
  PropValidator,
  validateModalActions,
  validateModalAction,
  isValidModalSize,
  isValidModalPosition
} from './types';

interface StyledModalPropsInternal {
  size: string;
  position: string;
  theme: DefaultTheme;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const Backdrop = styled(Animated.View)<{ theme: DefaultTheme }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ModalContainer = styled.View<{ position: string; theme: DefaultTheme }>`
  flex: 1;
  ${({ position }: { position: string }) => {
    switch (position) {
      case 'top':
        return 'justify-content: flex-start; padding-top: 50px;';
      case 'bottom':
        return 'justify-content: flex-end;';
      default:
        return 'justify-content: center;';
    }
  }}
  align-items: center;
  padding: 20px;
`;

const ModalContent = styled(Animated.View)<StyledModalPropsInternal>`
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.card};
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radius.lg}px;
  shadow-color: #000;
  shadow-offset: 0px 10px;
  shadow-opacity: 0.25;
  shadow-radius: 20px;
  elevation: 10;
  
  ${({ size, position }: { size: string; position: string }) => {
    const maxWidth = screenWidth - 40;
    const maxHeight = screenHeight - 100;
    
    if (position === 'bottom') {
      return `
        width: 100%;
        max-height: ${maxHeight * 0.9}px;
        border-bottom-left-radius: 0px;
        border-bottom-right-radius: 0px;
      `;
    }
    
    switch (size) {
      case 'sm':
        return `
          width: ${Math.min(300, maxWidth)}px;
          max-height: ${maxHeight * 0.6}px;
        `;
      case 'lg':
        return `
          width: ${Math.min(600, maxWidth)}px;
          max-height: ${maxHeight * 0.8}px;
        `;
      case 'xl':
        return `
          width: ${Math.min(800, maxWidth)}px;
          max-height: ${maxHeight * 0.9}px;
        `;
      case 'full':
        return `
          width: ${maxWidth}px;
          height: ${maxHeight}px;
        `;
      default: // md
        return `
          width: ${Math.min(450, maxWidth)}px;
          max-height: ${maxHeight * 0.7}px;
        `;
    }
  }}
`;

const Header = styled.View<{ theme: DefaultTheme }>`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 0 20px;
  border-bottom: 1px solid ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};
  padding-bottom: 16px;
  margin-bottom: 20px;
`;

const Title = styled(Text)<{ theme: DefaultTheme }>`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.text};
  flex: 1;
`;

const CloseButton = styled(Pressable)<{ theme: DefaultTheme }>`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.background};
`;

const CloseButtonText = styled(Text)<{ theme: DefaultTheme }>`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.subtext};
`;

const Body = styled.View<{ theme: DefaultTheme }>`
  padding: 0 20px;
  flex: 1;
`;

const Footer = styled.View<{ theme: DefaultTheme }>`
  flex-direction: row;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};
  margin-top: 20px;
`;

/**
 * Componente Modal reutilizável com animações e múltiplas configurações.
 * 
 * @example
 * ```tsx
 * <Modal 
 *   visible={isVisible}
 *   onClose={() => setIsVisible(false)}
 *   title="Confirmar ação"
 *   primaryAction={{
 *     title: "Confirmar",
 *     onPress: handleConfirm
 *   }}
 * >
 *   <Text>Deseja realmente continuar?</Text>
 * </Modal>
 * ```
 * 
 * @example Modal de bottom sheet
 * ```tsx
 * <Modal 
 *   visible={isVisible}
 *   onClose={() => setIsVisible(false)}
 *   position="bottom"
 *   size="lg"
 * >
 *   <Text>Conteúdo do bottom sheet</Text>
 * </Modal>
 * ```
 */
export const Modal: React.FC<ModalProps> = React.memo((rawProps) => {
  // Validação de props em desenvolvimento
  if (__DEV__) {
    PropValidator.required(rawProps.visible, 'visible', 'Modal');
    PropValidator.required(rawProps.onClose, 'onClose', 'Modal');
    PropValidator.required(rawProps.children, 'children', 'Modal');
    
    if (rawProps.size) {
      PropValidator.oneOf(rawProps.size, ['sm', 'md', 'lg', 'xl', 'full'], 'size', 'Modal');
    }
    
    if (rawProps.position) {
      PropValidator.oneOf(rawProps.position, ['center', 'bottom', 'top'], 'position', 'Modal');
    }
    
    // Validar ações se fornecidas
    if (rawProps.primaryAction) {
      validateModalAction(rawProps.primaryAction, 'primaryAction');
    }
    if (rawProps.secondaryAction) {
      validateModalAction(rawProps.secondaryAction, 'secondaryAction');
    }
  }

  // Aplicar valores padrão
  const propsWithDefaults = withModalDefaults(rawProps);
  
  const {
    visible,
    onClose,
    title,
    children,
    size,
    position,
    showCloseButton,
    closeOnBackdrop,
    closeOnBackPress,
    primaryAction,
    secondaryAction,
    containerStyle,
    contentStyle,
    testID,
    accessibilityLabel,
    accessibilityHint,
  } = propsWithDefaults;
  const { theme } = useThemeContext();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(position === 'bottom' ? 300 : 0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: position === 'bottom' ? 300 : 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, scaleAnim, slideAnim, position]);

  useEffect(() => {
    if (closeOnBackPress && visible) {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        onClose();
        return true;
      });

      return () => backHandler.remove();
    }
  }, [visible, closeOnBackPress, onClose]);

  const handleBackdropPress = () => {
    if (closeOnBackdrop) {
      onClose();
    }
  };

  const getTransform = () => {
    if (position === 'bottom') {
      return [{ translateY: slideAnim }];
    }
    return [{ scale: scaleAnim }];
  };

  const hasActions = primaryAction || secondaryAction;

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityViewIsModal={true}
      testID={testID}
    >
      <View style={[{ flex: 1 }, containerStyle]}>
        <Backdrop
          style={{ opacity: fadeAnim }}
          as={Pressable}
          onPress={handleBackdropPress}
        />
        
        <ModalContainer position={position}>
          <ModalContent
            size={size}
            position={position}
            theme={theme}
            style={[
              {
                transform: getTransform(),
                opacity: fadeAnim,
              },
              contentStyle,
            ]}
          >
            {(title || showCloseButton) && (
              <Header theme={theme}>
                {title && <Title theme={theme}>{title}</Title>}
                {showCloseButton && (
                  <CloseButton theme={theme} onPress={onClose}>
                    <CloseButtonText theme={theme}>×</CloseButtonText>
                  </CloseButton>
                )}
              </Header>
            )}
            
            <Body>{children}</Body>
            
            {hasActions && (
              <Footer theme={theme}>
                {secondaryAction && (
                  <Button
                    title={secondaryAction.title}
                    onPress={secondaryAction.onPress}
                    variant="outline"
                    disabled={secondaryAction.disabled}
                  />
                )}
                {primaryAction && (
                  <Button
                    title={primaryAction.title}
                    onPress={primaryAction.onPress}
                    loading={primaryAction.loading}
                    disabled={primaryAction.disabled}
                  />
                )}
              </Footer>
            )}
          </ModalContent>
        </ModalContainer>
      </View>
    </RNModal>
  );
});