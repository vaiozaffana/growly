import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Input } from '../../components/ui';
import { useTheme } from '../../contexts';
import { RootStackParamList } from '../../types';
import { useAuthStore } from '../../store';
import { SHADOWS } from '../../constants/theme';
import apiService from '../../services/api';

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuthStore();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Format email tidak valid';
    }
    
    if (!password) {
      newErrors.password = 'Kata sandi wajib diisi';
    } else if (password.length < 6) {
      newErrors.password = 'Kata sandi minimal 6 karakter';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      // Call the actual API
      const response = await apiService.login({ email, password });
      
      if (response.success && response.data) {
        // Set token for future API calls
        apiService.setToken(response.data.token);
        
        // Login with user data from API
        login(response.data.user, response.data.token);
      } else {
        Alert.alert('Error', response.error || 'Email atau kata sandi salah');
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal masuk. Pastikan server backend berjalan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={isDarkMode 
        ? [colors.background, '#2D1B4E', '#1E3A5F', colors.background] 
        : [colors.background, colors.primaryLight + '30', colors.accentMint + '20', colors.background]}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Back Button */}
            <Animatable.View animation="fadeIn" style={{ marginTop: 16 }}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : colors.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...SHADOWS.sm,
                }}
              >
                <Ionicons name="arrow-back" size={24} color={colors.text} />
              </TouchableOpacity>
            </Animatable.View>

            {/* Header */}
            <Animatable.View
              animation="fadeInDown"
              style={{ marginTop: 40, marginBottom: 48 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 44 }}>👋</Text>
              </View>
              <Text
                style={{
                  fontSize: 36,
                  fontWeight: '800',
                  color: colors.text,
                  marginBottom: 10,
                  letterSpacing: -0.5,
                }}
              >
                Selamat Datang!
              </Text>
              <Text
                style={{
                  fontSize: 17,
                  color: colors.textLight,
                  lineHeight: 26,
                  fontWeight: '500',
                }}
              >
                Masuk untuk melanjutkan perjalanan{'\n'}pengembangan dirimu ✨
              </Text>
            </Animatable.View>

            {/* Form */}
            <Animatable.View animation="fadeInUp" delay={200}>
              <Input
                label="Email"
                placeholder="nama@email.com"
                icon="mail"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                error={errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />

              <Input
                label="Kata Sandi"
                placeholder="Masukkan kata sandi"
                icon="lock-closed"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
                error={errors.password}
                isPassword
                autoComplete="password"
              />

              <TouchableOpacity
                style={{ alignSelf: 'flex-end', marginBottom: 24, marginTop: -8 }}
              >
                <Text style={{ fontSize: 14, color: colors.primary, fontWeight: '500' }}>
                  Lupa kata sandi?
                </Text>
              </TouchableOpacity>

              <Button
                title="Masuk"
                onPress={handleLogin}
                gradient
                size="lg"
                isLoading={isLoading}
              />
            </Animatable.View>


            {/* Sign Up Link */}
            <Animatable.View
              animation="fadeIn"
              delay={600}
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                marginTop: 28,
                marginBottom: 32,
              }}
            >
              <Text style={{ fontSize: 16, color: colors.textLight, fontWeight: '500' }}>
                Belum punya akun?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={{ fontSize: 16, color: colors.primary, fontWeight: '700' }}>
                  Daftar 🚀
                </Text>
              </TouchableOpacity>
            </Animatable.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default LoginScreen;
