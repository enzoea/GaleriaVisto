/**
 * Tipos e interfaces robustas para o componente Modal
 */

import { ViewStyle } from 'react-native';
import {
  BaseComponentProps,
  SizeProps
} from './validation';

/** Tamanhos disponíveis para o modal */
export const MODAL_SIZES = ['sm', 'md', 'lg', 'xl', 'full'] as const;
export type ModalSize = typeof MODAL_SIZES[number];

/** Posições disponíveis para o modal */
export const MODAL_POSITIONS = ['center', 'bottom', 'top'] as const;
export type ModalPosition = typeof MODAL_POSITIONS[number];

/** Tipos de animação disponíveis */
export const MODAL_ANIMATION_TYPES = ['slide', 'fade', 'none'] as const;
export type ModalAnimationType = typeof MODAL_ANIMATION_TYPES[number];

/** Tipos de backdrop disponíveis */
export const MODAL_BACKDROP_TYPES = ['blur', 'dark', 'light', 'transparent'] as const;
export type ModalBackdropType = typeof MODAL_BACKDROP_TYPES[number];

/**
 * Interface para ações do modal
 */
export interface ModalAction {
  /** Título do botão */
  title: string;
  /** Função chamada quando o botão é pressionado */
  onPress: () => void;
  /** Se o botão está em estado de carregamento @default false */
  loading?: boolean;
  /** Se o botão está desabilitado @default false */
  disabled?: boolean;
  /** Variante visual do botão @default 'primary' para ação primária, 'secondary' para secundária */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  /** ID para testes automatizados */
  testID?: string;
}

/**
 * Props do componente Modal com validação robusta
 */
export interface ModalProps extends 
  BaseComponentProps,
  SizeProps<ModalSize> {
  
  /** Se o modal está visível - OBRIGATÓRIO */
  visible: boolean;
  
  /** Função chamada para fechar o modal - OBRIGATÓRIO */
  onClose: () => void;
  
  /** Conteúdo do modal - OBRIGATÓRIO */
  children: React.ReactNode;
  
  /** Título exibido no cabeçalho do modal */
  title?: string;
  
  /** Subtítulo exibido no cabeçalho do modal */
  subtitle?: string;
  
  /** Posição do modal na tela @default 'center' */
  position?: ModalPosition;
  
  /** Tipo de animação @default 'slide' */
  animationType?: ModalAnimationType;
  
  /** Tipo de backdrop @default 'dark' */
  backdropType?: ModalBackdropType;
  
  /** Se deve exibir o botão de fechar @default true */
  showCloseButton?: boolean;
  
  /** Se deve fechar ao tocar no backdrop @default true */
  closeOnBackdrop?: boolean;
  
  /** Se deve fechar ao pressionar o botão voltar @default true */
  closeOnBackPress?: boolean;
  
  /** Se deve impedir o scroll do conteúdo de fundo @default true */
  preventBackgroundScroll?: boolean;
  
  /** Ação primária (botão principal) */
  primaryAction?: ModalAction;
  
  /** Ação secundária (botão secundário) */
  secondaryAction?: ModalAction;
  
  /** Ações customizadas (botões adicionais) */
  customActions?: ModalAction[];
  
  /** Estilos customizados para o container do modal */
  containerStyle?: ViewStyle;
  
  /** Estilos customizados para o conteúdo do modal */
  contentStyle?: ViewStyle;
  
  /** Estilos customizados para o cabeçalho do modal */
  headerStyle?: ViewStyle;
  
  /** Estilos customizados para o rodapé do modal */
  footerStyle?: ViewStyle;
  
  /** Função chamada quando o modal é aberto */
  onShow?: () => void;
  
  /** Função chamada quando o modal é fechado */
  onDismiss?: () => void;
  
  /** Função chamada quando a animação de abertura termina */
  onAnimationEnd?: () => void;
  
  /** Se deve manter o modal montado quando não visível @default false */
  keepMounted?: boolean;
  
  /** Z-index customizado para o modal */
  zIndex?: number;
}

/**
 * Props com valores padrão aplicados
 */
export interface ModalPropsWithDefaults extends Required<
  Pick<ModalProps, 
    'size' | 
    'position' | 
    'animationType' | 
    'backdropType' | 
    'showCloseButton' | 
    'closeOnBackdrop' | 
    'closeOnBackPress' | 
    'preventBackgroundScroll' | 
    'keepMounted'
  >
