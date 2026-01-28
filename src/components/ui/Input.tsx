import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '../../contexts';
import { SHADOWS } from '../../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  isPassword?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  isPassword = false,
  ...props
}) => {
  const { colors, isDarkMode } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const borderColor = error
    ? colors.error
    : isFocused
    ? colors.primary
    : isDarkMode ? 'rgba(255,255,255,0.1)' : colors.neutral200;

  return (
    <View style={[{ marginBottom: 20 }, containerStyle]}>
      {label && (
        <Text
          style={{
            fontSize: 15,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 10,
          }}
        >
          {label}
        </Text>
      )}
      <Animatable.View
        animation={isFocused ? 'pulse' : undefined}
        duration={200}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : colors.surface,
          borderWidth: 2.5,
          borderColor,
          borderRadius: 20,
          paddingHorizontal: 18,
          minHeight: 56,
          ...(isFocused ? SHADOWS.sm : {}),
        }}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={22}
            color={isFocused ? colors.primary : colors.neutral400}
            style={{ marginRight: 14 }}
          />
        )}
        <TextInput
          {...props}
          secureTextEntry={isPassword && !showPassword}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          placeholderTextColor={colors.neutral400}
          style={[
            {
              flex: 1,
              fontSize: 16,
              color: colors.text,
              paddingVertical: 14,
              fontWeight: '500',
            },
            props.style,
          ]}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={22}
              color={colors.neutral400}
            />
          </TouchableOpacity>
        )}
        {rightIcon && !isPassword && (
          <TouchableOpacity
            onPress={onRightIconPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name={rightIcon} size={22} color={colors.neutral400} />
          </TouchableOpacity>
        )}
      </Animatable.View>
      {error && (
        <Animatable.Text
          animation="fadeIn"
          style={{
            fontSize: 13,
            color: colors.error,
            marginTop: 6,
            marginLeft: 6,
            fontWeight: '500',
          }}
        >
          ⚠️ {error}
        </Animatable.Text>
      )}
    </View>
  );
};

export default Input;
