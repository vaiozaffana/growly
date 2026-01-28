import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '../../contexts';

interface StreakCounterProps {
  count: number;
  label?: string;
  style?: ViewStyle;
  size?: 'sm' | 'md' | 'lg';
  showFireAnimation?: boolean;
}

export const StreakCounter: React.FC<StreakCounterProps> = ({
  count,
  label = 'Hari Berturut-turut',
  style,
  size = 'md',
  showFireAnimation = true,
}) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const prevCountRef = useRef(count);

  const sizeConfig = {
    sm: { iconSize: 24, fontSize: 24, padding: 12 },
    md: { iconSize: 32, fontSize: 36, padding: 20 },
    lg: { iconSize: 48, fontSize: 48, padding: 28 },
  };

  const config = sizeConfig[size];

  useEffect(() => {
    if (count > prevCountRef.current) {
      // Animate when streak increases
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
    prevCountRef.current = count;
  }, [count]);

  const getStreakColor = () => {
    if (count >= 30) return '#FF4500'; // Red-orange for 30+ days
    if (count >= 14) return '#FF6B35'; // Orange for 14+ days
    if (count >= 7) return colors.accentOrange; // Yellow-orange for 7+ days
    if (count >= 3) return '#FFD700'; // Gold for 3+ days
    return colors.neutral400; // Gray for less than 3 days
  };

  const getStreakMessage = () => {
    if (count >= 30) return '🏆 Luar biasa!';
    if (count >= 14) return '🔥 Konsisten!';
    if (count >= 7) return '💪 Hebat!';
    if (count >= 3) return '✨ Bagus!';
    if (count >= 1) return '🌱 Mulai!';
    return '🎯 Ayo mulai!';
  };

  return (
    <Animatable.View
      animation="fadeIn"
      style={[
        {
          alignItems: 'center',
          padding: config.padding,
          backgroundColor: colors.surface,
          borderRadius: 24,
          borderWidth: 2,
          borderColor: getStreakColor(),
        },
        style,
      ]}
    >
      {/* Fire Icon */}
      {showFireAnimation && count > 0 && (
        <Animatable.View
          animation="pulse"
          iterationCount="infinite"
          duration={1500}
          style={{ marginBottom: 8 }}
        >
          <Ionicons name="flame" size={config.iconSize} color={getStreakColor()} />
        </Animatable.View>
      )}

      {/* Count */}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Text
          style={{
            fontSize: config.fontSize,
            fontWeight: '700',
            color: getStreakColor(),
          }}
        >
          {count}
        </Text>
      </Animated.View>

      {/* Label */}
      <Text
        style={{
          fontSize: size === 'sm' ? 12 : 14,
          color: colors.textLight,
          marginTop: 4,
        }}
      >
        {label}
      </Text>

      {/* Streak Message */}
      <Text
        style={{
          fontSize: size === 'sm' ? 12 : 14,
          fontWeight: '600',
          color: getStreakColor(),
          marginTop: 8,
        }}
      >
        {getStreakMessage()}
      </Text>
    </Animatable.View>
  );
};

export default StreakCounter;
