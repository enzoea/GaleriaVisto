import { useColorScheme as useNativeColorScheme } from 'react-native';

// Importação direta do hook de tema
let useThemeContextHook: any = null;

try {
  const ThemeProviderModule = require('../src/presentation/providers/ThemeProvider');
  useThemeContextHook = ThemeProviderModule.useThemeContext;
} catch (error) {
  // Módulo não disponível, usar sistema nativo
}

export function useColorScheme() {
  // Se o hook de tema está disponível, tentar usá-lo
  if (useThemeContextHook) {
    try {
      const themeData = useThemeContextHook();
      
      if (themeData && typeof themeData.isDark === 'boolean') {
        return themeData.isDark ? 'dark' : 'light';
      }
    } catch (error) {
      // Erro ao usar contexto, usar fallback
    }
  }
  
  // Fallback para o sistema nativo
  return useNativeColorScheme();
}