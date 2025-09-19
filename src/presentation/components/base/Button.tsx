import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { tokens } from '../../../design-system/tokens';

// Tipos de variantes do botão
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

// Props do componente
export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  // Conteúdo
  title: string;
  
  // Variantes
  variant?: ButtonVariant;
  size?: ButtonSize;
  
  // Estados
  loading?: boolean;
  disabled?: boolean;
  
  // Estilos customizados
  style?: ViewStyle;
  textStyle?: TextStyle;
  
  // Ícones (para implementação futura)
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  
  // Largura total
  fullWidth?: boolean;
  
  // Callback
  onPress?: () => void | Promise<void>;
}

// Estilos base do botão
const getButtonStyles = (
  variant: ButtonVariant,
  size: ButtonSize,
  disabled: boolean,
  fullWidth: boolean
): ViewStyle => {
  const baseStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: tokens.borderRadius.md,
    ...tokens.shadows.sm,
  };

  // Tamanhos
  const sizeStyles: Record<ButtonSize, ViewStyle> = {
    sm: {
      height: tokens.components.button.height.sm,
      paddingHorizontal: tokens.components.button.padding.sm.horizontal,
      paddingVertical: tokens.components.button.padding.sm.vertical,
    },
    md: {
      height: tokens.components.button.height.md,
      paddingHorizontal: tokens.components.button.padding.md.horizontal,
      paddingVertical: tokens.components.button.padding.md.vertical,
    },
    lg: {
      height: tokens.components.button.height.lg,
      paddingHorizontal: tokens.components.button.padding.lg.horizontal,
      paddingVertical: tokens.components.button.padding.lg.vertical,
    },
    xl: {
      height: tokens.components.button.height.xl,
      paddingHorizontal: tokens.components.button.padding.xl.horizontal,
      paddingVertical: tokens.components.button.padding.xl.vertical,
    },
  };

  // Variantes
  const variantStyles: Record<ButtonVariant, ViewStyle> = {
    primary: {
      backgroundColor: disabled ? tokens.colors.gray[300] : tokens.colors.primary[500],
      borderWidth: 0,
    },
    secondary: {
      backgroundColor: disabled ? tokens.colors.gray[200] : tokens.colors.secondary[500],
      borderWidth: 0,
    },
    outline: {
      backgroundColor: tokens.colors.transparent,
      borderWidth: tokens.borderWidth[1],
      borderColor: disabled ? tokens.colors.gray[300] : tokens.colors.primary[500],
    },
    ghost: {
      backgroundColor: tokens.colors.transparent,
      borderWidth: 0,
      ...tokens.shadows.sm, // Remove shadow for ghost
      shadowOpacity: 0,
      elevation: 0,
    },
    danger: {
      backgroundColor: disabled ? tokens.colors.gray[300] : tokens.colors.error[500],
      borderWidth: 0,
    },
  };

  // Largura total
  const widthStyle: ViewStyle = fullWidth ? { width: '100%' } : {};

  return {
    ...baseStyle,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...widthStyle,
  };
};

// Estilos do texto
const getTextStyles = (
  variant: ButtonVariant,
  size: ButtonSize,
  disabled: boolean
): TextStyle => {
  const baseStyle: TextStyle = {
    fontWeight: tokens.typography.fontWeight.medium,
    textAlign: 'center',
  };

  // Tamanhos de fonte
  const sizeStyles: Record<ButtonSize, TextStyle> = {
    sm: {
      fontSize: tokens.typography.fontSize.sm,
      lineHeight: tokens.typography.fontSize.sm * tokens.typography.lineHeight.normal,
    },
    md: {
      fontSize: tokens.typography.fontSize.base,
      lineHeight: tokens.typography.fontSize.base * tokens.typography.lineHeight.normal,
    },
    lg: {
      fontSize: tokens.typography.fontSize.lg,
      lineHeight: tokens.typography.fontSize.lg * tokens.typography.lineHeight.normal,
    },
    xl: {
      fontSize: tokens.typography.fontSize.xl,
      lineHeight: tokens.typography.fontSize.xl * tokens.typography.lineHeight.normal,
    },
  };

  // Cores do texto por variante
  const variantTextColors: Record<ButtonVariant, string> = {
    primary: disabled ? tokens.colors.text.disabled : tokens.colors.text.inverse,
    secondary: disabled ? tokens.colors.text.disabled : tokens.colors.text.inverse,
    outline: disabled ? tokens.colors.text.disabled : tokens.colors.primary[500],
    ghost: disabled ? tokens.colors.text.disabled : tokens.colors.primary[500],
    danger: disabled ? tokens.colors.text.disabled : tokens.colors.text.inverse,
  };

  return {
    ...baseStyle,
    ...sizeStyles[size],
    color: variantTextColors[variant],
  };
};

// Componente Button
export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
  fullWidth = false,
  onPress,
  ...props
}) => {
  const isDisabled = disabled || loading;
  
  const buttonStyle = getButtonStyles(variant, size, isDisabled, fullWidth);
  const titleStyle = getTextStyles(variant, size, isDisabled);

  const handlePress = async () => {
    if (isDisabled || !onPress) return;
    
    try {
      await onPress();
    } catch (error) {
      console.error('Button onPress error:', error);
    }
  };

  return (
    <TouchableOpacity
      style={[buttonStyle, style]}
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...props}
    >
      {/* Ícone esquerdo */}
      {leftIcon && !loading && leftIcon}
      
      {/* Loading indicator */}
      {loading && (
        <ActivityIndicator
          size="small"
          color={
            variant === 'outline' || variant === 'ghost'
              ? tokens.colors.primary[500]
              : tokens.colors.text.inverse
          }
          style={{ marginRight: title ? tokens.spacing[2] : 0 }}
        />
      )}
      
      {/* Título */}
      {title && (
        <Text style={[titleStyle, textStyle]} numberOfLines={1}>
          {title}
        </Text>
      )}
      
      {/* Ícone direito */}
      {rightIcon && !loading && rightIcon}
    </TouchableOpacity>
  );
};

// Componentes especializados para casos comuns
export const PrimaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="primary" {...props} />
);

export const SecondaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="secondary" {...props} />
);

export const OutlineButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="outline" {...props} />
);

export const GhostButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="ghost" {...props} />
);

export const DangerButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="danger" {...props} />
);

// Hook para estados de loading do botão
export const useButtonLoading = (initialState = false) => {
  const [loading, setLoading] = React.useState(initialState);
  
  const withLoading = React.useCallback(async (asyncFn: () => Promise<void>) => {
    setLoading(true);
    try {
      await asyncFn();
    } finally {
      setLoading(false);
    }
  }, []);
  
  return { loading, setLoading, withLoading };
};

export default Button;