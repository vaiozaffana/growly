import React from 'react';
import { View, ViewStyle } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { SHADOWS } from '../../constants/theme';
import { useTheme } from '../../contexts';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'glass' | 'elevated' | 'gradient' | 'playful';
  animated?: boolean;
  animationType?: 'fadeIn' | 'fadeInUp' | 'fadeInDown' | 'zoomIn' | 'bounceIn';
  delay?: number;
  accentColor?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  animated = true,
  animationType = 'fadeInUp',
  delay = 0,
  accentColor,
}) => {
  const { colors, isDarkMode } = useTheme();

  const variantStyles: Record<string, ViewStyle> = {
    default: {
      backgroundColor: colors.surface,
      borderRadius: 24,
      padding: 20,
      borderWidth: 1,
      borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
      ...SHADOWS.sm,
    },
    glass: {
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.85)',
      borderRadius: 24,
      padding: 20,
      borderWidth: 1.5,
      borderColor: isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.5)',
      ...SHADOWS.md,
    },
    elevated: {
      backgroundColor: colors.surface,
      borderRadius: 28,
      padding: 24,
      borderWidth: 1,
      borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
      ...SHADOWS.lg,
    },
    gradient: {
      backgroundColor: colors.surface,
      borderRadius: 28,
      padding: 24,
      borderWidth: 0,
      borderLeftWidth: 4,
      borderLeftColor: accentColor || colors.primary,
      ...SHADOWS.md,
    },
    playful: {
      backgroundColor: colors.surface,
      borderRadius: 32,
      padding: 20,
      borderWidth: 2,
      borderColor: accentColor || colors.primary,
      transform: [{ rotate: '-0.5deg' }],
      ...SHADOWS.sm,
    },
  };

  const content = (
    <View style={[variantStyles[variant], style]}>{children}</View>
  );

  if (animated) {
    return (
      <Animatable.View 
        animation={animationType} 
        duration={600} 
        delay={delay}
        easing="ease-out-back"
      >
        {content}
      </Animatable.View>
    );
  }

  return content;
};

export default Card;
