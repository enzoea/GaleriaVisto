import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  TextInputProps,
  Animated,
} from 'react-native';
import { tokens } from '../../../design-system/tokens';

// Tipos de variantes do input
export type InputVariant = 'default' | 'filled' | 'outline';
export type InputSize = 'sm' | 'md' | 'lg' | 'xl';
export type InputState = 'default' | 'error' | 'success' | 'disabled';

// Props do componente
export interface InputProps extends Omit<TextInputProps, 'style'> {
  // Conteúdo
  label?: string;
  placeholder?: string;
  helperText?: string;
  errorText?: string;
  
  // Variantes
  variant?: InputVariant;
  size?: InputSize;
  state?: InputState;
  
  // Comportamento
  required?: boolean;
  disabled?: boolean;
  
  // Estilos customizados
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  
  // Ícones e elementos
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  
  // Largura total
  fullWidth?: boolean;
  
  // Callbacks
  onFocus?: () => void;
  onBlur?: () => void;
  onChangeText?: (text: string) => void;
  
  // Validação
  validator?: (value: string) => string | null;
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
}

// Interface para ref
export interface InputRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
  getValue: () => string;
  setValue: (value: string) => void;
  validate: () => boolean;
}

// Estilos do container
const getContainerStyles = (
  variant: InputVariant,
  size: InputSize,
  state: InputState,
  fullWidth: boolean,
  isFocused: boolean
): ViewStyle => {
  const baseStyle: ViewStyle = {
    flexDirection: 'column',
  };

  // Largura
  const widthStyle: ViewStyle = fullWidth ? { width: '100%' } : {};

  return {
    ...baseStyle,
    ...widthStyle,
  };
};

// Estilos do input wrapper
const getInputWrapperStyles = (
  variant: InputVariant,
  size: InputSize,
  state: InputState,
  isFocused: boolean
): ViewStyle => {
  const baseStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: tokens.borderRadius.md,
  };

  // Tamanhos
  const sizeStyles: Record<InputSize, ViewStyle> = {
    sm: {
      height: tokens.components.input.height.sm,
      paddingHorizontal: tokens.components.input.padding.horizontal,
    },
    md: {
      height: tokens.components.input.height.md,
      paddingHorizontal: tokens.components.input.padding.horizontal,
    },
    lg: {
      height: tokens.components.input.height.lg,
      paddingHorizontal: tokens.components.input.padding.horizontal,
    },
    xl: {
      height: tokens.components.input.height.xl,
      paddingHorizontal: tokens.components.input.padding.horizontal,
    },
  };

  // Variantes
  const variantStyles: Record<InputVariant, ViewStyle> = {
    default: {
      backgroundColor: tokens.colors.background.primary,
      borderBottomWidth: tokens.borderWidth[1],
      borderBottomColor: getBorderColor(state, isFocused),
    },
    filled: {
      backgroundColor: tokens.colors.gray[100],
      borderWidth: 0,
    },
    outline: {
      backgroundColor: tokens.colors.background.primary,
      borderWidth: tokens.borderWidth[1],
      borderColor: getBorderColor(state, isFocused),
    },
  };

  return {
    ...baseStyle,
    ...sizeStyles[size],
    ...variantStyles[variant],
  };
};

// Função para obter cor da borda
const getBorderColor = (state: InputState, isFocused: boolean): string => {
  if (state === 'error') return tokens.colors.error[500];
  if (state === 'success') return tokens.colors.success[500];
  if (state === 'disabled') return tokens.colors.border.light;
  if (isFocused) return tokens.colors.border.focus;
  return tokens.colors.border.medium;
};

