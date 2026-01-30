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
import apiService from '../../services/api';

type RegisterScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Register'>;
};

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuthStore();

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!name.trim()) {
      newErrors.name = 'Nama wajib diisi';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Nama minimal 2 karakter';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Format email tidak valid';
    }
    
    if (!password) {
      newErrors.password = 'Kata sandi wajib diisi';
    } else if (password.length < 6) {
      newErrors.password = 'Kata sandi minimal 6 karakter';
    } else if (!/(?=.*[0-9])/.test(password)) {
      newErrors.password = 'Kata sandi harus mengandung angka';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi kata sandi wajib diisi';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Kata sandi tidak cocok';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const response = await apiService.register({ name, email, password });
      
      if (response.success && response.data) {

        apiService.setToken(response.data.token);
        
        login(response.data.user, response.data.token);
        
        Alert.alert('Berhasil', 'Akun berhasil dibuat! Selamat datang di Growly.');
      } else {
        Alert.alert('Error', response.error || 'Gagal mendaftar. Email mungkin sudah digunakan.');
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal mendaftar. Pastikan server backend berjalan.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = (field: keyof typeof errors) => {
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  return (
    <LinearGradient
      colors={isDarkMode ? [colors.background, '#1a2a35', colors.background] : [colors.background, '#E8F4F8', colors.background]}
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
            <Animatable.View animation="fadeIn" style={{ marginTop: 16 }}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: colors.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="arrow-back" size={24} color={colors.text} />
              </TouchableOpacity>
            </Animatable.View>

            <Animatable.View
              animation="fadeInDown"
              style={{ marginTop: 24, marginBottom: 32 }}
            >
              <Text
                style={{
                  fontSize: 32,
                  fontWeight: '700',
                  color: colors.text,
                  marginBottom: 8,
                }}
              >
                Buat Akun 🌱
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: colors.textLight,
                  lineHeight: 24,
                }}
              >
                Mulai perjalananmu menuju{'\n'}kebiasaan yang lebih baik
              </Text>
            </Animatable.View>

            <Animatable.View animation="fadeInUp" delay={200}>
              <Input
                label="Nama Lengkap"
                placeholder="Masukkan nama lengkap"
                icon="person"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  clearError('name');
                }}
                error={errors.name}
                autoCapitalize="words"
                autoComplete="name"
              />

              <Input
                label="Email"
                placeholder="nama@email.com"
                icon="mail"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  clearError('email');
                }}
                error={errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />

              <Input
                label="Kata Sandi"
                placeholder="Minimal 6 karakter dengan angka"
                icon="lock-closed"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  clearError('password');
                }}
                error={errors.password}
                isPassword
                autoComplete="new-password"
              />

              <Input
                label="Konfirmasi Kata Sandi"
                placeholder="Ulangi kata sandi"
                icon="lock-closed"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  clearError('confirmPassword');
                }}
                error={errors.confirmPassword}
                isPassword
                autoComplete="new-password"
              />
              <View style={{ marginBottom: 24, marginTop: -8 }}>
                <Text style={{ fontSize: 12, color: colors.textLight, marginBottom: 4 }}>
                  Kata sandi harus:
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons
                    name={password.length >= 6 ? 'checkmark-circle' : 'ellipse-outline'}
                    size={14}
                    color={password.length >= 6 ? colors.success : colors.neutral400}
                  />
                  <Text style={{ fontSize: 12, color: colors.textLight, marginLeft: 6 }}>
                    Minimal 6 karakter
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                  <Ionicons
                    name={/(?=.*[0-9])/.test(password) ? 'checkmark-circle' : 'ellipse-outline'}
                    size={14}
                    color={/(?=.*[0-9])/.test(password) ? colors.success : colors.neutral400}
                  />
                  <Text style={{ fontSize: 12, color: colors.textLight, marginLeft: 6 }}>
                    Mengandung angka
                  </Text>
                </View>
              </View>

              <Button
                title="Daftar"
                onPress={handleRegister}
                gradient
                size="lg"
                isLoading={isLoading}
              />
            </Animatable.View>

            <Animatable.View
              animation="fadeIn"
              delay={400}
              style={{ marginTop: 24, paddingHorizontal: 16 }}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: colors.textLight,
                  textAlign: 'center',
                  lineHeight: 20,
                }}
              >
                Dengan mendaftar, kamu menyetujui{' '}
                <Text style={{ color: colors.primary }}>Ketentuan Layanan</Text>
                {' '}dan{' '}
                <Text style={{ color: colors.primary }}>Kebijakan Privasi</Text>
                {' '}kami
              </Text>
            </Animatable.View>

            <Animatable.View
              animation="fadeIn"
              delay={500}
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                marginTop: 24,
                marginBottom: 32,
              }}
            >
              <Text style={{ fontSize: 15, color: colors.textLight }}>
                Sudah punya akun?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={{ fontSize: 15, color: colors.primary, fontWeight: '600' }}>
                  Masuk
                </Text>
              </TouchableOpacity>
            </Animatable.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default RegisterScreen;
