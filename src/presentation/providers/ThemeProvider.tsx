import React, { createContext, useContext, ReactNode } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../hooks/useTheme';
import { AppTheme } from '../theme';

interface ThemeContextType {
  theme: AppTheme;
  isDark: boolean;
  toggleTheme: () => Promise<void>;
  setTheme: (mode: 'light' | 'dark' | 'auto') => Promise<void>;
  themeMode: 'light' | 'dark' | 'auto';
  getThemeModeLabel: () => string;
  getThemeIcon: () => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const themeHook = useTheme();

  return (
    <ThemeContext.Provider value={themeHook}>
      <StyledThemeProvider theme={themeHook.theme}>
        <StatusBar style={themeHook.isDark ? 'light' : 'dark'} />
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};