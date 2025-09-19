import 'styled-components/native';

declare module 'styled-components/native' {
  export interface DefaultTheme {
    colors: {
      // Cores de fundo
      background: string;
      backgroundSecondary: string;
      backgroundTertiary: string;
      card: string;
      cardElevated: string;
      surface: string;
      surfaceSecondary: string;
      
      // Cores de texto
      text: string;
      textSecondary: string;
      textTertiary: string;
      textDisabled: string;
      textInverse: string;
      subtext: string;
      
      // Cores primárias
      primary: string;
      primaryLight: string;
      primaryDark: string;
      primaryBackground: string;
      
      // Cores secundárias
      secondary: string;
      secondaryLight: string;
      secondaryDark: string;
      secondaryBackground: string;
      
      // Cores de estado
      success: string;
      successLight: string;
      successDark: string;
      successBackground: string;
      warning: string;
      warningLight: string;
      warningDark: string;
      warningBackground: string;
      danger: string;
      dangerLight: string;
      dangerDark: string;
      dangerBackground: string;
      info: string;
      infoLight: string;
      infoDark: string;
      infoBackground: string;
      
      // Cores de interface
      border: string;
      borderLight: string;
      borderDark: string;
      divider: string;
      
      // Cores específicas
      searchBg: string;
      searchBorder: string;
      filterActive: string;
      modalOverlay: string;
      backdrop: string;
      
      // Cores de sombra
      shadow: string;
      shadowLight: string;
      shadowDark: string;
      
      // Cores de foco e hover
      focus: string;
      hover: string;
      pressed: string;
      
      // Cores neutras
      neutral50: string;
      neutral100: string;
      neutral200: string;
      neutral300: string;
      neutral400: string;
      neutral500: string;
      neutral600: string;
      neutral700: string;
      neutral800: string;
      neutral900: string;
    };
    radius: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      full: number;
    };
    spacing: (n: number) => number;
    shadows: {
      sm: object;
      md: object;
      lg: object;
      xl: object;
    };
    typography: {
      fontSizes: {
        xs: number;
        sm: number;
        md: number;
        lg: number;
        xl: number;
        '2xl': number;
        '3xl': number;
        '4xl': number;
      };
      lineHeights: {
        xs: number;
        sm: number;
        md: number;
        lg: number;
        xl: number;
        '2xl': number;
        '3xl': number;
        '4xl': number;
      };
      fontWeights: {
        normal: string;
        medium: string;
        semibold: string;
        bold: string;
      };
    };
  }
}
