/**
 * Tipos e interfaces robustas para o componente Button
 */

import { ViewStyle, TextStyle } from 'react-native';
import {
  BaseComponentProps,
  VariantProps,
  SizeProps,
  LoadingProps,
  DisabledProps,
  IconProps,
  FullWidthProps,
  StyleProps
} from './validation';

/** Variantes visuais disponíveis para o botão */
export const BUTTON_VARIANTS = ['primary', 'secondary', 'outline', 'ghost', 'danger'] as const;
export type ButtonVariant = typeof BUTTON_VARIANTS[number];

/** Tamanhos disponíveis para o botão */
export const BUTTON_SIZES = ['sm', 'md', 'lg'] as const;
export type ButtonSize = typeof BUTTON_SIZES[number];

/** Papéis de acessibilidade disponíveis para o botão */
export const BUTTON_ACCESSIBILITY_ROLES = ['button', 'link'] as const;
export type ButtonAccessibilityRole = typeof BUTTON_ACCESSIBILITY_ROLES[number];

/**
 * Props do componente Button com validação robusta
 */
export interface ButtonProps extends 
  BaseComponentProps,
  VariantProps<ButtonVariant>,
  SizeProps<ButtonSize>,
  LoadingProps,
  DisabledProps,
  IconProps,
  FullWidthProps,
  Omit<StyleProps, 'style'> {
  
  /** Texto exibido no botão - OBRIGATÓRIO */
  title: string;
  
  /** Função chamada quando o botão é pressionado - OBRIGATÓRIO */
  onPress: () => void;
  
  /** Estilos customizados para o container do botão */
  style?: ViewStyle;
  
  /** Papel do elemento para acessibilidade @default 'button' */
  accessibilityRole?: ButtonAccessibilityRole;
}

/**
 * Props com valores padrão aplicados
 */
export interface ButtonPropsWithDefaults extends Required<
  Pick<ButtonProps, 'variant' | 'size' | 'disabled' | 'loading' | 'fullWidth' | 'iconPosition' | 'accessibilityRole'>
> {
  title: string;
  onPress: () => void;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

/**
 * Valores padrão para o componente Button
 */
export const BUTTON_DEFAULTS: Pick<
  ButtonPropsWithDefaults,
  'variant' | 'size' | 'disabled' | 'loading' | 'fullWidth' | 'iconPosition' | 'accessibilityRole'
> = {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  fullWidth: false,
  iconPosition: 'left',
  accessibilityRole: 'button'
};

/**
 * Props para styled components do Button
 */
export interface StyledButtonProps {
  variant: ButtonVariant;
  size: ButtonSize;
  disabled: boolean;
  loading: boolean;
  fullWidth: boolean;
  hasIcon: boolean;
}

/**
 * Props para o texto do Button
 */
export interface StyledButtonTextProps {
  variant: ButtonVariant;
  size: ButtonSize;
  disabled: boolean;
  loading: boolean;
}

/**
 * Props para o container de ícone do Button
 */
export interface StyledIconContainerProps {
  position: 'left' | 'right';
  size: ButtonSize;
}

/**
 * Type guard para verificar se uma variante é válida
 */
export function isValidButtonVariant(variant: string): variant is ButtonVariant {
  return BUTTON_VARIANTS.includes(variant as ButtonVariant);
}

/**
 * Type guard para verificar se um tamanho é válido
 */
export function isValidButtonSize(size: string): size is ButtonSize {
  return BUTTON_SIZES.includes(size as ButtonSize);
}

/**
 * Type guard para verificar se um papel de acessibilidade é válido
 */
export function isValidButtonAccessibilityRole(role: string): role is ButtonAccessibilityRole {
  return BUTTON_ACCESSIBILITY_ROLES.includes(role as ButtonAccessibilityRole);
}

/**
 * Utilitário para aplicar valores padrão às props
 */
export function withButtonDefaults(props: ButtonProps): ButtonPropsWithDefaults {
  return {
    ...BUTTON_DEFAULTS,
    ...props
  };
}