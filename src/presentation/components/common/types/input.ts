/**
 * Tipos e interfaces robustas para o componente Input
 */

import { TextInputProps, ViewStyle } from 'react-native';
import {
  BaseComponentProps,
  VariantProps,
  SizeProps
} from './validation';

/** Variantes visuais disponíveis para o input */
export const INPUT_VARIANTS = ['default', 'filled', 'outline'] as const;
export type InputVariant = typeof INPUT_VARIANTS[number];

/** Tamanhos disponíveis para o input */
export const INPUT_SIZES = ['sm', 'md', 'lg'] as const;
export type InputSize = typeof INPUT_SIZES[number];

/** Tipos de teclado disponíveis */
export const KEYBOARD_TYPES = [
  'default',
  'email-address',
  'numeric',
  'phone-pad',
  'number-pad',
  'decimal-pad',
  'visible-password',
  'ascii-capable',
  'numbers-and-punctuation',
  'url',
  'name-phone-pad',
  'twitter',
  'web-search'
] as const;
export type KeyboardType = typeof KEYBOARD_TYPES[number];

/** Tipos de capitalização automática */
export const AUTO_CAPITALIZE_TYPES = ['none', 'sentences', 'words', 'characters'] as const;
export type AutoCapitalizeType = typeof AUTO_CAPITALIZE_TYPES[number];

/** Tipos de correção automática */
export const AUTO_CORRECT_TYPES = [true, false] as const;
export type AutoCorrectType = typeof AUTO_CORRECT_TYPES[number];

/**
 * Props do componente Input com validação robusta
 */
export interface InputProps extends 
  Omit<TextInputProps, 'style' | 'keyboardType' | 'autoCapitalize' | 'autoCorrect'>,
  BaseComponentProps,
  VariantProps<InputVariant>,
  SizeProps<InputSize> {
  
  /** Label exibido acima do input */
  label?: string;
  
  /** Mensagem de erro exibida abaixo do input */
  error?: string;
  
  /** Texto de ajuda exibido abaixo do input */
  hint?: string;
  
  /** Ícone exibido à esquerda do input */
  leftIcon?: React.ReactNode;
  
  /** Ícone exibido à direita do input */
  rightIcon?: React.ReactNode;
  
  /** Estilos customizados para o container */
  containerStyle?: ViewStyle;
  
  /** Estilos customizados para o input */
  inputStyle?: ViewStyle;
  
  /** Se o campo é obrigatório (exibe asterisco) @default false */
  required?: boolean;
  
  /** Tipo de teclado @default 'default' */
  keyboardType?: KeyboardType;
  
  /** Tipo de capitalização automática @default 'sentences' */
  autoCapitalize?: AutoCapitalizeType;
  
  /** Se deve usar correção automática @default true */
  autoCorrect?: AutoCorrectType;
  
  /** Função chamada quando o valor muda */
  onChangeText?: (text: string) => void;
  
  /** Função chamada quando o input recebe foco */
  onFocus?: () => void;
  
  /** Função chamada quando o input perde foco */
  onBlur?: () => void;
  
  /** Função chamada quando o usuário pressiona submit */
  onSubmitEditing?: () => void;
}

/**
 * Props com valores padrão aplicados
 */
export interface InputPropsWithDefaults extends Required<
  Pick<InputProps, 'variant' | 'size' | 'required' | 'keyboardType' | 'autoCapitalize' | 'autoCorrect'>
> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  value?: string;
  placeholder?: string;
  onChangeText?: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmitEditing?: () => void;
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  secureTextEntry?: boolean;
}

/**
 * Valores padrão para o componente Input
 */
export const INPUT_DEFAULTS: Pick<
  InputPropsWithDefaults,
  'variant' | 'size' | 'required' | 'keyboardType' | 'autoCapitalize' | 'autoCorrect'
> = {
  variant: 'default',
  size: 'md',
  required: false,
  keyboardType: 'default',
  autoCapitalize: 'sentences',
  autoCorrect: true
};

