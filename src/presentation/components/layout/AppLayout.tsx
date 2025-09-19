import React, { memo, ReactNode } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Platform,
} from 'react-native';
import { tokens } from '../../../design-system/tokens';
import { useTheme } from '../../hooks/useTheme';

interface AppLayoutProps {
  children: ReactNode;
  statusBarStyle?: 'light-content' | 'dark-content';
  backgroundColor?: string;
  safeArea?: boolean;
  style?: any;
}

export const AppLayout: React.FC<AppLayoutProps> = memo(({
  children,
  statusBarStyle,
  backgroundColor,
  safeArea = true,
  style,
}) => {
  const { theme } = useTheme();

  const finalBackgroundColor = backgroundColor || tokens.colors.background.primary;
  const finalStatusBarStyle = statusBarStyle || (theme === 'dark' ? 'light-content' : 'dark-content');

  const Container = safeArea ? SafeAreaView : View;

  return (
    <Container style={[styles.container, { backgroundColor: finalBackgroundColor }, style]}>
      <StatusBar
        barStyle={finalStatusBarStyle}
        backgroundColor={Platform.OS === 'android' ? finalBackgroundColor : undefined}
        translucent={Platform.OS === 'android'}
      />
      {children}
    </Container>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

AppLayout.displayName = 'AppLayout';

export default AppLayout;