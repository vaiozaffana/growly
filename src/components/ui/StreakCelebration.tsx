import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Animatable from 'react-native-animatable';
import LottieView from 'lottie-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../contexts';
import { SHADOWS } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

// Custom animations
const pulseGrow = {
  0: { scale: 0, opacity: 0 },
  0.3: { scale: 1.2, opacity: 1 },
  0.5: { scale: 0.9, opacity: 1 },
  0.7: { scale: 1.1, opacity: 1 },
  1: { scale: 1, opacity: 1 },
};

const slideUpFade = {
  0: { translateY: 30, opacity: 0 },
  1: { translateY: 0, opacity: 1 },
};

const shimmer = {
  0: { opacity: 0.5 },
  0.5: { opacity: 1 },
  1: { opacity: 0.5 },
};

interface StreakCelebrationProps {
  visible: boolean;
  streak: number;
  onAnimationEnd: () => void;
}

export const StreakCelebration: React.FC<StreakCelebrationProps> = ({
  visible,
  streak,
  onAnimationEnd,
}) => {
  const { colors, isDarkMode } = useTheme();
  const lottieRef = useRef<LottieView>(null);

  useEffect(() => {
    if (visible) {
      lottieRef.current?.play();
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      const timer = setTimeout(() => {
        onAnimationEnd();
      }, 3500);
      
      return () => clearTimeout(timer);
    }
  }, [visible, onAnimationEnd]);

  if (!visible) return null;

  const getStreakEmoji = (streak: number): string => {
    if (streak >= 30) return '👑';
    if (streak >= 21) return '🏆';
    if (streak >= 14) return '⭐';
    if (streak >= 7) return '🌟';
    if (streak >= 3) return '✨';
    return '🔥';
  };

  const getStreakMessage = (streak: number): string => {
    if (streak >= 30) return 'Legenda! Kamu luar biasa!';
    if (streak >= 21) return 'Wow! 3 Minggu berturut-turut!';
    if (streak >= 14) return 'Hebat! 2 Minggu konsisten!';
    if (streak >= 7) return 'Seminggu penuh! Mantap!';
    if (streak >= 3) return 'Terus pertahankan!';
    if (streak === 2) return 'Awal yang bagus!';
    return 'Perjalanan dimulai!';
  };

  const getStreakColor = (streak: number): string => {
    if (streak >= 30) return '#FFD700'; // Gold
    if (streak >= 21) return '#FF6B6B'; // Coral
    if (streak >= 14) return '#A78BFA'; // Lavender
    if (streak >= 7) return '#38D99A'; // Mint
    return colors.primary;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onAnimationEnd}>
        <View style={styles.overlay}>
          <BlurView
            intensity={isDarkMode ? 40 : 30}
            tint={isDarkMode ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
          
          <Animatable.View
            animation={pulseGrow}
            duration={800}
            style={styles.container}
          >
            <View style={styles.lottieContainer}>
              <LottieView
                ref={lottieRef}
                source={require('../../assets/animation/Fire.json')}
                style={styles.lottie}
                autoPlay={false}
                loop={true}
                speed={1}
              />
            </View>

            <Animatable.View
              animation={slideUpFade}
            delay={400}
            duration={600}
            style={styles.streakContainer}
          >
            <Animatable.Text
              animation={shimmer}
              iterationCount="infinite"
              duration={2000}
              style={[
                styles.streakNumber,
                { color: getStreakColor(streak) }
              ]}
            >
              {streak}
            </Animatable.Text>
            <Text style={[styles.streakLabel, { color: colors.text }]}>
              Streak {getStreakEmoji(streak)}
            </Text>
          </Animatable.View>

          <Animatable.View
            animation={slideUpFade}
            delay={700}
            duration={600}
            style={[
              styles.messageCard,
              {
                backgroundColor: isDarkMode ? colors.surface : '#FFFFFF',
                ...SHADOWS.lg,
              }
            ]}
          >
            <Text style={[styles.messageTitle, { color: colors.primary }]}>
              🎉 Keren!
            </Text>
            <Text style={[styles.messageText, { color: colors.text }]}>
              {getStreakMessage(streak)}
            </Text>
            <View style={[styles.progressBar, { backgroundColor: colors.neutral200 }]}>
              <Animatable.View
                animation="slideInLeft"
                duration={1500}
                delay={1000}
                style={[
                  styles.progressFill,
                  { 
                    backgroundColor: getStreakColor(streak),
                    width: `${Math.min((streak / 30) * 100, 100)}%`,
                  }
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: colors.neutral500 }]}>
              {streak >= 30 
                ? 'Level maksimum tercapai!' 
                : `${30 - streak} hari lagi menuju level Legenda`}
            </Text>
          </Animatable.View>

            {[...Array(6)].map((_, index) => (
              <Animatable.View
                key={index}
                animation="fadeOutUp"
                duration={2000}
                delay={300 + index * 150}
                style={[
                  styles.particle,
                  {
                    left: width / 2 - 6 + (index % 2 === 0 ? 1 : -1) * (20 + index * 10),
                    backgroundColor: index % 3 === 0 
                      ? '#FF6B6B' 
                      : index % 3 === 1 
                        ? '#38D99A' 
                        : '#A78BFA',
                  }
                ]}
              />
            ))}
          </Animatable.View>
          
          <Animatable.Text
            animation="fadeIn"
            delay={2500}
            style={[styles.dismissHint, { color: 'rgba(255,255,255,0.7)' }]}
          >
            Ketuk untuk melanjutkan
          </Animatable.Text>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottieContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottie: {
    width: 250,
    height: 250,
  },
  streakContainer: {
    alignItems: 'center',
    marginTop: -30,
  },
  streakNumber: {
    fontSize: 80,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  streakLabel: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: -5,
  },
  messageCard: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 24,
    borderRadius: 24,
    alignItems: 'center',
    width: width * 0.85,
    maxWidth: 350,
  },
  messageTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  messageText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 16,
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  particle: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dismissHint: {
    position: 'absolute',
    bottom: 80,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default StreakCelebration;
