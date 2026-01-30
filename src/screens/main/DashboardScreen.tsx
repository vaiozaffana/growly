import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Card, Checkbox } from '../../components/ui';
import { useTheme } from '../../contexts';
import { HABIT_CATEGORIES, HABIT_TEMPLATES, getCategoryById, HabitTemplate } from '../../constants/habits';
import { useAuthStore, useStatsStore, useHabitStore } from '../../store';
import { apiService } from '../../services/api';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const MINIMUM_HABITS = 3;

const MOTIVATIONAL_QUOTES = [
  "Percayalah, setiap satu kebiasaan akan menjadikan karakter yang lebih baik kedepannya.",
  "Langkah kecil hari ini adalah lompatan besar untuk masa depanmu.",
  "Konsistensi adalah kunci. Kamu sudah selangkah lebih dekat dengan versi terbaikmu!",
  "Setiap kebiasaan baik yang kamu bangun adalah investasi untuk dirimu sendiri.",
  "Hebat! Kamu sudah membuktikan bahwa komitmenmu nyata hari ini.",
  "Perubahan dimulai dari keputusan kecil yang diulang setiap hari. Kamu luar biasa!",
  "Hari ini kamu menang melawan versi kemarin. Terus berkembang!",
  "Kebiasaan baikmu hari ini adalah hadiah untuk dirimu di masa depan.",
];

const getRandomQuote = () => {
  return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
};

