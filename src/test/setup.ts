import '@testing-library/jest-native/extend-expect';

// Definir variáveis globais
global.__DEV__ = true;

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

// Mock para @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: ({ name, size, color, ...props }: any) => {
    const React = require('react');
    return React.createElement('Text', {
      testID: `ionicon-${name}`,
      style: { fontSize: size, color },
      ...props,
    }, name);
  },
}));

// Mock para react-native components
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native-web');
  const React = require('react');
  
  return {
    ...RN,
    TouchableOpacity: ({ children, testID, onPress, onLongPress, style, ...props }: any) => {
      return React.createElement('div', {
        testID,
        onClick: onPress,
        onContextMenu: onLongPress,
        style,
        ...props,
      }, children);
    },
    Text: ({ children, testID, style, ...props }: any) => {
      return React.createElement('div', {
        testID,
        style,
        ...props,
      }, children);
    },
    View: ({ children, testID, style, ...props }: any) => {
      return React.createElement('div', {
        testID,
        style,
        ...props,
      }, children);
    },
    Image: ({ testID, style, ...props }: any) => {
      return React.createElement('img', {
        testID,
        style,
        ...props,
      });
    },
    Animated: {
      View: ({ children, testID, style, ...props }: any) => {
        return React.createElement('div', {
          testID,
          style,
          ...props,
        }, children);
      },
      Value: jest.fn(() => ({
        setValue: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
      })),
      timing: jest.fn(() => ({
        start: jest.fn(),
      })),
      spring: jest.fn(() => ({
        start: jest.fn(),
      })),
      sequence: jest.fn(() => ({
        start: jest.fn(),
      })),
    },
    Alert: {
      alert: jest.fn(),
    },
    StyleSheet: {
      create: jest.fn((styles) => styles),
      flatten: jest.fn((styles) => styles),
    },
    Dimensions: {
      get: jest.fn(() => ({ width: 375, height: 667 })),
    },
  };
});

// Mock do @react-native-community/netinfo
jest.mock('@react-native-community/netinfo', () => ({
  default: {
    fetch: jest.fn(() => Promise.resolve({
      type: 'wifi',
      isConnected: true,
      isInternetReachable: true,
    })),
    addEventListener: jest.fn(() => jest.fn()),
  },
}));

// Mock do expo-file-system
jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///mock/documents/',
  cacheDirectory: 'file:///mock/cache/',
  writeAsStringAsync: jest.fn(() => Promise.resolve()),
  readAsStringAsync: jest.fn(() => Promise.resolve('{"data": "mock"}')),
  deleteAsync: jest.fn(() => Promise.resolve()),
  makeDirectoryAsync: jest.fn(() => Promise.resolve()),
  getInfoAsync: jest.fn(() => Promise.resolve({ exists: true, isDirectory: false })),
  copyAsync: jest.fn(() => Promise.resolve()),
  moveAsync: jest.fn(() => Promise.resolve()),
}));