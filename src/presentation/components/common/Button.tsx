import React from 'react';
import { Pressable, Text, ActivityIndicator } from 'react-native';
import styled, { DefaultTheme } from 'styled-components/native';
import { useThemeContext } from '../../providers/ThemeProvider';
import { 
  ButtonProps, 
  withButtonDefaults,
  StyledButtonProps,
  StyledButtonTextProps,
  StyledIconContainerProps,
  PropValidator,
  BUTTON_VARIANTS,
  BUTTON_SIZES,
  BUTTON_ACCESSIBILITY_ROLES
} from './types';

interface StyledButtonPropsInternal {
  variant: string;
  size: string;
  disabled: boolean;
  fullWidth: boolean;
  theme: DefaultTheme;
}

const StyledButton = styled(Pressable)<StyledButtonProps & { theme: DefaultTheme }>`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radius.md}px;
  
  ${({ size, theme }: { size: string; theme: DefaultTheme }) => {
    switch (size) {
      case 'sm':
        return `
          padding: ${theme.spacing(1)}px ${theme.spacing(2)}px;
          min-height: 32px;
        `;
      case 'lg':
        return `
          padding: ${theme.spacing(2)}px ${theme.spacing(4)}px;
          min-height: 48px;
        `;
      default:
        return `
          padding: ${theme.spacing(1.5)}px ${theme.spacing(3)}px;
          min-height: 40px;
        `;
    }
  }}
  
  ${({ variant, theme, disabled }: { variant: string; theme: DefaultTheme; disabled: boolean }) => {
    const opacity = disabled ? 0.5 : 1;
    
    switch (variant) {
      case 'primary':
        return `
          background-color: ${theme.colors.primary};
          opacity: ${opacity};
        `;
      case 'secondary':
        return `
          background-color: ${theme.colors.card};
          border: 1px solid ${theme.colors.border};
          opacity: ${opacity};
        `;
      case 'outline':
        return `
          background-color: transparent;
          border: 1px solid ${theme.colors.primary};
          opacity: ${opacity};
        `;
      case 'ghost':
        return `
          background-color: transparent;
          opacity: ${opacity};
        `;
      case 'danger':
        return `
          background-color: ${theme.colors.danger};
          opacity: ${opacity};
        `;
      default:
        return `
          background-color: ${theme.colors.primary};
          opacity: ${opacity};
        `;
    }
  }}
  
  ${({ fullWidth }: { fullWidth: boolean }) => fullWidth && 'width: 100%;'}
`;

interface ButtonTextProps {
  variant: string;
  size: string;
  theme: DefaultTheme;
}

const ButtonText = styled(Text)<ButtonTextProps>`
  font-weight: 600;
  text-align: center;
  
  ${({ size }: { size: string }) => {
    switch (size) {
      case 'sm':
        return 'font-size: 14px;';
      case 'lg':
        return 'font-size: 18px;';
      default:
        return 'font-size: 16px;';
    }
  }}
  
  ${({ variant, theme }: { variant: string; theme: DefaultTheme }) => {
    switch (variant) {
      case 'primary':
      case 'danger':
        return `color: #FFFFFF;`;
      case 'secondary':
        return `color: ${theme.colors.text};`;
      case 'outline':
        return `color: ${theme.colors.primary};`;
      case 'ghost':
        return `color: ${theme.colors.text};`;
      default:
        return `color: #FFFFFF;`;
    }
  }}
`;

const IconContainer = styled.View<{ position: 'left' | 'right'; hasText: boolean; theme: DefaultTheme }>`
  ${({ position, hasText }: { position: 'left' | 'right'; hasText: boolean }) => {
    if (!hasText) return '';
    
    return position === 'left' 
      ? 'margin-right: 8px;' 
      : 'margin-left: 8px;';
  }}
`;

/**
 * Componente Button reutilizável com múltiplas variantes e tamanhos.
 * 
 * @example
 * ```tsx
 * <Button 
 *   title="Clique aqui" 
 *   onPress={() => console.log('Pressionado')}
 *   variant="primary"
 *   size="md"
 * />
 * ```
 * 
 * @example Com ícone
 * ```tsx
 * <Button 
 *   title="Salvar" 
 *   onPress={handleSave}
 *   icon={<SaveIcon />}
 *   loading={isLoading}
 * />
 * ```
 */
export const Button: React.FC<ButtonProps> = React.memo((props) => {
  // Validação de props em tempo de execução (apenas em desenvolvimento)
  if (__DEV__) {
    PropValidator.required(props.title, 'title', 'Button');
    PropValidator.func(props.onPress, 'onPress', 'Button');
    
    if (props.variant) {
      PropValidator.oneOf(props.variant, BUTTON_VARIANTS, 'variant', 'Button');
    }
    
    if (props.size) {
      PropValidator.oneOf(props.size, BUTTON_SIZES, 'size', 'Button');
    }
    
    if (props.accessibilityRole) {
      PropValidator.oneOf(props.accessibilityRole, BUTTON_ACCESSIBILITY_ROLES, 'accessibilityRole', 'Button');
    }
    
    if (props.style) {
      PropValidator.style(props.style, 'style', 'Button');
    }
    
    if (props.textStyle) {
      PropValidator.style(props.textStyle, 'textStyle', 'Button');
    }
  }

  // Aplicar valores padrão
  const propsWithDefaults = withButtonDefaults(props);
  
  const {
    title,
    onPress,
    variant,
    size,
    disabled,
    loading,
    icon,
    iconPosition,
    fullWidth,
    style,
    textStyle,
    testID,
    accessibilityLabel,
    accessibilityHint,
    accessibilityRole,
  } = propsWithDefaults;

  const { theme } = useThemeContext();
  
  const isDisabled = disabled || loading;
  
  const handlePress = () => {
    if (!isDisabled) {
      onPress();
    }
  };

  const renderIcon = () => {
    if (loading) {
      const spinnerColor = variant === 'primary' || variant === 'danger' 
        ? '#FFFFFF' 
        : theme.colors.primary;
      
      return (
        <IconContainer position={iconPosition} hasText={!!title}>
          <ActivityIndicator size="small" color={spinnerColor} />
        </IconContainer>
      );
    }
    
    if (icon) {
      return (
        <IconContainer position={iconPosition} hasText={!!title}>
          {icon}
        </IconContainer>
      );
    }
    
    return null;
  };

  return (
    <StyledButton
      onPress={handlePress}
      variant={variant}
      size={size}
      disabled={isDisabled}
      fullWidth={fullWidth}
      theme={theme}
      style={style}
      testID={testID}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      accessibilityState={{
        disabled: isDisabled,
        busy: loading
      }}
      android_ripple={{
        color: variant === 'primary' || variant === 'danger' 
          ? 'rgba(255, 255, 255, 0.2)' 
          : 'rgba(0, 0, 0, 0.1)'
      }}
    >
      {iconPosition === 'left' && renderIcon()}
      
      {title && (
        <ButtonText 
          variant={variant} 
          size={size} 
          theme={theme}
          style={textStyle}
        >
          {title}
        </ButtonText>
      )}
      
      {iconPosition === 'right' && renderIcon()}
    </StyledButton>
  );
});