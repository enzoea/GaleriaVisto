import { useState, useEffect } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme, AppTheme, ThemeMode } from '../theme';

const THEME_STORAGE_KEY = '@galeria_visto_theme_mode';

export const useTheme = () => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('auto');
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(() => {
    // Inicializar com o tema baseado no sistema
    const systemColorScheme = Appearance.getColorScheme();
    return systemColorScheme === 'dark' ? darkTheme : lightTheme;
  });

  // Carregar preferência de tema salva
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
          setThemeMode(savedTheme as ThemeMode);
        }
      } catch (error) {
        console.error('Erro ao carregar preferência de tema:', error);
      }
    };

    loadThemePreference();
  }, []);

  // Determinar tema atual baseado na preferência e sistema
  useEffect(() => {
    const determineTheme = () => {
      if (themeMode === 'light') {
        setCurrentTheme(lightTheme);
      } else if (themeMode === 'dark') {
        setCurrentTheme(darkTheme);
      } else {
        // Modo automático - seguir sistema
        const systemColorScheme = Appearance.getColorScheme();
        setCurrentTheme(systemColorScheme === 'dark' ? darkTheme : lightTheme);
      }
    };

    determineTheme();
  }, [themeMode]);

  // Listener para mudanças no tema do sistema (apenas no modo auto)
  useEffect(() => {
    if (themeMode === 'auto') {
      const subscription = Appearance.addChangeListener(({ colorScheme }) => {
        setCurrentTheme(colorScheme === 'dark' ? darkTheme : lightTheme);
      });

      return () => subscription?.remove();
    }
  }, [themeMode]);

  // Salvar preferência de tema
  const saveThemePreference = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Erro ao salvar preferência de tema:', error);
    }
  };

  // Alternar tema
  const toggleTheme = async () => {
    let newMode: ThemeMode;
    
    if (themeMode === 'light') {
      newMode = 'dark';
    } else if (themeMode === 'dark') {
      newMode = 'auto';
    } else {
      newMode = 'light';
    }

    setThemeMode(newMode);
    await saveThemePreference(newMode);
  };

  // Definir tema específico
  const setTheme = async (mode: ThemeMode) => {
    try {
      setThemeMode(mode);
      await saveThemePreference(mode);
    } catch (error) {
      console.error('Erro ao definir tema:', error);
    }
  };

  // Verificar se é tema escuro
  const isDark = currentTheme === darkTheme;

  // Obter nome do modo atual para exibição
  const getThemeModeLabel = () => {
    switch (themeMode) {
      case 'light':
        return 'Claro';
      case 'dark':
        return 'Escuro';
      case 'auto':
        return 'Automático';
      default:
        return 'Automático';
    }
  };

  // Obter ícone do tema atual
  const getThemeIcon = () => {
    if (themeMode === 'auto') {
      return isDark ? '🌙' : '☀️';
    }
    return themeMode === 'dark' ? '🌙' : '☀️';
  };

  return {
    theme: currentTheme,
    themeMode,
    isDark,
    toggleTheme,
    setTheme,
    getThemeModeLabel,
    getThemeIcon,
  };
};