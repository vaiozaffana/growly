import React from 'react';
import { View, Text, ScrollView, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../../components/ui';
import { useTheme } from '../../contexts';
import { RootStackParamList } from '../../types';
import { SHADOWS } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

type LandingScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Landing'>;
};

const features = [
  {
    icon: 'leaf' as const,
    title: 'Kebiasaan Sehat',
    description: 'Bangun kebiasaan positif untuk kesehatan fisik dan mental',
    color: '#38D99A',
    emoji: '🌱',
  },
  {
    icon: 'heart' as const,
    title: 'Etika & Karakter',
    description: 'Kembangkan kejujuran, empati, dan disiplin diri',
    color: '#FF6B6B',
    emoji: '💝',
  },
  {
    icon: 'chatbubble-ellipses' as const,
    title: 'Refleksi AI',
    description: 'AI membantu refleksi mendalam tentang perjalananmu',
    color: '#A78BFA',
    emoji: '✨',
  },
  {
    icon: 'trending-up' as const,
    title: 'Lacak Progress',
    description: 'Lihat perkembangan dan pertahankan streak-mu',
    color: '#FFD93D',
    emoji: '🔥',
  },
];

export const LandingScreen: React.FC<LandingScreenProps> = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();

  return (
    <LinearGradient
      colors={isDarkMode 
        ? [colors.background, '#2D1B4E', '#1E3A5F', colors.background] 
        : [colors.background, colors.primaryLight + '30', colors.accentMint + '25', colors.background]}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <View style={{ alignItems: 'center', paddingTop: 48, paddingHorizontal: 24 }}>
            {/* Logo */}
            <Animatable.View
              animation="bounceIn"
              duration={1000}
              style={{
                width: 110,
                height: 110,
                borderRadius: 36,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 28,
                ...SHADOWS.lg,
              }}
            >
              <LinearGradient
                colors={[colors.primary, colors.accentPurple]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 110,
                  height: 110,
                  borderRadius: 36,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 52 }}>🌱</Text>
              </LinearGradient>
            </Animatable.View>

            {/* Title */}
            <Animatable.Text
              animation="fadeInDown"
              delay={300}
              style={{
                fontSize: 48,
                fontWeight: '800',
                color: colors.text,
                marginBottom: 10,
                letterSpacing: -1,
              }}
            >
              Growly
            </Animatable.Text>

            {/* Tagline */}
            <Animatable.Text
              animation="fadeInDown"
              delay={500}
              style={{
                fontSize: 19,
                color: colors.textLight,
                textAlign: 'center',
                lineHeight: 28,
                maxWidth: 320,
                fontWeight: '500',
              }}
            >
              Tumbuhkan kebiasaan baik dengan{'\n'}refleksi bermakna ✨
            </Animatable.Text>
          </View>

          {/* Features Section */}
          <View style={{ paddingHorizontal: 24, marginTop: 52 }}>
            <Animatable.Text
              animation="fadeIn"
              delay={700}
              style={{
                fontSize: 22,
                fontWeight: '700',
                color: colors.text,
                marginBottom: 24,
                textAlign: 'center',
              }}
            >
              Mengapa Growly? 🤔
            </Animatable.Text>

            {features.map((feature, index) => (
              <Animatable.View
                key={feature.title}
                animation="fadeInUp"
                delay={800 + index * 150}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : colors.surface,
                  borderRadius: 24,
                  padding: 18,
                  marginBottom: 14,
                  borderWidth: isDarkMode ? 1 : 0,
                  borderColor: 'rgba(255,255,255,0.08)',
                  ...SHADOWS.sm,
                }}
              >
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 20,
                    backgroundColor: `${feature.color}20`,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 16,
                  }}
                >
                  <Text style={{ fontSize: 28 }}>{feature.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 17,
                      fontWeight: '700',
                      color: colors.text,
                      marginBottom: 4,
                    }}
                  >
                    {feature.title}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.textLight,
                      lineHeight: 20,
                      fontWeight: '400',
                    }}
                  >
                    {feature.description}
                  </Text>
                </View>
              </Animatable.View>
            ))}
          </View>

          {/* CTA Section */}
          <View style={{ paddingHorizontal: 24, marginTop: 44 }}>
            <Animatable.View animation="fadeInUp" delay={1400}>
              <Button
                title="Mulai Sekarang"
                onPress={() => navigation.navigate('Register')}
                gradient
                size="lg"
                emoji="🚀"
                style={{ marginBottom: 16, borderRadius: 24 }}
              />
            </Animatable.View>

            <Animatable.View animation="fadeInUp" delay={1500}>
              <Button
                title="Sudah Punya Akun? Masuk"
                onPress={() => navigation.navigate('Login')}
                variant="ghost"
                size="md"
              />
            </Animatable.View>
          </View>

          {/* Footer */}
          <Animatable.View
            animation="fadeIn"
            delay={1600}
            style={{
              alignItems: 'center',
              marginTop: 44,
              paddingHorizontal: 24,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                color: colors.neutral400,
                textAlign: 'center',
                lineHeight: 20,
                fontWeight: '500',
              }}
            >
              Dengan melanjutkan, kamu menyetujui{'\n'}
              Ketentuan Layanan dan Kebijakan Privasi kami
            </Text>
          </Animatable.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default LandingScreen;
