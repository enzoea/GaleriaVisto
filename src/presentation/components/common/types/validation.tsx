/**
 * Sistema de validação de props para componentes
 * Fornece validação em tempo de execução e tipos TypeScript robustos
 */

import React from 'react';
import { ViewStyle, TextStyle } from 'react-native';

/**
 * Utilitário para validação de props em tempo de execução
 */
export class PropValidator {
  /**
   * Valida se uma prop é obrigatória
   */
  static required<T>(value: T, propName: string, componentName: string): T {
    if (value === undefined || value === null) {
      throw new Error(
        `Prop '${propName}' é obrigatória no componente '${componentName}' mas não foi fornecida.`
      );
    }
    return value;
  }

  /**
   * Valida se uma prop está dentro de valores permitidos
   */
  static oneOf<T>(
    value: T,
    allowedValues: readonly T[],
    propName: string,
    componentName: string
  ): T {
    if (value !== undefined && !allowedValues.includes(value)) {
      throw new Error(
        `Prop '${propName}' no componente '${componentName}' deve ser um dos valores: ${allowedValues.join(', ')}. Recebido: ${value}`
      );
    }
    return value;
  }

  /**
   * Valida se uma prop é uma função
   */
  static func(
    value: unknown,
    propName: string,
    componentName: string
  ): (...args: any[]) => any {
    if (value !== undefined && typeof value !== 'function') {
      throw new Error(
        `Prop '${propName}' no componente '${componentName}' deve ser uma função. Recebido: ${typeof value}`
      );
    }
    return value as (...args: any[]) => any;
  }

  /**
   * Valida se uma prop é uma string
   */
  static string(value: unknown, propName: string, componentName: string): string {
    if (value !== undefined && typeof value !== 'string') {
      throw new Error(
        `Prop '${propName}' no componente '${componentName}' deve ser uma string. Recebido: ${typeof value}`
      );
    }
    return value as string;
  }

  /**
   * Valida se uma prop é um boolean
   */
  static bool(value: unknown, propName: string, componentName: string): boolean {
    if (value !== undefined && typeof value !== 'boolean') {
      throw new Error(
        `Prop '${propName}' no componente '${componentName}' deve ser um boolean. Recebido: ${typeof value}`
      );
    }
    return value as boolean;
  }

  /**
   * Valida se uma prop é um objeto de estilo válido
   */
  static style(
    value: unknown,
    propName: string,
    componentName: string
  ): ViewStyle | TextStyle {
    if (value !== undefined && (typeof value !== 'object' || value === null)) {
      throw new Error(
        `Prop '${propName}' no componente '${componentName}' deve ser um objeto de estilo válido. Recebido: ${typeof value}`
      );
    }
    return value as ViewStyle | TextStyle;
  }

  /**
   * Valida se uma prop é um elemento React válido
   */
  static node(
    value: unknown,
    propName: string,
    componentName: string
  ): React.ReactNode {
    // React.ReactNode pode ser string, number, boolean, null, undefined, ou React element
    const validTypes = ['string', 'number', 'boolean', 'undefined'];
    const isValidPrimitive = validTypes.includes(typeof value) || value === null;
    const isReactElement = value && typeof value === 'object' && 'type' in value;
    
    if (!isValidPrimitive && !isReactElement) {
      throw new Error(
        `Prop '${propName}' no componente '${componentName}' deve ser um React.ReactNode válido.`
      );
    }
    return value as React.ReactNode;
  }
}

/**
 * Tipos base para validação
 */
export interface BaseComponentProps {
  /** ID para testes automatizados */
  testID?: string;
  /** Texto para leitores de tela */
  accessibilityLabel?: string;
  /** Dica de acessibilidade */
  accessibilityHint?: string;
}

/**
 * Props para componentes que suportam variantes
 */
export interface VariantProps<T extends string> {
  /** Variante visual do componente */
  variant?: T;
}

/**
 * Props para componentes que suportam tamanhos
 */
export interface SizeProps<T extends string> {
  /** Tamanho do componente */
  size?: T;
}

/**
 * Props para componentes que suportam estados de carregamento
 */
export interface LoadingProps {
  /** Se o componente está em estado de carregamento */
  loading?: boolean;
}

/**
 * Props para componentes que podem ser desabilitados
 */
export interface DisabledProps {
  /** Se o componente está desabilitado */
  disabled?: boolean;
}

/**
 * Props para componentes que suportam ícones
 */
export interface IconProps {
  /** Ícone a ser exibido */
  icon?: React.ReactNode;
  /** Posição do ícone */
  iconPosition?: 'left' | 'right';
}

/**
 * Props para componentes que suportam largura total
 */
export interface FullWidthProps {
  /** Se o componente deve ocupar toda a largura disponível */
  fullWidth?: boolean;
}

/**
 * Props para componentes que suportam estilos customizados
 */
export interface StyleProps {
  /** Estilos customizados para o container */
  style?: ViewStyle;
  /** Estilos customizados para o texto */
  textStyle?: TextStyle;
}

/**
 * Decorator para validação automática de props
 */
export function withPropValidation<P extends object>(
  Component: React.ComponentType<P>,
  validationRules: Record<keyof P, (value: any, propName: string, componentName: string) => any>
) {
  const WrappedComponent = (props: P) => {
    // Validação em tempo de execução apenas em desenvolvimento
    if (__DEV__) {
      Object.keys(validationRules).forEach((propName) => {
        const validator = validationRules[propName as keyof P];
        const value = props[propName as keyof P];
        validator(value, propName, Component.displayName || Component.name);
      });
    }

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withPropValidation(${Component.displayName || Component.name})`;
  return WrappedComponent;
}