> {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  primaryAction?: ModalAction;
  secondaryAction?: ModalAction;
  customActions?: ModalAction[];
  containerStyle?: ViewStyle;
  contentStyle?: ViewStyle;
  headerStyle?: ViewStyle;
  footerStyle?: ViewStyle;
  onShow?: () => void;
  onDismiss?: () => void;
  onAnimationEnd?: () => void;
  zIndex?: number;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

/**
 * Valores padrão para o componente Modal
 */
export const MODAL_DEFAULTS: Pick<
  ModalPropsWithDefaults,
  'size' | 
  'position' | 
  'animationType' | 
  'backdropType' | 
  'showCloseButton' | 
  'closeOnBackdrop' | 
  'closeOnBackPress' | 
  'preventBackgroundScroll' | 
  'keepMounted'
> = {
  size: 'md',
  position: 'center',
  animationType: 'slide',
  backdropType: 'dark',
  showCloseButton: true,
  closeOnBackdrop: true,
  closeOnBackPress: true,
  preventBackgroundScroll: true,
  keepMounted: false
};

/**
 * Props para styled components do Modal
 */
export interface StyledModalProps {
  size: ModalSize;
  position: ModalPosition;
  backdropType: ModalBackdropType;
  visible: boolean;
  zIndex: number;
}

/**
 * Props para o container do Modal
 */
export interface StyledModalContainerProps {
  size: ModalSize;
  position: ModalPosition;
}

/**
 * Props para o backdrop do Modal
 */
export interface StyledBackdropProps {
  type: ModalBackdropType;
  visible: boolean;
}

/**
 * Props para o cabeçalho do Modal
 */
export interface StyledHeaderProps {
  hasTitle: boolean;
  hasSubtitle: boolean;
  showCloseButton: boolean;
}

/**
 * Props para o rodapé do Modal
 */
export interface StyledFooterProps {
  hasActions: boolean;
  actionsCount: number;
}

/**
 * Type guard para verificar se um tamanho é válido
 */
export function isValidModalSize(size: string): size is ModalSize {
  return MODAL_SIZES.includes(size as ModalSize);
}

/**
 * Type guard para verificar se uma posição é válida
 */
export function isValidModalPosition(position: string): position is ModalPosition {
  return MODAL_POSITIONS.includes(position as ModalPosition);
}

/**
 * Type guard para verificar se um tipo de animação é válido
 */
export function isValidModalAnimationType(type: string): type is ModalAnimationType {
  return MODAL_ANIMATION_TYPES.includes(type as ModalAnimationType);
}

/**
 * Type guard para verificar se um tipo de backdrop é válido
 */
export function isValidModalBackdropType(type: string): type is ModalBackdropType {
  return MODAL_BACKDROP_TYPES.includes(type as ModalBackdropType);
}

/**
 * Utilitário para aplicar valores padrão às props
 */
export function withModalDefaults(props: ModalProps): ModalPropsWithDefaults {
  return {
    ...MODAL_DEFAULTS,
    zIndex: 1000,
    ...props
  };
}

/**
 * Utilitário para calcular dimensões do modal baseado no tamanho
 */
export interface ModalDimensions {
  width: number | string;
  height: number | string;
  maxWidth: number | string;
  maxHeight: number | string;
}

export function getModalDimensions(size: ModalSize, position: ModalPosition): ModalDimensions {
  const baseDimensions: Record<ModalSize, ModalDimensions> = {
    sm: {
      width: '80%',
      height: 'auto',
      maxWidth: 400,
      maxHeight: '60%'
    },
    md: {
      width: '85%',
      height: 'auto',
      maxWidth: 500,
      maxHeight: '70%'
    },
    lg: {
      width: '90%',
      height: 'auto',
      maxWidth: 600,
      maxHeight: '80%'
    },
    xl: {
      width: '95%',
      height: 'auto',
      maxWidth: 800,
      maxHeight: '90%'
    },
    full: {
      width: '100%',
      height: '100%',
      maxWidth: '100%',
      maxHeight: '100%'
    }
  };

  const dimensions = baseDimensions[size];

  // Ajustar dimensões baseado na posição
  if (position === 'bottom' || position === 'top') {
    return {
      ...dimensions,
      width: '100%',
      height: size === 'full' ? '100%' : 'auto'
    };
  }

  return dimensions;
}

/**
 * Utilitário para validar ações do modal
 */
export function validateModalAction(action: ModalAction, actionName: string): string | null {
  if (!action.title || action.title.trim().length === 0) {
    return `${actionName} deve ter um título válido`;
  }
  
  if (typeof action.onPress !== 'function') {
    return `${actionName} deve ter uma função onPress válida`;
  }
  
  return null;
}

/**
 * Utilitário para validar todas as ações do modal
 */
export function validateModalActions(props: ModalProps): string[] {
  const errors: string[] = [];
  
  if (props.primaryAction) {
    const error = validateModalAction(props.primaryAction, 'Ação primária');
    if (error) errors.push(error);
  }
  
  if (props.secondaryAction) {
    const error = validateModalAction(props.secondaryAction, 'Ação secundária');
    if (error) errors.push(error);
  }
  
  if (props.customActions) {
    props.customActions.forEach((action, index) => {
      const error = validateModalAction(action, `Ação customizada ${index + 1}`);
      if (error) errors.push(error);
    });
  }
  
  return errors;
}