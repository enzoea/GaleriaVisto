import React, { memo, ReactNode } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { tokens } from '../../../design-system/tokens';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  backgroundColor?: string;
  titleColor?: string;
  showShadow?: boolean;
  style?: any;
}

export const Header: React.FC<HeaderProps> = memo(({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  backgroundColor = tokens.colors.surface.primary,
  titleColor = tokens.colors.text.primary,
  showShadow = true,
  style,
}) => {
  return (
    <View
      style={[
        styles.container,
        { backgroundColor },
        showShadow && styles.shadow,
        style,
      ]}
    >
      <View style={styles.content}>
        {/* Lado esquerdo */}
        <View style={styles.leftContainer}>
          {leftIcon && (
            <TouchableOpacity
              onPress={onLeftPress}
              style={styles.iconButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {leftIcon}
            </TouchableOpacity>
          )}
        </View>

        {/* Centro */}
        <View style={styles.centerContainer}>
          {title && (
            <Text
              style={[styles.title, { color: titleColor }]}
              numberOfLines={1}
            >
              {title}
            </Text>
          )}
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* Lado direito */}
        <View style={styles.rightContainer}>
          {rightIcon && (
            <TouchableOpacity
              onPress={onRightPress}
              style={styles.iconButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {rightIcon}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    minHeight: 56,
  },
  leftContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerContainer: {
    flex: 2,
    alignItems: 'center',
  },
  rightContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  iconButton: {
    padding: tokens.spacing.xs,
    borderRadius: tokens.borderRadius.small,
  },
  title: {
    fontSize: tokens.typography.sizes.large,
    fontWeight: tokens.typography.weights.semibold,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: tokens.typography.sizes.small,
    color: tokens.colors.text.secondary,
    textAlign: 'center',
    marginTop: 2,
  },
  shadow: {
    ...tokens.shadows.small,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
});

Header.displayName = 'Header';

export default Header;