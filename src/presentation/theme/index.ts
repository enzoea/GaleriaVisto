export const lightTheme = {
  colors: {
    // Cores de fundo - mantendo branco
    background: '#FFFFFF',
    backgroundSecondary: '#F8F9FA',
    backgroundTertiary: '#F1F3F4',
    card: '#FFFFFF',
    cardElevated: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceSecondary: '#F8F9FA',
    
    // Cores de texto
    text: '#212529',
    textSecondary: '#6C757D',
    textTertiary: '#ADB5BD',
    textDisabled: '#CED4DA',
    textInverse: '#FFFFFF',
    subtext: '#6C757D',
    
    // Cores primárias - amarelo para destaque
    primary: '#F6CD63',
    primaryLight: '#F8D77A',
    primaryDark: '#E6B84A',
    primaryBackground: '#FFFBF0',
    
    // Cores secundárias - tons neutros
    secondary: '#6C757D',
    secondaryLight: '#ADB5BD',
    secondaryDark: '#495057',
    secondaryBackground: '#F8F9FA',
    
    // Cores de estado
    success: '#28A745',
    successLight: '#5CBF73',
    successDark: '#1E7E34',
    successBackground: '#F0FFF4',
    
    warning: '#FFC107',
    warningLight: '#FFD54F',
    warningDark: '#FF8F00',
    warningBackground: '#FFFBF0',
    
    danger: '#D26709',
    dangerLight: '#E6900A',
    dangerDark: '#B8570A',
    dangerBackground: '#FFF5F0',
    
    info: '#17A2B8',
    infoLight: '#4FC3F7',
    infoDark: '#0277BD',
    infoBackground: '#F0FDFF',
    
    // Cores de interface
    border: '#E9ECEF',
    borderLight: '#F1F3F4',
    borderDark: '#DEE2E6',
    divider: '#E9ECEF',
    
    // Cores específicas
    searchBg: '#FFFFFF',
    searchBorder: '#DDD',
    filterActive: '#F0F8FF',
    modalOverlay: 'rgba(0, 0, 0, 0.5)',
    backdrop: 'rgba(0, 0, 0, 0.3)',
    
    // Cores de sombra
    shadow: 'rgba(0, 0, 0, 0.1)',
    shadowLight: 'rgba(0, 0, 0, 0.05)',
    shadowDark: 'rgba(0, 0, 0, 0.2)',
    
    // Cores de foco e hover
    focus: '#007AFF',
    hover: 'rgba(0, 122, 255, 0.1)',
    pressed: 'rgba(0, 122, 255, 0.2)',
    
    // Cores neutras
    neutral50: '#F9FAFB',
    neutral100: '#F3F4F6',
    neutral200: '#E5E7EB',
    neutral300: '#D1D5DB',
    neutral400: '#9CA3AF',
    neutral500: '#6B7280',
    neutral600: '#4B5563',
    neutral700: '#374151',
    neutral800: '#1F2937',
    neutral900: '#111827',
  },
  radius: { 
    xs: 4, 
    sm: 8, 
    md: 12, 
    lg: 16, 
    xl: 20,
    full: 9999 
  },
  spacing: (n: number) => n * 8,
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  typography: {
    fontSizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
    },
    lineHeights: {
      xs: 16,
      sm: 20,
      md: 24,
      lg: 28,
      xl: 32,
      '2xl': 36,
      '3xl': 42,
      '4xl': 48,
    },
    fontWeights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
};

export const darkTheme = {
  colors: {
    // Cores de fundo
    background: '#1A1A1A',
    backgroundSecondary: '#2A2A2A',
    backgroundTertiary: '#3A3A3A',
    card: '#2A2A2A',
    cardElevated: '#3A3A3A',
    surface: '#2A2A2A',
    surfaceSecondary: '#3A3A3A',
    
    // Cores de texto
    text: '#FFFFFF',
    textSecondary: '#D4D4D4',
    textTertiary: '#A0A0A0',
    textDisabled: '#666666',
    textInverse: '#000000',
    subtext: '#D4D4D4',
    
    // Cores primárias - amarelo para destaque
    primary: '#F6CD63',
    primaryLight: '#F8D77A',
    primaryDark: '#E6B84A',
    primaryBackground: '#2A2419',
    
    // Cores secundárias - tons neutros
    secondary: '#6C757D',
    secondaryLight: '#ADB5BD',
    secondaryDark: '#495057',
    secondaryBackground: '#2A2A2A',
    
    // Cores de estado
    success: '#34C759',
    successLight: '#5DD87A',
    successDark: '#28A745',
    successBackground: '#1A2E1A',
    
    warning: '#FF9F0A',
    warningLight: '#FFB84D',
    warningDark: '#E6900A',
    warningBackground: '#2E2419',
    
    danger: '#FF453A',
    dangerLight: '#FF6B5B',
    dangerDark: '#E63946',
    dangerBackground: '#2E1B1B',
    
    info: '#64D2FF',
    infoLight: '#87E0FF',
    infoDark: '#4FC3F7',
    infoBackground: '#1A2A2E',
    
    // Cores de interface
    border: '#2A2A2E',
    borderLight: '#38383A',
    borderDark: '#1C1C1E',
    divider: '#2A2A2E',
    
    // Cores específicas
    searchBg: '#1C1C1E',
    searchBorder: '#38383A',
    filterActive: '#1E1E2E',
    modalOverlay: 'rgba(0, 0, 0, 0.7)',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    
    // Cores de sombra
    shadow: 'rgba(0, 0, 0, 0.3)',
    shadowLight: 'rgba(0, 0, 0, 0.2)',
    shadowDark: 'rgba(0, 0, 0, 0.5)',
    
    // Cores de foco e hover
    focus: '#6E56CF',
    hover: 'rgba(110, 86, 207, 0.2)',
    pressed: 'rgba(110, 86, 207, 0.3)',
    
    // Cores neutras (invertidas para dark mode)
    neutral50: '#111827',
    neutral100: '#1F2937',
    neutral200: '#374151',
    neutral300: '#4B5563',
    neutral400: '#6B7280',
    neutral500: '#9CA3AF',
    neutral600: '#D1D5DB',
    neutral700: '#E5E7EB',
    neutral800: '#F3F4F6',
    neutral900: '#F9FAFB',
  },
  radius: { 
    xs: 4, 
    sm: 8, 
    md: 12, 
    lg: 16, 
    xl: 20,
    full: 9999 
  },
  spacing: (n: number) => n * 8,
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 5,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.5,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  typography: {
    fontSizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
    },
    lineHeights: {
      xs: 16,
      sm: 20,
      md: 24,
      lg: 28,
      xl: 32,
      '2xl': 36,
      '3xl': 42,
      '4xl': 48,
    },
    fontWeights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
};

export type AppTheme = typeof lightTheme;

export type ThemeMode = 'light' | 'dark' | 'auto';
