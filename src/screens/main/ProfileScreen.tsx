import React, { useState, useEffect, useCallback } from 'react';

import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/ui';
import { useTheme } from '../../contexts';
import { useAuthStore, useAppStore, useStatsStore, clearAllStores } from '../../store';
import { apiService } from '../../services/api';
import { SHADOWS } from '../../constants/theme';

export const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();
  const { user } = useAuthStore();
  const { setDarkMode } = useAppStore();
  const { stats, updateStats } = useStatsStore();
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const response = await apiService.getStats();
      if (response.success && response.data) {
        updateStats({
          currentStreak: response.data.currentStreak || 0,
          longestStreak: response.data.longestStreak || 0,
          totalReflections: response.data.totalReflections || 0,
          completedToday: response.data.completedToday || 0,
          totalHabits: response.data.totalHabits || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [updateStats]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  }, [fetchStats]);

  const handleLogout = () => {
    Alert.alert('Keluar', 'Apakah kamu yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: () => { 
        apiService.setToken(null); 
        clearAllStores(); 
      } },
    ]);
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Hapus Akun', 
      'Apakah kamu yakin ingin menghapus akun? Semua data termasuk kebiasaan, refleksi, dan streak akan dihapus permanen. Tindakan ini tidak dapat dibatalkan!', 
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Hapus Permanen', 
          style: 'destructive', 
          onPress: async () => {
            setIsDeleting(true);
            try {
              const response = await apiService.deleteAccount();
              if (response.success) {
                Alert.alert('Berhasil', 'Akun kamu telah dihapus.', [
                  { 
                    text: 'OK', 
                    onPress: () => {
                      apiService.setToken(null);
                      clearAllStores();
                    }
                  }
                ]);
              } else {
                Alert.alert('Gagal', response.error || 'Gagal menghapus akun. Silakan coba lagi.');
              }
            } catch (error) {
              Alert.alert('Error', 'Terjadi kesalahan saat menghapus akun.');
            } finally {
              setIsDeleting(false);
            }
          } 
        },
      ]
    );
  };

  const handleDarkModeToggle = (value: boolean) => {
    setDarkMode(value);
  };

  const SettingItem: React.FC<{
    icon: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    showArrow?: boolean;
  }> = ({ icon, iconColor = colors.primary, title, subtitle, onPress, rightElement, showArrow = true }) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: isDarkMode ? 'rgba(255,255,255,0.06)' : colors.neutral200,
      }}
    >
      <View style={{
        width: 44,
        height: 44,
        borderRadius: 16,
        backgroundColor: `${iconColor}20`,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
      }}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>{title}</Text>
        {subtitle && <Text style={{ fontSize: 13, color: colors.textLight, marginTop: 3 }}>{subtitle}</Text>}
      </View>
      {rightElement || (showArrow && onPress && <Ionicons name="chevron-forward" size={20} color={colors.neutral400} />)}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Modern Header with Gradient */}
        <LinearGradient
          colors={isDarkMode 
            ? ['#2D1B4E', '#1E3A5F', colors.background] 
            : [colors.accentPurple + '30', colors.primaryLight + '40', colors.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}
        >
          <Animatable.View animation="fadeIn">
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 32, fontWeight: '800', color: colors.text, letterSpacing: -0.5 }}>👤 Profil</Text>
              <View style={{
                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)',
                borderRadius: 16,
                padding: 12,
                ...SHADOWS.sm,
              }}>
                <Text style={{ fontSize: 24 }}>⚙️</Text>
              </View>
            </View>
          </Animatable.View>
        </LinearGradient>

        {/* Profile Card */}
        <Animatable.View animation="fadeInUp" delay={100} style={{ marginHorizontal: 20, marginTop: -16 }}>
          <Card variant="elevated" style={{ backgroundColor: colors.surface, borderRadius: 28, ...SHADOWS.md }}>
            <View style={{ alignItems: 'center' }}>
              <LinearGradient
                colors={[colors.primary, colors.accentPurple]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ width: 90, height: 90, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}
              >
                <Text style={{ fontSize: 36, fontWeight: '800', color: colors.textInverse }}>{user?.name?.charAt(0).toUpperCase() || 'U'}</Text>
              </LinearGradient>
              <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text, letterSpacing: -0.3 }}>{user?.name || 'User'}</Text>
              <Text style={{ fontSize: 14, color: colors.textLight, marginTop: 4, fontWeight: '500' }}>{user?.email || 'user@email.com'}</Text>
              
              {/* Stats Row */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 28, paddingTop: 24, borderTopWidth: 1, borderTopColor: isDarkMode ? 'rgba(255,255,255,0.08)' : colors.neutral200 }}>
                <View style={{ alignItems: 'center' }}>
                  <View style={{ backgroundColor: colors.primary + '20', borderRadius: 16, padding: 12, marginBottom: 8 }}>
                    <Text style={{ fontSize: 22, fontWeight: '800', color: colors.primary }}>{stats.totalHabits ?? 0}</Text>
                  </View>
                  <Text style={{ fontSize: 13, color: colors.textLight, fontWeight: '500' }}>Kebiasaan</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <View style={{ backgroundColor: colors.accentOrange + '20', borderRadius: 16, padding: 12, marginBottom: 8 }}>
                    <Text style={{ fontSize: 22, fontWeight: '800', color: colors.accentOrange }}>🔥 {stats.longestStreak ?? 0}</Text>
                  </View>
                  <Text style={{ fontSize: 13, color: colors.textLight, fontWeight: '500' }}>Streak Terbaik</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <View style={{ backgroundColor: colors.accentMint + '20', borderRadius: 16, padding: 12, marginBottom: 8 }}>
                    <Text style={{ fontSize: 22, fontWeight: '800', color: colors.secondary }}>{stats.totalReflections ?? 0}</Text>
                  </View>
                  <Text style={{ fontSize: 13, color: colors.textLight, fontWeight: '500' }}>Refleksi</Text>
                </View>
              </View>
            </View>
          </Card>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={200} style={{ marginHorizontal: 20, marginTop: 28 }}>
          <Text style={{ fontSize: 17, fontWeight: '700', color: colors.textLight, marginBottom: 14, marginLeft: 4 }}>⚙️ Pengaturan</Text>
          <Card variant="default" style={{ paddingVertical: 0, backgroundColor: colors.surface, borderRadius: 24 }}>
            <SettingItem
              icon="moon"
              title="Mode Gelap"
              subtitle={isDarkMode ? 'Aktif' : 'Nonaktif'}
              rightElement={<Switch value={isDarkMode} onValueChange={handleDarkModeToggle} trackColor={{ false: colors.neutral300, true: `${colors.primary}50` }} thumbColor={isDarkMode ? colors.primary : colors.neutral400} />}
              showArrow={false}
            />
          </Card>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={300} style={{ marginHorizontal: 20, marginTop: 28 }}>
          <Card variant="default" style={{ paddingVertical: 0, backgroundColor: colors.surface, borderRadius: 24 }}>
            <SettingItem icon="log-out" iconColor={colors.error} title="Keluar" onPress={handleLogout} showArrow={false} />
            <SettingItem icon="trash" iconColor={colors.error} title="Hapus Akun" subtitle="Hapus semua data secara permanen" onPress={handleDeleteAccount} showArrow={false} />
          </Card>
        </Animatable.View>

        <Animatable.View animation="fadeIn" delay={400} style={{ alignItems: 'center', marginTop: 40 }}>
          <View style={{ 
            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : colors.neutral100, 
            paddingHorizontal: 20, 
            paddingVertical: 12, 
            borderRadius: 20 
          }}>
            <Text style={{ fontSize: 13, color: colors.neutral400, fontWeight: '600' }}>🌱 Growly v1.0.0</Text>
          </View>
          <Text style={{ fontSize: 13, color: colors.neutral400, marginTop: 8, fontWeight: '500' }}>Dibuat dengan ❤️ untuk pertumbuhanmu</Text>
        </Animatable.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
