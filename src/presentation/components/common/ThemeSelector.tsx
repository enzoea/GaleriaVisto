/**
 * Componente ThemeSelector
 * 
 * Permite ao usuário selecionar entre diferentes modos de tema:
 * - Claro
 * - Escuro  
 * - Automático (segue o sistema)
 * 
 * Inclui animações suaves e feedback visual
 */

import React, { useState } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import styled, { DefaultTheme } from 'styled-components/native';
import { useThemeContext } from '../../providers/ThemeProvider';
import { ThemeMode } from '../../theme';

interface ThemeSelectorProps {
  /** Se deve exibir como modal ou inline @default false */
  modal?: boolean;
  /** Função chamada quando o tema é alterado */
  onThemeChange?: (theme: ThemeMode) => void;
  /** ID para testes automatizados */
  testID?: string;
}

interface ThemeOption {
  mode: ThemeMode;
  label: string;
  icon: string;
  description: string;
}

const themeOptions: ThemeOption[] = [
  {
    mode: 'light',
    label: 'Claro',
    icon: '☀️',
    description: 'Tema claro sempre ativo'
  },
  {
    mode: 'dark',
    label: 'Escuro',
    icon: '🌙',
    description: 'Tema escuro sempre ativo'
  },
  {
    mode: 'auto',
    label: 'Automático',
    icon: '🔄',
    description: 'Segue as configurações do sistema'
  }
];

const Container = styled(View)<{ theme: DefaultTheme }>`
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.card};
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radius.lg}px;
  padding: ${({ theme }: { theme: DefaultTheme }) => theme.spacing(2)}px;
  ${({ theme }: { theme: DefaultTheme }) => `
    shadow-color: #000;
    shadow-offset: 0px 2px;
    shadow-opacity: 0.1;
    shadow-radius: 4px;
    elevation: 3;
  `}
`;

const Title = styled(Text)<{ theme: DefaultTheme }>`
  font-size: ${({ theme }: { theme: DefaultTheme }) => theme.typography.fontSizes.lg}px;
  font-weight: ${({ theme }: { theme: DefaultTheme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.text};
  margin-bottom: ${({ theme }: { theme: DefaultTheme }) => theme.spacing(2)}px;
  text-align: center;
`;

const OptionsContainer = styled(View)<{ theme: DefaultTheme }>`
  gap: ${({ theme }: { theme: DefaultTheme }) => theme.spacing(1)}px;
`;

interface OptionButtonProps {
  isSelected: boolean;
}

const OptionButton = styled(Pressable)<OptionButtonProps & { theme: DefaultTheme }>`
  flex-direction: row;
  align-items: center;
  padding: ${({ theme }: { theme: DefaultTheme }) => theme.spacing(2)}px;
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radius.md}px;
  border: 2px solid ${({ theme, isSelected }: { theme: DefaultTheme; isSelected: boolean }) => 
    isSelected ? theme.colors.primary : theme.colors.border
  };
  background-color: ${({ theme, isSelected }: { theme: DefaultTheme; isSelected: boolean }) => 
    isSelected ? theme.colors.card : theme.colors.background
  };
  transition: all 0.2s ease;
`;

const OptionIcon = styled(Text)<{ theme: DefaultTheme }>`
  font-size: 24px;
  margin-right: ${({ theme }: { theme: DefaultTheme }) => theme.spacing(2)}px;
`;

const OptionContent = styled(View)<{ theme: DefaultTheme }>`
  flex: 1;
`;

const OptionLabel = styled(Text)<{ isSelected: boolean; theme: DefaultTheme }>`
  font-size: ${({ theme }: { theme: DefaultTheme }) => theme.typography.fontSizes.md}px;
  font-weight: ${({ theme, isSelected }: { theme: DefaultTheme; isSelected: boolean }) => 
    isSelected ? theme.typography.fontWeights.semibold : theme.typography.fontWeights.medium
  };
  color: ${({ theme, isSelected }: { theme: DefaultTheme; isSelected: boolean }) => 
    isSelected ? theme.colors.primary : theme.colors.text
  };
  margin-bottom: 2px;
`;

