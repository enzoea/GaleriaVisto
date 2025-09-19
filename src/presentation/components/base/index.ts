// Componentes base reutilizáveis
export { default as Button } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';
export {
  PrimaryButton,
  SecondaryButton,
  OutlineButton,
  GhostButton,
  DangerButton,
  useButtonLoading,
} from './Button';

export { default as Input } from './Input';
export type { InputProps, InputVariant, InputSize, InputState, InputRef } from './Input';
export {
  SearchInput,
  PasswordInput,
  validators,
} from './Input';

export { default as Modal } from './Modal';
export type { ModalProps, ModalSize, ModalPosition, ModalAnimation } from './Modal';
export {
  AlertModal,
  BottomSheet,
  FullScreenModal,
  useModal,
} from './Modal';

// Re-export design tokens para facilitar o uso
export { tokens } from '../../../design-system/tokens';
export type {
  ColorToken,
  SpacingToken,
  FontSizeToken,
  BorderRadiusToken,
  ShadowToken,
} from '../../../design-system/tokens';
export {
  getColor,
  getSpacing,
  getFontSize,
  getBorderRadius,
  getShadow,
} from '../../../design-system/tokens';