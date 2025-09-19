import React, { useState, forwardRef } from 'react';
import { TextInput, View, Text, TextInputProps, ViewStyle } from 'react-native';
import styled, { DefaultTheme } from 'styled-components/native';
import { useThemeContext } from '../../providers/ThemeProvider';
import { 
  InputProps, 
  withInputDefaults, 
  StyledInputProps,
  PropValidator,
  StyledInputIconContainerProps
} from './types';

interface StyledInputPropsInternal {
  variant: string;
  size: string;
  hasError: boolean;
  isFocused: boolean;
  theme: DefaultTheme;
}

const Container = styled.View`
  width: 100%;
`;

const LabelContainer = styled.View`
  flex-direction: row;
  margin-bottom: 4px;
`;

const Label = styled(Text)<{ theme: DefaultTheme }>`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.text};
`;

const RequiredIndicator = styled(Text)<{ theme: DefaultTheme }>`
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.danger};
  margin-left: 2px;
`;

const InputContainer = styled.View<StyledInputProps & { theme: DefaultTheme }>`
  flex-direction: row;
  align-items: center;
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radius.md}px;
  
  ${({ size, theme }: { size: string; theme: DefaultTheme }) => {
    switch (size) {
      case 'sm':
        return `
          min-height: 36px;
          padding: 0 ${theme.spacing(1.5)}px;
        `;
      case 'lg':
        return `
          min-height: 52px;
          padding: 0 ${theme.spacing(2)}px;
        `;
      default:
        return `
          min-height: 44px;
          padding: 0 ${theme.spacing(2)}px;
        `;
    }
  }}
  
  ${({ variant, theme, hasError, isFocused }: { variant: string; theme: DefaultTheme; hasError: boolean; isFocused: boolean }) => {
    const borderColor = hasError 
      ? theme.colors.danger 
      : isFocused 
        ? theme.colors.primary 
        : theme.colors.border;
    
    switch (variant) {
      case 'filled':
        return `
          background-color: ${theme.colors.card};
          border: 1px solid ${borderColor};
        `;
      case 'outline':
        return `
          background-color: transparent;
          border: 2px solid ${borderColor};
        `;
      default:
        return `
          background-color: ${theme.colors.background};
          border: 1px solid ${borderColor};
        `;
    }
  }}
`;

const StyledTextInput = styled(TextInput)<{ theme: DefaultTheme; size: string }>`
  flex: 1;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.text};
  
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
`;

const IconContainer = styled.View<StyledInputIconContainerProps>`
  margin-right: ${({ position }: StyledInputIconContainerProps) => position === 'left' ? '8px' : '0px'};
  margin-left: ${({ position }: StyledInputIconContainerProps) => position === 'right' ? '8px' : '0px'};
`;

const HelperText = styled(Text)<{ isError: boolean; theme: DefaultTheme }>`
  font-size: 12px;
  margin-top: 4px;
  color: ${({ isError, theme }: { isError: boolean; theme: DefaultTheme }) => isError ? theme.colors.danger : theme.colors.subtext};
`;

/**
 * Componente Input reutilizável com suporte a ícones, validação e múltiplas variantes.
 * 
 * @example
 * ```tsx
 * <Input 
 *   label="Email" 
 *   placeholder="Digite seu email"
 *   variant="outline"
 *   required
 * />
 * ```
 * 
 * @example Com validação
 * ```tsx
 * <Input 
 *   label="Senha" 
 *   placeholder="Digite sua senha"
 *   secureTextEntry
 *   error={errors.password}
 *   leftIcon={<LockIcon />}
 * />
 * ```
 */
export const Input = React.memo(forwardRef<TextInput, InputProps>((rawProps, ref) => {
  // Validação de props em desenvolvimento
  if (__DEV__) {
    PropValidator.required(rawProps.placeholder, 'placeholder', 'Input');
    
    if (rawProps.variant) {
      PropValidator.oneOf(rawProps.variant, ['default', 'filled', 'outline'], 'variant', 'Input');
    }
    
    if (rawProps.size) {
      PropValidator.oneOf(rawProps.size, ['sm', 'md', 'lg'], 'size', 'Input');
    }
    
    if (rawProps.label) {
      PropValidator.string(rawProps.label, 'label', 'Input');
    }
    
    if (rawProps.error) {
      PropValidator.string(rawProps.error, 'error', 'Input');
    }
    
    if (rawProps.hint) {
      PropValidator.string(rawProps.hint, 'hint', 'Input');
    }
  }

  // Aplicar valores padrão
  const propsWithDefaults = withInputDefaults(rawProps);
  
  const {
    label,
    error,
    hint,
    variant,
    size,
    leftIcon,
    rightIcon,
    containerStyle,
    inputStyle,
    required,
    testID,
    accessibilityLabel,
    accessibilityHint,
    onFocus,
    onBlur,
    ...props
  } = propsWithDefaults;
  const { theme } = useThemeContext();
  const [isFocused, setIsFocused] = useState(false);
  
  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.();
  };
  
  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.();
  };
  
  const hasError = !!error;
  const helperText = error || hint;

  return (
    <Container style={containerStyle}>
      {label && (
        <LabelContainer>
          <Label theme={theme}>{label}</Label>
          {required && <RequiredIndicator theme={theme}>*</RequiredIndicator>}
        </LabelContainer>
      )}
      
      <InputContainer
        variant={variant}
        size={size}
        hasError={hasError}
        isFocused={isFocused}
        theme={theme}
      >
        {leftIcon && (
          <IconContainer position="left" size={size}>
            {leftIcon}
          </IconContainer>
        )}
        
        <StyledTextInput
          ref={ref}
          theme={theme}
          size={size}
          placeholderTextColor={theme.colors.textSecondary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          testID={testID}
          accessibilityLabel={accessibilityLabel || label}
          accessibilityHint={accessibilityHint || hint}
          accessibilityRole="text"
          accessibilityState={{
            disabled: props.editable === false
          }}
          style={inputStyle}
          {...props}
        />
        
        {rightIcon && (
          <IconContainer position="right" size={size}>
            {rightIcon}
          </IconContainer>
        )}
      </InputContainer>
      
      {helperText && (
        <HelperText isError={hasError} theme={theme}>
          {helperText}
        </HelperText>
      )}
    </Container>
  );
}));