/**
 * Props para styled components do Input
 */
export interface StyledInputProps {
  variant: InputVariant;
  size: InputSize;
  hasError: boolean;
  isFocused: boolean;
  hasLeftIcon: boolean;
  hasRightIcon: boolean;
  disabled: boolean;
}

/**
 * Props para o container do Input
 */
export interface StyledInputContainerProps {
  variant: InputVariant;
  size: InputSize;
  hasError: boolean;
  isFocused: boolean;
  disabled: boolean;
}

/**
 * Props para o label do Input
 */
export interface StyledLabelProps {
  size: InputSize;
  required: boolean;
  hasError: boolean;
}

/**
 * Props para mensagens de erro e hint
 */
export interface StyledMessageProps {
  type: 'error' | 'hint';
  size: InputSize;
}

/**
 * Props para containers de ícones
 */
export interface StyledInputIconContainerProps {
  position: 'left' | 'right';
  size: InputSize;
}

/**
 * Type guard para verificar se uma variante é válida
 */
export function isValidInputVariant(variant: string): variant is InputVariant {
  return INPUT_VARIANTS.includes(variant as InputVariant);
}

/**
 * Type guard para verificar se um tamanho é válido
 */
export function isValidInputSize(size: string): size is InputSize {
  return INPUT_SIZES.includes(size as InputSize);
}

/**
 * Type guard para verificar se um tipo de teclado é válido
 */
export function isValidKeyboardType(type: string): type is KeyboardType {
  return KEYBOARD_TYPES.includes(type as KeyboardType);
}

/**
 * Type guard para verificar se um tipo de capitalização é válido
 */
export function isValidAutoCapitalizeType(type: string): type is AutoCapitalizeType {
  return AUTO_CAPITALIZE_TYPES.includes(type as AutoCapitalizeType);
}

/**
 * Utilitário para aplicar valores padrão às props
 */
export function withInputDefaults(props: InputProps): InputPropsWithDefaults {
  return {
    ...INPUT_DEFAULTS,
    ...props
  };
}

/**
 * Utilitário para validar valor do input
 */
export interface InputValidationRule {
  test: (value: string) => boolean;
  message: string;
}

/**
 * Validações comuns para inputs
 */
export const INPUT_VALIDATIONS = {
  required: (message = 'Este campo é obrigatório'): InputValidationRule => ({
    test: (value) => value.trim().length > 0,
    message
  }),
  
  email: (message = 'Digite um email válido'): InputValidationRule => ({
    test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message
  }),
  
  minLength: (min: number, message?: string): InputValidationRule => ({
    test: (value) => value.length >= min,
    message: message || `Mínimo de ${min} caracteres`
  }),
  
  maxLength: (max: number, message?: string): InputValidationRule => ({
    test: (value) => value.length <= max,
    message: message || `Máximo de ${max} caracteres`
  }),
  
  phone: (message = 'Digite um telefone válido'): InputValidationRule => ({
    test: (value) => /^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(value),
    message
  }),
  
  cpf: (message = 'Digite um CPF válido'): InputValidationRule => ({
    test: (value) => {
      const cpf = value.replace(/\D/g, '');
      if (cpf.length !== 11) return false;
      
      // Verifica se todos os dígitos são iguais
      if (/^(\d)\1{10}$/.test(cpf)) return false;
      
      // Validação dos dígitos verificadores
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf[i]) * (10 - i);
      }
      let digit = 11 - (sum % 11);
      if (digit >= 10) digit = 0;
      if (parseInt(cpf[9]) !== digit) return false;
      
      sum = 0;
      for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf[i]) * (11 - i);
      }
      digit = 11 - (sum % 11);
      if (digit >= 10) digit = 0;
      return parseInt(cpf[10]) === digit;
    },
    message
  })
};

/**
 * Utilitário para validar input
 */
export function validateInput(value: string, rules: InputValidationRule[]): string | null {
  for (const rule of rules) {
    if (!rule.test(value)) {
      return rule.message;
    }
  }
  return null;
}