import 'styled-components/native';

declare module 'styled-components/native' {
  export interface DefaultTheme {
    colors: {
      background: string;
      card: string;
      text: string;
      subtext: string;
      primary: string;
      border: string;
      success: string;
      warning: string;
      danger: string;
      searchBg: string;
      searchBorder: string;
      filterActive: string;
      modalOverlay: string;
    };
    radius: {
      sm: number;
      md: number;
      lg: number;
    };
    spacing: (n: number) => number;
  }
}
