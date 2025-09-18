import '@testing-library/jest-native/extend-expect';

// Mock básico para AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock básico para react-native-reanimated
jest.mock('react-native-reanimated', () => ({
  default: {
    Value: jest.fn(),
    event: jest.fn(),
    add: jest.fn(),
    eq: jest.fn(),
    set: jest.fn(),
    cond: jest.fn(),
    interpolate: jest.fn(),
    View: jest.fn(),
    Extrapolate: { CLAMP: jest.fn() },
    Transition: {
      Together: 'Together',
      Out: 'Out',
      In: 'In',
    },
  },
}));

// Mock para styled-components
jest.mock('styled-components/native', () => ({
  default: jest.fn(() => jest.fn()),
  ThemeProvider: ({ children }: any) => children,
}));