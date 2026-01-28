import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { SHADOWS, LIGHT_COLORS } from '../../constants/theme';
import { useTheme } from '../../contexts';

interface CheckboxProps {
  checked: boolean;
  onPress: () => void;
  label?: string;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  disabled?: boolean;
  style?: ViewStyle;
  showStreak?: boolean;
  streak?: number;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onPress,
  label,
  description,
  icon,
  iconColor,
  disabled = false,
  style,
  showStreak = false,
  streak = 0,
}) => {
  const { colors } = useTheme();
  const resolvedIconColor = iconColor || colors.primary;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const checkmarkRef = useRef<Animatable.View & View>(null);

  useEffect(() => {
    if (checked) {
      // Bounce animation when checked
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // Checkmark animation
      checkmarkRef.current?.bounceIn?.(500);
    }
  }, [checked]);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: checked ? `${colors.primary}10` : colors.surface,
          borderRadius: 16,
          padding: 16,
          borderWidth: 2,
          borderColor: checked ? colors.primary : colors.neutral200,
          opacity: disabled ? 0.6 : 1,
          ...SHADOWS.sm,
        },
        style,
      ]}
    >
      {/* Icon */}
      {icon && (
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: `${resolvedIconColor}20`,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <Ionicons name={icon} size={24} color={resolvedIconColor} />
        </View>
      )}

      {/* Content */}
      <View style={{ flex: 1 }}>
        {label && (
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.text,
              marginBottom: description ? 4 : 0,
            }}
          >
            {label}
          </Text>
        )}
        {description && (
          <Text
            style={{
              fontSize: 14,
              color: colors.textLight,
            }}
            numberOfLines={2}
          >
            {description}
          </Text>
        )}
      </View>

      {/* Streak Badge */}
      {showStreak && streak > 0 && (
        <Animatable.View
          animation="bounceIn"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.accentOrange,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
            marginRight: 12,
          }}
        >
          <Ionicons name="flame" size={14} color={colors.textInverse} />
          <Text
            style={{
              fontSize: 12,
              fontWeight: '700',
              color: colors.textInverse,
              marginLeft: 2,
            }}
          >
            {streak}
          </Text>
        </Animatable.View>
      )}

      {/* Checkbox */}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            borderWidth: 2,
            borderColor: checked ? colors.primary : colors.neutral300,
            backgroundColor: checked ? colors.primary : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {checked && (
            <Animatable.View ref={checkmarkRef}>
              <Ionicons name="checkmark" size={18} color={colors.textInverse} />
            </Animatable.View>
          )}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default Checkbox;
