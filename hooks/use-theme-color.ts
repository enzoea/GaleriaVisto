/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';

// Importar diretamente o hook de tema personalizado
let useThemeContextHook: any = null;
try {
  const ThemeProviderModule = require('../src/presentation/providers/ThemeProvider');
  useThemeContextHook = ThemeProviderModule.useThemeContext;
} catch (error) {
  // Módulo não disponível, usar fallback
}

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  let theme: 'light' | 'dark' = 'light';
  
  // Tentar usar o contexto de tema personalizado
  if (useThemeContextHook) {
    try {
      const themeData = useThemeContextHook();
      if (themeData && typeof themeData.isDark === 'boolean') {
        theme = themeData.isDark ? 'dark' : 'light';
      }
    } catch (error) {
      // Se falhar, usar o sistema nativo
      const { useColorScheme } = require('@/hooks/use-color-scheme');
      theme = useColorScheme() ?? 'light';
    }
  } else {
    // Usar useColorScheme como fallback
    const { useColorScheme } = require('@/hooks/use-color-scheme');
    theme = useColorScheme() ?? 'light';
  }
  
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