// Estilos do input
const getInputStyles = (
  size: InputSize,
  state: InputState,
  hasLeftIcon: boolean,
  hasRightElement: boolean
): TextStyle => {
  const baseStyle: TextStyle = {
    flex: 1,
    fontFamily: tokens.typography.fontFamily.regular,
    color: state === 'disabled' ? tokens.colors.text.disabled : tokens.colors.text.primary,
  };

  // Tamanhos de fonte
  const sizeStyles: Record<InputSize, TextStyle> = {
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

  // Margens para ícones
  const marginStyle: TextStyle = {
    marginLeft: hasLeftIcon ? tokens.spacing[2] : 0,
    marginRight: hasRightElement ? tokens.spacing[2] : 0,
  };

  return {
    ...baseStyle,
    ...sizeStyles[size],
    ...marginStyle,
  };
};

// Estilos do label
const getLabelStyles = (
  size: InputSize,
  state: InputState,
  required: boolean
): TextStyle => {
  const baseStyle: TextStyle = {
    fontFamily: tokens.typography.fontFamily.medium,
    marginBottom: tokens.spacing[1],
  };

  const sizeStyles: Record<InputSize, TextStyle> = {
    sm: {
      fontSize: tokens.typography.fontSize.sm,
    },
    md: {
      fontSize: tokens.typography.fontSize.base,
    },
    lg: {
      fontSize: tokens.typography.fontSize.lg,
    },
    xl: {
      fontSize: tokens.typography.fontSize.xl,
    },
  };

  const colorStyle: TextStyle = {
    color: state === 'disabled' ? tokens.colors.text.disabled : tokens.colors.text.primary,
  };

  return {
    ...baseStyle,
    ...sizeStyles[size],
    ...colorStyle,
  };
};

// Estilos do texto de ajuda
const getHelperTextStyles = (state: InputState): TextStyle => {
  const baseStyle: TextStyle = {
    fontSize: tokens.typography.fontSize.sm,
    marginTop: tokens.spacing[1],
    fontFamily: tokens.typography.fontFamily.regular,
  };

  const colorStyle: TextStyle = {
    color: state === 'error' 
      ? tokens.colors.error[500] 
      : state === 'success'
      ? tokens.colors.success[500]
      : tokens.colors.text.secondary,
  };

  return {
    ...baseStyle,
    ...colorStyle,
  };
};

// Componente Input
export const Input = forwardRef<InputRef, InputProps>(({
  label,
  placeholder,
  helperText,
  errorText,
  variant = 'outline',
  size = 'md',
  state = 'default',
  required = false,
  disabled = false,
  containerStyle,
  inputStyle,
  labelStyle,
  leftIcon,
  rightIcon,
  rightElement,
  fullWidth = true,
  onFocus,
  onBlur,
  onChangeText,
  validator,
  validateOnBlur = true,
  validateOnChange = false,
  value,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(value || '');
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);
  const labelAnimation = useRef(new Animated.Value(value ? 1 : 0)).current;

  // Determinar estado atual (prioridade: error > validationError > state)
  const currentState = errorText || validationError ? 'error' : state;
  const currentErrorText = errorText || validationError;

  // Imperative handle para ref
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
    clear: () => {
      setInternalValue('');
      onChangeText?.('');
    },
    getValue: () => internalValue,
    setValue: (newValue: string) => {
      setInternalValue(newValue);
      onChangeText?.(newValue);
    },
    validate: () => {
      if (validator) {
        const error = validator(internalValue);
        setValidationError(error);
        return !error;
      }
      return true;
    },
  }));

  // Validação
  const validateInput = (text: string) => {
    if (validator) {
      const error = validator(text);
      setValidationError(error);
    }
  };

  // Handlers
  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
    
    // Animar label para cima
    if (variant === 'filled' || variant === 'outline') {
      Animated.timing(labelAnimation, {
        toValue: 1,
        duration: tokens.animation.duration.fast,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
    
    if (validateOnBlur) {
      validateInput(internalValue);
    }
    
    // Animar label para baixo se vazio
    if ((variant === 'filled' || variant === 'outline') && !internalValue) {
      Animated.timing(labelAnimation, {
        toValue: 0,
        duration: tokens.animation.duration.fast,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleChangeText = (text: string) => {
    setInternalValue(text);
    onChangeText?.(text);
    
    if (validateOnChange) {
      validateInput(text);
    }
    
    // Limpar erro de validação quando usuário digita
    if (validationError) {
      setValidationError(null);
    }
  };

  // Estilos
  const containerStyles = getContainerStyles(variant, size, currentState, fullWidth, isFocused);
  const inputWrapperStyles = getInputWrapperStyles(variant, size, currentState, isFocused);
  const textInputStyles = getInputStyles(size, currentState, !!leftIcon, !!(rightIcon || rightElement));
  const labelStyles = getLabelStyles(size, currentState, required);
  const helperStyles = getHelperTextStyles(currentState);

  // Label flutuante para variantes filled e outline
  const isFloatingLabel = variant === 'filled' || variant === 'outline';
  const shouldShowPlaceholder = !isFloatingLabel || isFocused || !label;

  return (
    <View style={[containerStyles, containerStyle]}>
      {/* Label estático */}
      {label && !isFloatingLabel && (
        <Text style={[labelStyles, labelStyle]}>
          {label}
          {required && <Text style={{ color: tokens.colors.error[500] }}> *</Text>}
        </Text>
      )}
      
      {/* Input wrapper */}
      <View style={inputWrapperStyles}>
        {/* Ícone esquerdo */}
        {leftIcon && leftIcon}
        
        {/* Label flutuante */}
        {label && isFloatingLabel && (
          <Animated.Text
            style={[
              labelStyles,
              labelStyle,
              {
                position: 'absolute',
                left: tokens.spacing[3],
                transform: [
                  {
                    translateY: labelAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -tokens.spacing[6]],
                    }),
                  },
                  {
                    scale: labelAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 0.8],
                    }),
                  },
                ],
                backgroundColor: variant === 'outline' ? tokens.colors.background.primary : 'transparent',
                paddingHorizontal: labelAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, tokens.spacing[1]],
                }),
              },
            ]}
            pointerEvents="none"
          >
            {label}
            {required && <Text style={{ color: tokens.colors.error[500] }}> *</Text>}
          </Animated.Text>
        )}
        
        {/* Input */}
        <TextInput
          ref={inputRef}
          style={[textInputStyles, inputStyle]}
          placeholder={shouldShowPlaceholder ? placeholder : undefined}
          placeholderTextColor={tokens.colors.text.disabled}
          value={internalValue}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled && currentState !== 'disabled'}
          {...props}
        />
        
        {/* Elemento direito */}
        {rightElement || rightIcon}
      </View>
      
      {/* Texto de ajuda ou erro */}
      {(helperText || currentErrorText) && (
        <Text style={helperStyles}>
          {currentErrorText || helperText}
        </Text>
      )}
    </View>
  );
});