export const DashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();
  const { user } = useAuthStore();
  const { stats, updateStats, setStats } = useStatsStore();
  const { habits, setHabits, addHabit } = useHabitStore();
  const insets = useSafeAreaInsets();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
  const [reflectionText, setReflectionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedToday, setHasCompletedToday] = useState(false);
  const [motivationalQuote, setMotivationalQuote] = useState('');
  
  const scrollViewRef = useRef<ScrollView>(null);
  const reflectionInputRef = useRef<TextInput>(null);

  const today = format(new Date(), 'EEEE, d MMMM yyyy', { locale: id });
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Selamat Pagi' : hour < 17 ? 'Selamat Siang' : 'Selamat Malam';

  const filteredHabits = selectedCategory
    ? HABIT_TEMPLATES.filter((h) => h.category === selectedCategory)
    : HABIT_TEMPLATES;

  const hasMinimumHabits = selectedHabits.length >= MINIMUM_HABITS;

  const fetchStats = useCallback(async () => {
    try {
      const statsResponse = await apiService.getStats();
      if (statsResponse.success && statsResponse.data) {
        setStats({
          totalHabits: statsResponse.data.totalHabits || 0,
          completedToday: statsResponse.data.completedToday || 0,
          currentStreak: statsResponse.data.currentStreak || 0,
          longestStreak: statsResponse.data.longestStreak || 0,
          totalReflections: statsResponse.data.totalReflections || 0,
          weeklyProgress: statsResponse.data.weeklyProgress || [0, 0, 0, 0, 0, 0, 0],
        });
        
        // Check if user has completed habits today
        if (statsResponse.data.completedToday > 0) {
          setHasCompletedToday(true);
          if (!motivationalQuote) {
            setMotivationalQuote(getRandomQuote());
          }
        }
      }
      
      // Also fetch user habits
      const habitsResponse = await apiService.getHabits();
      if (habitsResponse.success && habitsResponse.data) {
        setHabits(habitsResponse.data);
      }
    } catch (error) {
      console.log('Failed to fetch stats:', error);
    }
  }, [setStats, setHabits, motivationalQuote]);

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchStats();
      setIsLoading(false);
    };
    loadData();
  }, [fetchStats]);

  // Refresh when screen is focused (e.g., returning from ChatScreen)
  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [fetchStats])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  const handleHabitToggle = (habitId: string) => {
    setSelectedHabits((prev) => {
      if (prev.includes(habitId)) {
        return prev.filter((hid) => hid !== habitId);
      } else {
        return [...prev, habitId];
      }
    });
  };

  const getSelectedHabitObjects = (): HabitTemplate[] => {
    return selectedHabits
      .map((hid) => HABIT_TEMPLATES.find((h) => h.id === hid))
      .filter((h): h is HabitTemplate => h !== undefined);
  };

  const handleReflectionSubmit = async () => {
    if (!hasMinimumHabits) {
      Alert.alert('Perhatian', `Pilih minimal ${MINIMUM_HABITS} kebiasaan terlebih dahulu.`);
      return;
    }

    if (!reflectionText.trim()) {
      Alert.alert('Perhatian', 'Tuliskan refleksimu terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);
    Keyboard.dismiss();

    try {
      const selectedHabitObjects = getSelectedHabitObjects();
      
      // Create habits in backend and log completion
      const createdHabitIds: string[] = [];
      for (const habitTemplate of selectedHabitObjects) {
        try {
          // Create habit in backend
          const habitResponse = await apiService.createHabit({
            templateId: habitTemplate.id,
            name: habitTemplate.name,
            description: habitTemplate.description,
            category: habitTemplate.category,
            icon: habitTemplate.icon,
            isActive: true,
          });

          if (habitResponse.success && habitResponse.data) {
            const createdHabit = habitResponse.data;
            createdHabitIds.push(createdHabit.id);
            addHabit(createdHabit);

            // Log habit completion with reflection
            await apiService.logHabit(createdHabit.id, {
              reflection: reflectionText,
              mood: 'good',
              notes: `Kebiasaan dipilih bersama ${selectedHabitObjects.length - 1} lainnya`,
            });
          }
        } catch (error) {
          console.error('Error creating habit:', habitTemplate.name, error);
        }
      }

      const habitDescriptions = selectedHabitObjects
        .map((h) => `- ${h.name}: ${h.description}`)
        .join('\n');

      const contextMessage = `Pengguna telah memilih ${selectedHabits.length} kebiasaan positif untuk dikembangkan:

${habitDescriptions}

Refleksi pengguna: "${reflectionText}"

Berdasarkan pilihan kebiasaan dan refleksi di atas, berikan analisis yang mendalam dan personal. Bantu pengguna memahami koneksi antara kebiasaan yang dipilih, berikan saran praktis untuk menjalankannya, dan tanyakan pertanyaan reflektif untuk membantu pengguna lebih memahami motivasi dan tujuan mereka.`;

      navigation.navigate('Chat', {
        initialMessage: contextMessage,
        habitContext: {
          selectedHabits: selectedHabitObjects,
          createdHabitIds,
          reflection: reflectionText,
        },
      });

      // Mark as completed today and set motivational quote
      setHasCompletedToday(true);
      setMotivationalQuote(getRandomQuote());

      // Refresh stats after logging habits
      fetchStats();

      setSelectedHabits([]);
      setReflectionText('');
    } catch (error) {
      console.error('Error submitting reflection:', error);
      Alert.alert('Error', 'Gagal mengirim refleksi. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (hasMinimumHabits) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 300);
    }
  }, [hasMinimumHabits]);

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 16, color: colors.textLight }}>Memuat data...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={{
              paddingHorizontal: 20,
              paddingTop: 16,
              paddingBottom: 80,
              borderBottomLeftRadius: 32,
              borderBottomRightRadius: 32,
            }}
          >
            <Animatable.View animation="fadeIn">
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{
                    width: 50,
                    height: 50,
                    borderRadius: 16,
                    backgroundColor: 'rgba(255,255,255,0.25)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}>
                    <Text style={{ fontSize: 24 }}>🌱</Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', letterSpacing: 0.5 }}>
                      {today}
                    </Text>
                    <Text style={{
                      fontSize: 20,
                      fontWeight: '700',
                      color: colors.textInverse,
                      marginTop: 2,
                    }}>
                      {greeting}! ✨
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Profile')}
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 16,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1.5,
                    borderColor: 'rgba(255,255,255,0.3)',
                  }}
                >
                  <Ionicons name="person-circle-outline" size={26} color={colors.textInverse} />
                </TouchableOpacity>
              </View>

              {/* Progress Ring */}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderRadius: 20,
                padding: 16,
              }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>
                    Kebiasaan Hari Ini
                  </Text>
                  <Text style={{
                    fontSize: 32,
                    fontWeight: '800',
                    color: colors.textInverse,
                    marginTop: 4,
                  }}>
                    {selectedHabits.length} <Text style={{ fontSize: 18, fontWeight: '500' }}>/ {MINIMUM_HABITS}+</Text>
                  </Text>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 8,
                    backgroundColor: hasMinimumHabits ? 'rgba(56, 217, 154, 0.3)' : 'rgba(255,255,255,0.2)',
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 20,
                    alignSelf: 'flex-start',
                  }}>
                    <Ionicons 
                      name={hasMinimumHabits ? "checkmark-circle" : "time-outline"} 
                      size={14} 
                      color={hasMinimumHabits ? '#38D99A' : 'rgba(255,255,255,0.9)'} 
                    />
                    <Text style={{ 
                      fontSize: 12, 
                      color: hasMinimumHabits ? '#38D99A' : 'rgba(255,255,255,0.9)',
                      marginLeft: 4,
                      fontWeight: '600',
                    }}>
                      {hasMinimumHabits ? 'Siap refleksi!' : 'Pilih kebiasaanmu'}
                    </Text>
                  </View>
                </View>
                
                <View style={{
                  width: 75,
                  height: 75,
                  borderRadius: 20,
                  backgroundColor: hasMinimumHabits ? 'rgba(56, 217, 154, 0.25)' : 'rgba(255,255,255,0.15)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 3,
                  borderColor: hasMinimumHabits ? '#38D99A' : 'rgba(255,255,255,0.3)',
                }}>
                  {hasMinimumHabits ? (
                    <Ionicons name="checkmark-done" size={36} color="#38D99A" />
                  ) : (
                    <Text style={{
                      fontSize: 28,
                      fontWeight: '800',
                      color: colors.textInverse,
                    }}>
                      {selectedHabits.length}
                    </Text>
                  )}
                </View>
              </View>
            </Animatable.View>
          </LinearGradient>

          <Animatable.View
            animation="fadeInUp"
            delay={200}
            style={{
              marginTop: -40,
              marginHorizontal: 16,
            }}
          >
            {/* Stats Cards - Bento Box Style */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {/* Streak Card */}
              <View style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: 24,
                padding: 16,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
                shadowRadius: 24,
                elevation: 8,
              }}>
                <View style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: `${colors.accentOrange}20`,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                }}>
                  <Text style={{ fontSize: 22 }}>🔥</Text>
                </View>
                <Text style={{
                  fontSize: 32,
                  fontWeight: '800',
                  color: colors.text,
                }}>
                  {stats.currentStreak}
                </Text>
                <Text style={{ fontSize: 12, color: colors.textLight, fontWeight: '500' }}>
                  Hari Streak
                </Text>
              </View>
              
              {/* Best Streak Card */}
              <View style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: 24,
                padding: 16,
                shadowColor: colors.secondary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
                shadowRadius: 24,
                elevation: 8,
              }}>
                <View style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: `${colors.secondary}20`,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                }}>
                  <Text style={{ fontSize: 22 }}>🏆</Text>
                </View>
                <Text style={{
                  fontSize: 32,
                  fontWeight: '800',
                  color: colors.text,
                }}>
                  {stats.longestStreak}
                </Text>
                <Text style={{ fontSize: 12, color: colors.textLight, fontWeight: '500' }}>
                  Terbaik
                </Text>
              </View>
              
              {/* Reflections Card */}
              <View style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: 24,
                padding: 16,
                shadowColor: colors.accentPurple || colors.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
                shadowRadius: 24,
                elevation: 8,
              }}>
                <View style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: `${colors.accentPink}20`,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                }}>
                  <Text style={{ fontSize: 22 }}>💭</Text>
                </View>
                <Text style={{
                  fontSize: 32,
                  fontWeight: '800',
                  color: colors.text,
                }}>
                  {stats.totalReflections}
                </Text>
                <Text style={{ fontSize: 12, color: colors.textLight, fontWeight: '500' }}>
                  Refleksi
                </Text>
              </View>
            </View>
          </Animatable.View>
                
          <Animatable.View animation="fadeIn" delay={300} style={{ marginTop: 24 }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
            >
              <TouchableOpacity
                onPress={() => setSelectedCategory(null)}
                style={{
                  paddingHorizontal: 18,
                  paddingVertical: 12,
                  borderRadius: 16,
                  backgroundColor: selectedCategory === null ? colors.primary : colors.surface,
                  shadowColor: selectedCategory === null ? colors.primary : '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: selectedCategory === null ? 0.3 : 0.05,
                  shadowRadius: 8,
                  elevation: selectedCategory === null ? 6 : 2,
                }}
              >
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: selectedCategory === null ? colors.textInverse : colors.text,
                }}>
                  ✨ Semua
                </Text>
              </TouchableOpacity>
              
              {HABIT_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => setSelectedCategory(category.id)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 18,
                    paddingVertical: 12,
                    borderRadius: 16,
                    backgroundColor: selectedCategory === category.id ? category.color : colors.surface,
                    shadowColor: selectedCategory === category.id ? category.color : '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: selectedCategory === category.id ? 0.3 : 0.05,
                    shadowRadius: 8,
                    elevation: selectedCategory === category.id ? 6 : 2,
                  }}
                >
                  <Ionicons
                    name={category.icon}
                    size={16}
                    color={selectedCategory === category.id ? colors.textInverse : category.color}
                  />
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: selectedCategory === category.id ? colors.textInverse : colors.text,
                    marginLeft: 6,
                  }}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animatable.View>

          {hasCompletedToday ? (
            <Animatable.View
              animation="bounceIn"
              duration={1000}
              style={{ 
                paddingHorizontal: 20, 
                marginTop: 24, 
                alignItems: 'center',
              }}
            >
              <View style={{
                backgroundColor: colors.secondary,
                width: 120,
                height: 120,
                borderRadius: 60,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
                shadowColor: colors.secondary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 16,
                elevation: 12,
              }}>
                <Ionicons name="checkmark-done" size={64} color={colors.textInverse} />
              </View>
              
              <Animatable.Text
                animation="fadeInUp"
                delay={300}
                style={{
                  fontSize: 24,
                  fontWeight: '700',
                  color: colors.secondary,
                  textAlign: 'center',
                  marginBottom: 12,
                }}
              >
                Hebat! Kamu Luar Biasa! 🎉
              </Animatable.Text>
              
              <Animatable.Text
                animation="fadeInUp"
                delay={500}
                style={{
                  fontSize: 16,
                  color: colors.textLight,
                  textAlign: 'center',
                  marginBottom: 24,
                  paddingHorizontal: 20,
                }}
              >
                Kamu telah menyelesaikan semua kebiasaan hari ini!
              </Animatable.Text>
              
              <Animatable.View
                animation="fadeInUp"
                delay={700}
                style={{
                  backgroundColor: `${colors.primary}15`,
                  borderRadius: 16,
                  padding: 24,
                  borderLeftWidth: 4,
                  borderLeftColor: colors.primary,
                  marginBottom: 24,
                  width: '100%',
                }}
              >
                <Ionicons 
                  name="bulb" 
                  size={24} 
                  color={colors.primary} 
                  style={{ marginBottom: 12 }}
                />
                <Text style={{
                  fontSize: 16,
                  fontStyle: 'italic',
                  color: colors.text,
                  lineHeight: 24,
                  textAlign: 'center',
                }}>
                  "{motivationalQuote}"
                </Text>
              </Animatable.View>
              
              <Animatable.View
                animation="fadeInUp"
                delay={900}
                style={{
                  flexDirection: 'row',
                  gap: 12,
                  width: '100%',
                }}
              >
                <TouchableOpacity
                  onPress={() => navigation.navigate('Calendar')}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.neutral100,
                    borderRadius: 12,
                    paddingVertical: 14,
                    gap: 8,
                  }}
                >
                  <Ionicons name="calendar" size={20} color={colors.text} />
                  <Text style={{ 
                    fontSize: 14, 
                    fontWeight: '600', 
                    color: colors.text 
                  }}>
                    Lihat Kalender
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => navigation.navigate('Profile')}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.secondary,
                    borderRadius: 12,
                    paddingVertical: 14,
                    gap: 8,
                  }}
                >
                  <Ionicons name="stats-chart" size={20} color={colors.textInverse} />
                  <Text style={{ 
                    fontSize: 14, 
                    fontWeight: '600', 
                    color: colors.textInverse 
                  }}>
                    Lihat Statistik
                  </Text>
                </TouchableOpacity>
              </Animatable.View>
            </Animatable.View>
          ) : (
          <>
          <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
            <Animatable.View
              animation="fadeIn"
              delay={400}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Text style={{
                fontSize: 20,
                fontWeight: '600',
                color: colors.text,
              }}>
                Pilih Target Kebiasaan
              </Text>
              {selectedHabits.length > 0 && (
                <TouchableOpacity onPress={() => setSelectedHabits([])}>
                  <Text style={{ fontSize: 14, color: colors.error, fontWeight: '500' }}>
                    Reset
                  </Text>
                </TouchableOpacity>
              )}
            </Animatable.View>

            <Text style={{ 
              fontSize: 14, 
              color: colors.textLight, 
              marginBottom: 16,
              lineHeight: 20,
            }}>
              Pilih minimal {MINIMUM_HABITS} kebiasaan yang ingin kamu kembangkan hari ini, lalu tuliskan refleksimu untuk mendapatkan analisis dari AI.
            </Text>

            {filteredHabits.map((habit, index) => {
              const category = getCategoryById(habit.category);
              const isSelected = selectedHabits.includes(habit.id);

              return (
                <Animatable.View
                  key={habit.id}
                  animation="fadeInUp"
                  delay={500 + index * 50}
                  style={{ marginBottom: 12 }}
                >
                  <Checkbox
                    checked={isSelected}
                    onPress={() => handleHabitToggle(habit.id)}
                    label={habit.name}
                    description={habit.description}
                    icon={habit.icon as any}
                    iconColor={category?.color || colors.primary}
                  />
                </Animatable.View>
              );
            })}
          </View>

          {hasMinimumHabits && (
            <Animatable.View
              animation="fadeInUp"
              duration={500}
              style={{ paddingHorizontal: 20, marginTop: 24 }}
            >
              <Card variant="elevated" style={{ padding: 20 }}>
                <View style={{ marginBottom: 16 }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: colors.text,
                    marginBottom: 8,
                  }}>
                    Kebiasaan yang Dipilih ({selectedHabits.length})
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {getSelectedHabitObjects().map((habit) => {
                      const category = getCategoryById(habit.category);
                      return (
                        <View
                          key={habit.id}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: `${category?.color || colors.primary}20`,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 16,
                          }}
                        >
                          <Ionicons
                            name={habit.icon}
                            size={14}
                            color={category?.color || colors.primary}
                          />
                          <Text style={{
                            fontSize: 12,
                            color: category?.color || colors.primary,
                            fontWeight: '500',
                            marginLeft: 4,
                          }}>
                            {habit.name}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>

                <View>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: colors.text,
                    marginBottom: 8,
                  }}>
                    Tuliskan Refleksimu
                  </Text>
                  <Text style={{
                    fontSize: 13,
                    color: colors.textLight,
                    marginBottom: 12,
                    lineHeight: 18,
                  }}>
                    Ceritakan mengapa kamu memilih kebiasaan-kebiasaan ini, bagaimana perasaanmu, atau apa yang ingin kamu capai.
                  </Text>
                  <TextInput
                    ref={reflectionInputRef}
                    style={{
                      backgroundColor: colors.background,
                      borderRadius: 12,
                      padding: 16,
                      fontSize: 15,
                      color: colors.text,
                      minHeight: 120,
                      textAlignVertical: 'top',
                      borderWidth: 1,
                      borderColor: colors.neutral200,
                    }}
                    placeholder="Contoh: Hari ini saya ingin lebih fokus pada kesehatan mental dan fisik..."
                    placeholderTextColor={colors.textLight}
                    value={reflectionText}
                    onChangeText={setReflectionText}
                    multiline
                    numberOfLines={5}
                    maxLength={500}
                  />
                  <Text style={{
                    fontSize: 12,
                    color: colors.textLight,
                    textAlign: 'right',
                    marginTop: 4,
                  }}>
                    {reflectionText.length}/500
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={handleReflectionSubmit}
                  disabled={isSubmitting || !reflectionText.trim()}
                  style={{
                    backgroundColor: reflectionText.trim() ? colors.secondary : colors.neutral300,
                    borderRadius: 12,
                    paddingVertical: 16,
                    alignItems: 'center',
                    marginTop: 16,
                    flexDirection: 'row',
                    justifyContent: 'center',
                  }}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color={colors.textInverse} />
                  ) : (
                    <>
                      <Ionicons name="sparkles" size={20} color={colors.textInverse} />
                      <Text style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: colors.textInverse,
                        marginLeft: 8,
                      }}>
                        Analisis dengan AI
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </Card>
            </Animatable.View>
          )}
          </>
          )}

          <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
            <Animatable.Text
              animation="fadeIn"
              delay={800}
              style={{
                fontSize: 20,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 16,
              }}
            >
              Aksi Cepat
            </Animatable.Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Animatable.View animation="fadeInUp" delay={900} style={{ flex: 1, marginRight: 8 }}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Chat')}
                  style={{
                    backgroundColor: colors.secondary,
                    borderRadius: 16,
                    padding: 20,
                    alignItems: 'center',
                  }}
                >
                  <Ionicons name="chatbubble-ellipses" size={32} color={colors.textInverse} />
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: colors.textInverse,
                    marginTop: 8,
                  }}>
                    Chat AI
                  </Text>
                </TouchableOpacity>
              </Animatable.View>

              <Animatable.View animation="fadeInUp" delay={1000} style={{ flex: 1, marginLeft: 8 }}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Calendar')}
                  style={{
                    backgroundColor: colors.accent,
                    borderRadius: 16,
                    padding: 20,
                    alignItems: 'center',
                  }}
                >
                  <Ionicons name="calendar" size={32} color={colors.neutral700} />
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: colors.neutral700,
                    marginTop: 8,
                  }}>
                    Kalender
                  </Text>
                </TouchableOpacity>
              </Animatable.View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default DashboardScreen;
