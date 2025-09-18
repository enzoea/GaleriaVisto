export const lightTheme = {
  colors: {
    background: '#FFFFFF',
    card: '#F8F9FA',
    text: '#1A1A1A',
    subtext: '#666666',
    primary: '#007AFF',
    border: '#E9ECEF',
    success: '#28A745',
    warning: '#FFC107',
    danger: '#DC3545',
    searchBg: '#FFFFFF',
    searchBorder: '#DDD',
    filterActive: '#F0F8FF',
    modalOverlay: 'rgba(0, 0, 0, 0.5)',
  },
  radius: { sm: 8, md: 12, lg: 16 },
  spacing: (n: number) => n * 8,
};

export const darkTheme = {
  colors: {
    background: '#0B0B0C',
    card: '#151518',
    text: '#ECECEC',
    subtext: '#A7A7AD',
    primary: '#6E56CF',
    border: '#2A2A2E',
    success: '#34C759',
    warning: '#FF9F0A',
    danger: '#FF453A',
    searchBg: '#1C1C1E',
    searchBorder: '#38383A',
    filterActive: '#1E1E2E',
    modalOverlay: 'rgba(0, 0, 0, 0.7)',
  },
  radius: { sm: 8, md: 12, lg: 16 },
  spacing: (n: number) => n * 8,
};

export type AppTheme = typeof lightTheme;

export type ThemeMode = 'light' | 'dark' | 'auto';