Input.displayName = 'Input';

// Componentes especializados
export const SearchInput: React.FC<Omit<InputProps, 'leftIcon'>> = (props) => (
  <Input
    leftIcon={
      <Text style={{ color: tokens.colors.text.secondary, fontSize: 16 }}>🔍</Text>
    }
    placeholder="Buscar..."
    {...props}
  />
);

export const PasswordInput: React.FC<Omit<InputProps, 'secureTextEntry' | 'rightElement'>> = (props) => {
  const [showPassword, setShowPassword] = useState(false);
  
  return (
    <Input
      secureTextEntry={!showPassword}
      rightElement={
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={{ padding: tokens.spacing[1] }}
        >
          <Text style={{ color: tokens.colors.text.secondary, fontSize: 16 }}>
            {showPassword ? '🙈' : '👁️'}
          </Text>
        </TouchableOpacity>
      }
      {...props}
    />
  );
};

// Validadores comuns
export const validators = {
  required: (value: string) => value.trim() ? null : 'Campo obrigatório',
  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : 'Email inválido';
  },
  minLength: (min: number) => (value: string) => 
    value.length >= min ? null : `Mínimo ${min} caracteres`,
  maxLength: (max: number) => (value: string) => 
    value.length <= max ? null : `Máximo ${max} caracteres`,
  numeric: (value: string) => 
    /^\d+$/.test(value) ? null : 'Apenas números',
  combine: (...validators: Array<(value: string) => string | null>) => (value: string) => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) return error;
    }
    return null;
  },
};

export default Input;