const OptionDescription = styled(Text)<{ isSelected: boolean; theme: DefaultTheme }>`
  font-size: ${({ theme }: { theme: DefaultTheme }) => theme.typography.fontSizes.sm}px;
  color: ${({ theme, isSelected }: { theme: DefaultTheme; isSelected: boolean }) => 
    isSelected ? theme.colors.subtext : theme.colors.subtext
  };
  line-height: ${({ theme }: { theme: DefaultTheme }) => theme.typography.lineHeights.sm}px;
`;

const CheckIcon = styled(Text)<{ isSelected: boolean; theme: DefaultTheme }>`
  font-size: 20px;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.primary};
  opacity: ${({ isSelected }: { isSelected: boolean }) => isSelected ? 1 : 0};
  transform: scale(${({ isSelected }: { isSelected: boolean }) => isSelected ? 1 : 0.8});
  transition: all 0.2s ease;
`;

const CurrentThemeIndicator = styled(View)<{ theme: DefaultTheme }>`
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.card};
  border: 1px solid ${({ theme }: { theme: DefaultTheme }) => theme.colors.primary};
  border-radius: ${({ theme }: { theme: DefaultTheme }) => theme.radius.sm}px;
  padding: ${({ theme }: { theme: DefaultTheme }) => theme.spacing(1)}px ${({ theme }: { theme: DefaultTheme }) => theme.spacing(2)}px;
  margin-bottom: ${({ theme }: { theme: DefaultTheme }) => theme.spacing(2)}px;
  align-self: center;
`;

const CurrentThemeText = styled(Text)<{ theme: DefaultTheme }>`
  font-size: ${({ theme }: { theme: DefaultTheme }) => theme.typography.fontSizes.sm}px;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.primary};
  font-weight: ${({ theme }: { theme: DefaultTheme }) => theme.typography.fontWeights.medium};
`;

/**
 * Componente ThemeSelector
 * 
 * @example Uso básico
 * ```tsx
 * <ThemeSelector onThemeChange={(theme) => console.log('Tema alterado:', theme)} />
 * ```
 * 
 * @example Como modal
 * ```tsx
 * <ThemeSelector modal onThemeChange={handleThemeChange} />
 * ```
 */
export const ThemeSelector: React.FC<ThemeSelectorProps> = React.memo(({
  modal = false,
  onThemeChange,
  testID
}) => {
  const { themeMode, setTheme, getThemeModeLabel, isDark } = useThemeContext();
  const [isChanging, setIsChanging] = useState(false);

  const handleThemeSelect = async (selectedMode: ThemeMode) => {
    if (selectedMode === themeMode || isChanging) return;

    try {
      setIsChanging(true);
      await setTheme(selectedMode);
      onThemeChange?.(selectedMode);
    } catch (error) {
      console.error('Erro ao alterar tema:', error);
    } finally {
      setIsChanging(false);
    }
  };

  const renderOption = (option: ThemeOption) => {
    const isSelected = option.mode === themeMode;
    
    return (
      <OptionButton
        key={option.mode}
        isSelected={isSelected}
        onPress={() => handleThemeSelect(option.mode)}
        disabled={isChanging}
        testID={`${testID}-option-${option.mode}`}
        accessibilityLabel={`Selecionar tema ${option.label}`}
        accessibilityHint={option.description}
        accessibilityRole="button"
        accessibilityState={{
          selected: isSelected,
          disabled: isChanging
        }}
        android_ripple={{
          color: isSelected ? 'rgba(0, 122, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'
        }}
      >
        <OptionIcon>{option.icon}</OptionIcon>
        <OptionContent>
          <OptionLabel isSelected={isSelected}>
            {option.label}
          </OptionLabel>
          <OptionDescription isSelected={isSelected}>
            {option.description}
          </OptionDescription>
        </OptionContent>
        <CheckIcon isSelected={isSelected}>
          ✓
        </CheckIcon>
      </OptionButton>
    );
  };

  return (
    <Container testID={testID}>
      <Title>Aparência</Title>
      
      <CurrentThemeIndicator>
        <CurrentThemeText>
          Tema atual: {getThemeModeLabel()} {isDark ? '🌙' : '☀️'}
        </CurrentThemeText>
      </CurrentThemeIndicator>

      <OptionsContainer>
        {themeOptions.map(renderOption)}
      </OptionsContainer>
    </Container>
  );
});

ThemeSelector.displayName = 'ThemeSelector';