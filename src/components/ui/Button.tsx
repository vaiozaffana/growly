import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '../../contexts';
import { SHADOWS } from '../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'playful';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  gradient?: boolean;
  emoji?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  gradient = false,
  emoji,
}) => {
  const { colors, isDarkMode } = useTheme();

  const sizeStyles = {
    sm: { paddingVertical: 10, paddingHorizontal: 18 },
    md: { paddingVertical: 16, paddingHorizontal: 28 },
    lg: { paddingVertical: 20, paddingHorizontal: 36 },
  };

  const textSizeStyles = {
    sm: { fontSize: 14 },
    md: { fontSize: 16 },
    lg: { fontSize: 18 },
  };

  const variantStyles = {
    primary: {
      backgroundColor: colors.primary,
      borderWidth: 0,
      ...SHADOWS.sm,
    },
    secondary: {
      backgroundColor: colors.secondary,
      borderWidth: 0,
      ...SHADOWS.sm,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 2.5,
      borderColor: colors.primary,
    },
    ghost: {
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
      borderWidth: 0,
    },
    playful: {
      backgroundColor: colors.accent,
      borderWidth: 3,
      borderColor: isDarkMode ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.08)',
      transform: [{ rotate: '-1deg' }],
      ...SHADOWS.md,
    },
  };

  const textVariantStyles = {
    primary: { color: colors.textInverse },
    secondary: { color: colors.textInverse },
    outline: { color: colors.primary },
    ghost: { color: colors.primary },
    playful: { color: '#1a1a1a' },
  };

  const isDisabled = disabled || isLoading;

  const buttonContent = (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.textInverse}
          size="small"
        />
      ) : (
        <>
          {emoji && <Text style={{ fontSize: textSizeStyles[size].fontSize + 2, marginRight: 8 }}>{emoji}</Text>}
          {icon}
          <Text
            style={[
              {
                fontWeight: '700',
                textAlign: 'center',
                marginLeft: icon ? 8 : 0,
                letterSpacing: 0.3,
              },
              textSizeStyles[size],
              textVariantStyles[variant],
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </View>
  );

  if (gradient && (variant === 'primary' || variant === 'secondary')) {
    return (
      <Animatable.View animation="fadeIn" duration={400}>
        <TouchableOpacity
          onPress={onPress}
          disabled={isDisabled}
          activeOpacity={0.85}
          style={{ opacity: isDisabled ? 0.5 : 1, ...SHADOWS.md }}
        >
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 20,
              },
              sizeStyles[size],
              style,
            ]}
          >
            {buttonContent}
          </LinearGradient>
        </TouchableOpacity>
      </Animatable.View>
    );
  }

  return (
    <Animatable.View animation="fadeIn" duration={400}>
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.85}
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 20,
            opacity: isDisabled ? 0.5 : 1,
          },
          sizeStyles[size],
          variantStyles[variant],
          style,
        ]}
      >
        {buttonContent}
      </TouchableOpacity>
    </Animatable.View>
  );
};

export default Button;
