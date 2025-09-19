/**
 * Exportações centralizadas dos tipos e validações dos componentes
 */

// Validação base
export * from './validation';

// Tipos do Button
export * from './button';

// Tipos do Input
export * from './input';

// Tipos do Modal
export * from './modal';

// Re-exportações para facilitar o uso
export type {
  ButtonProps,
  ButtonVariant,
  ButtonSize,
  ButtonPropsWithDefaults
} from './button';

export type {
  InputProps,
  InputVariant,
  InputSize,
  InputPropsWithDefaults,
  InputValidationRule,
  KeyboardType,
  AutoCapitalizeType
} from './input';

export type {
  ModalProps,
  ModalSize,
  ModalPosition,
  ModalAction,
  ModalPropsWithDefaults,
  ModalAnimationType,
  ModalBackdropType
} from './modal';

// Constantes úteis
export {
  BUTTON_VARIANTS,
  BUTTON_SIZES,
  BUTTON_DEFAULTS
} from './button';

export {
  INPUT_VARIANTS,
  INPUT_SIZES,
  INPUT_DEFAULTS,
  INPUT_VALIDATIONS
} from './input';

export {
  MODAL_SIZES,
  MODAL_POSITIONS,
  MODAL_DEFAULTS,
  MODAL_ANIMATION_TYPES,
  MODAL_BACKDROP_TYPES
} from './modal';

// Utilitários
export {
  withButtonDefaults,
  isValidButtonVariant,
  isValidButtonSize
} from './button';

export {
  withInputDefaults,
  isValidInputVariant,
  isValidInputSize,
  validateInput
} from './input';

export {
  withModalDefaults,
  isValidModalSize,
  isValidModalPosition,
  getModalDimensions,
  validateModalActions
} from './modal';

export {
  PropValidator,
  withPropValidation
} from './validation';