import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, DateData } from 'react-native-calendars';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Card } from '../../components/ui';
import { useTheme } from '../../contexts';
import { useHabitStore } from '../../store';
import { apiService } from '../../services/api';
import { SHADOWS } from '../../constants/theme';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, addMonths, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { id } from 'date-fns/locale';

interface CalendarData {
  [date: string]: {
    completed: number;
    total: number;
    habits: string[];
  };
}

export const CalendarScreen: React.FC = () => {
  const { colors, isDarkMode } = useTheme();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [calendarData, setCalendarData] = useState<CalendarData>({});
  const [totalHabitsFromBackend, setTotalHabitsFromBackend] = useState(0);
  const { todayCompleted, habits } = useHabitStore();

  // Fetch calendar data from API
  const fetchCalendarData = useCallback(async () => {
    try {
      setLoading(true);
      const month = currentMonth.getMonth() + 1;
      const year = currentMonth.getFullYear();
      
      const response = await apiService.getCalendarData(month, year);
      
      if (response.success && response.data) {
        // Backend returns { days: {...}, totalHabits: N, month, year }
        setCalendarData(response.data.days || {});
        setTotalHabitsFromBackend(response.data.totalHabits || 0);
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  // Refresh when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchCalendarData();
    }, [fetchCalendarData])
  );

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCalendarData();
    setRefreshing(false);
  }, [fetchCalendarData]);

  // Merge API data with today's local data
  const completedDates = useMemo(() => {
    const dates: CalendarData = { ...calendarData };
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    
    // Use total habits from backend, fallback to local habits count or default
    const totalHabits = totalHabitsFromBackend || habits.length || 8;
    
    // Update today's data with local state if we have any local completions
    if (todayCompleted.length > 0 || !dates[todayStr]) {
      dates[todayStr] = {
        completed: dates[todayStr]?.completed || todayCompleted.length,
        total: totalHabits,
        habits: dates[todayStr]?.habits || todayCompleted,
      };
    }
    
    // Ensure all dates have correct total
    Object.keys(dates).forEach(date => {
      if (dates[date].total === 0) {
        dates[date].total = totalHabits;
      }
    });
    
    return dates;
  }, [calendarData, todayCompleted, habits, totalHabitsFromBackend]);

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    
    Object.entries(completedDates).forEach(([date, data]) => {
      const completionRate = data.completed / data.total;
      let color = colors.neutral300;
      
      if (completionRate >= 1) {
        color = colors.success;
      } else if (completionRate >= 0.7) {
        color = colors.primary;
      } else if (completionRate >= 0.4) {
        color = colors.accentOrange;
      } else if (completionRate > 0) {
        color = colors.warning;
      }
      
      marks[date] = {
        customStyles: {
          container: {
            backgroundColor: date === selectedDate ? colors.primary : `${color}30`,
            borderRadius: 8,
            borderWidth: date === selectedDate ? 0 : 2,
            borderColor: color,
          },
          text: {
            color: date === selectedDate ? colors.textInverse : colors.text,
            fontWeight: '600',
          },
        },
      };
    });
    
    // Mark selected date if not in completedDates
    if (!marks[selectedDate]) {
      marks[selectedDate] = {
        customStyles: {
          container: {
            backgroundColor: colors.primary,
            borderRadius: 8,
          },
          text: {
            color: colors.textInverse,
            fontWeight: '600',
          },
        },
      };
    }
    
    return marks;
  }, [completedDates, selectedDate]);

  const selectedDayData = completedDates[selectedDate];
  const formattedSelectedDate = format(new Date(selectedDate), 'EEEE, d MMMM yyyy', { locale: id });

  // Calculate monthly statistics
  const monthlyStats = useMemo(() => {
    const daysWithData = Object.keys(completedDates).length;
    const totalCompleted = Object.values(completedDates).reduce(
      (sum, day) => sum + day.completed, 0
    );
    const totalPossible = Object.values(completedDates).reduce(
      (sum, day) => sum + day.total, 0
    );
    const perfectDays = Object.values(completedDates).filter(
      day => day.total > 0 && day.completed >= day.total
    ).length;
    const avgCompletion = totalPossible > 0 
      ? Math.round((totalCompleted / totalPossible) * 100) 
      : 0;
    
    return {
      daysWithData,
      totalCompleted,
      perfectDays,
      avgCompletion,
    };
  }, [completedDates]);

  // Calculate weekly statistics (current week: Monday to Sunday)
  const weeklyStats = useMemo(() => {
    const today = new Date();
    // Get start of current week (Monday)
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    
    const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    
    return days.map((dayName, index) => {
      const dayDate = addDays(weekStart, index);
      const dateStr = format(dayDate, 'yyyy-MM-dd');
      const dayData = completedDates[dateStr];
      
      // Calculate completion rate for this day
      let completionRate = 0;
      if (dayData && dayData.total > 0) {
        completionRate = dayData.completed / dayData.total;
      }
      
      // Check if this day is in the future
      const isFuture = dayDate > today;
      const isToday = format(today, 'yyyy-MM-dd') === dateStr;
      
      return {
        name: dayName,
        date: dateStr,
        completionRate,
        completed: dayData?.completed || 0,
        total: dayData?.total || totalHabitsFromBackend || 0,
        isFuture,
        isToday,
      };
    });
  }, [completedDates, totalHabitsFromBackend]);

  const getCompletionMessage = (completed: number, total: number) => {
    const rate = completed / total;
    if (rate >= 1) return { emoji: '🏆', message: 'Sempurna! Semua kebiasaan tercapai!' };
    if (rate >= 0.7) return { emoji: '🔥', message: 'Luar biasa! Hampir sempurna!' };
    if (rate >= 0.4) return { emoji: '💪', message: 'Bagus! Terus tingkatkan!' };
    if (rate > 0) return { emoji: '🌱', message: 'Awal yang baik! Jangan menyerah!' };
    return { emoji: '🎯', message: 'Belum ada kebiasaan tercapai' };
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header with Gradient */}
        <LinearGradient
          colors={isDarkMode 
            ? ['#2D1B4E', '#1E3A5F', colors.background] 
            : [colors.primaryLight + '40', colors.accentMint + '30', colors.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}
        >
          <Animatable.View animation="fadeIn">
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <Text style={{
                  fontSize: 32,
                  fontWeight: '800',
                  color: colors.text,
                  letterSpacing: -0.5,
                }}>
                  📅 Kalender
                </Text>
                <Text style={{
                  fontSize: 15,
                  color: colors.textLight,
                  marginTop: 6,
                  fontWeight: '500',
                }}>
                  Lacak konsistensi kebiasaanmu
                </Text>
              </View>
              <View style={{
                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)',
                borderRadius: 16,
                padding: 12,
                ...SHADOWS.sm,
              }}>
                <Text style={{ fontSize: 24 }}>🔥</Text>
              </View>
            </View>
          </Animatable.View>
        </LinearGradient>

        {/* Calendar */}
        <Animatable.View
          animation="fadeInUp"
          delay={200}
          style={{ marginHorizontal: 20, marginTop: 16 }}
        >
          <Card variant="elevated" style={{ padding: 8 }}>
            <Calendar
              current={format(currentMonth, 'yyyy-MM-dd')}
              onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
              onMonthChange={(month: DateData) => setCurrentMonth(new Date(month.dateString))}
              markingType="custom"
              markedDates={markedDates}
              theme={{
                backgroundColor: colors.surface,
                calendarBackground: colors.surface,
                textSectionTitleColor: colors.textLight,
                selectedDayBackgroundColor: colors.primary,
                selectedDayTextColor: colors.textInverse,
                todayTextColor: colors.primary,
                dayTextColor: colors.text,
                textDisabledColor: colors.neutral300,
                arrowColor: colors.primary,
                monthTextColor: colors.text,
                textMonthFontWeight: '600',
                textMonthFontSize: 18,
                textDayFontSize: 14,
                textDayFontWeight: '500',
              }}
              style={{
                borderRadius: 16,
              }}
            />
          </Card>
        </Animatable.View>

        {/* Legend */}
        <Animatable.View
          animation="fadeIn"
          delay={300}
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginTop: 16,
            paddingHorizontal: 20,
          }}
        >
          {[
            { color: colors.success, label: '100%' },
            { color: colors.primary, label: '70-99%' },
            { color: colors.accentOrange, label: '40-69%' },
            { color: colors.warning, label: '1-39%' },
          ].map((item) => (
            <View
              key={item.label}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginRight: 16,
                marginBottom: 8,
              }}
            >
              <View
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  backgroundColor: `${item.color}30`,
                  borderWidth: 2,
                  borderColor: item.color,
                  marginRight: 6,
                }}
              />
              <Text style={{ fontSize: 12, color: colors.textLight }}>
                {item.label}
              </Text>
            </View>
          ))}
        </Animatable.View>

        {/* Monthly Statistics */}
        <Animatable.View
          animation="fadeInUp"
          delay={350}
          style={{ marginHorizontal: 20, marginTop: 24 }}
        >
          <Card variant="elevated">
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: colors.text,
              marginBottom: 16,
            }}>
              📊 Statistik Bulan {format(currentMonth, 'MMMM yyyy', { locale: id })}
            </Text>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {/* Days Active */}
              <View style={{
                flex: 1,
                minWidth: 140,
                backgroundColor: `${colors.primary}15`,
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
              }}>
                <Ionicons name="calendar-outline" size={24} color={colors.primary} />
                <Text style={{
                  fontSize: 28,
                  fontWeight: '700',
                  color: colors.primary,
                  marginTop: 8,
                }}>
                  {monthlyStats.daysWithData}
                </Text>
                <Text style={{
                  fontSize: 12,
                  color: colors.textLight,
                  textAlign: 'center',
                }}>
                  Hari Aktif
                </Text>
              </View>

              {/* Perfect Days */}
              <View style={{
                flex: 1,
                minWidth: 140,
                backgroundColor: `${colors.success}15`,
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
              }}>
                <Ionicons name="trophy-outline" size={24} color={colors.success} />
                <Text style={{
                  fontSize: 28,
                  fontWeight: '700',
                  color: colors.success,
                  marginTop: 8,
                }}>
                  {monthlyStats.perfectDays}
                </Text>
                <Text style={{
                  fontSize: 12,
                  color: colors.textLight,
                  textAlign: 'center',
                }}>
                  Hari Sempurna
                </Text>
              </View>

              {/* Total Completed */}
              <View style={{
                flex: 1,
                minWidth: 140,
                backgroundColor: `${colors.secondary}15`,
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
              }}>
                <Ionicons name="checkmark-done-outline" size={24} color={colors.secondary} />
                <Text style={{
                  fontSize: 28,
                  fontWeight: '700',
                  color: colors.secondary,
                  marginTop: 8,
                }}>
                  {monthlyStats.totalCompleted}
                </Text>
                <Text style={{
                  fontSize: 12,
                  color: colors.textLight,
                  textAlign: 'center',
                }}>
                  Total Checklist Selesai
                </Text>
              </View>

              {/* Average Completion */}
              <View style={{
                flex: 1,
                minWidth: 140,
                backgroundColor: `${colors.accentOrange}15`,
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
              }}>
                <Ionicons name="trending-up-outline" size={24} color={colors.accentOrange} />
                <Text style={{
                  fontSize: 28,
                  fontWeight: '700',
                  color: colors.accentOrange,
                  marginTop: 8,
                }}>
                  {monthlyStats.avgCompletion}%
                </Text>
                <Text style={{
                  fontSize: 12,
                  color: colors.textLight,
                  textAlign: 'center',
                }}>
                  Rata-rata Completion
                </Text>
              </View>
            </View>
          </Card>
        </Animatable.View>

        {/* Selected Day Details */}
        <Animatable.View
          animation="fadeInUp"
          delay={400}
          style={{ marginHorizontal: 20, marginTop: 24 }}
        >
          <Card variant="elevated">
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.text,
              marginBottom: 16,
            }}>
              {formattedSelectedDate}
            </Text>

            {selectedDayData ? (
              <>
                {/* Completion Stats */}
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                }}>
                  <View style={{ flex: 1 }}>
                    <View style={{
                      height: 8,
                      backgroundColor: colors.neutral200,
                      borderRadius: 4,
                      overflow: 'hidden',
                    }}>
                      <Animatable.View
                        animation="slideInLeft"
                        duration={500}
                        style={{
                          height: '100%',
                          width: `${(selectedDayData.completed / selectedDayData.total) * 100}%`,
                          backgroundColor: colors.primary,
                          borderRadius: 4,
                        }}
                      />
                    </View>
                  </View>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: colors.text,
                    marginLeft: 12,
                  }}>
                    {selectedDayData.completed}/{selectedDayData.total}
                  </Text>
                </View>

                {/* Message */}
                <View style={{
                  backgroundColor: `${colors.primary}10`,
                  borderRadius: 12,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                  <Text style={{ fontSize: 32, marginRight: 12 }}>
                    {getCompletionMessage(selectedDayData.completed, selectedDayData.total).emoji}
                  </Text>
                  <Text style={{
                    flex: 1,
                    fontSize: 14,
                    color: colors.text,
                    lineHeight: 20,
                  }}>
                    {getCompletionMessage(selectedDayData.completed, selectedDayData.total).message}
                  </Text>
                </View>

                {/* Habits List */}
                {selectedDayData.habits.length > 0 && (
                  <View style={{ marginTop: 16 }}>
                    <Text style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: colors.textLight,
                      marginBottom: 8,
                    }}>
                      Kebiasaan Tercapai:
                    </Text>
                    {selectedDayData.habits.map((habitId, index) => (
                      <View
                        key={habitId}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingVertical: 8,
                          borderBottomWidth: index < selectedDayData.habits.length - 1 ? 1 : 0,
                          borderBottomColor: colors.neutral200,
                        }}
                      >
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={colors.success}
                        />
                        <Text style={{
                          fontSize: 14,
                          color: colors.text,
                          marginLeft: 8,
                          textTransform: 'capitalize',
                        }}>
                          {habitId.replace(/_/g, ' ')}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </>
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                <Ionicons name="calendar-outline" size={48} color={colors.neutral300} />
                <Text style={{
                  fontSize: 14,
                  color: colors.textLight,
                  marginTop: 12,
                  textAlign: 'center',
                }}>
                  Tidak ada data untuk tanggal ini
                </Text>
              </View>
            )}
          </Card>
        </Animatable.View>

        {/* Weekly Stats */}
        <Animatable.View
          animation="fadeInUp"
          delay={500}
          style={{ marginHorizontal: 20, marginTop: 24 }}
        >
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 4,
          }}>
            Statistik Mingguan
          </Text>
          <Text style={{
            fontSize: 12,
            color: colors.textLight,
            marginBottom: 16,
          }}>
            {format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'd MMM', { locale: id })} - {format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'd MMM yyyy', { locale: id })}
          </Text>

          <Card variant="glass">
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {weeklyStats.map((day, index) => {
                const barHeight = day.isFuture ? 0 : day.completionRate * 100;
                const barColor = day.isFuture 
                  ? colors.neutral300
                  : day.completionRate >= 1 
                    ? colors.success 
                    : day.completionRate >= 0.7 
                      ? colors.primary 
                      : day.completionRate >= 0.4 
                        ? colors.accentOrange 
                        : day.completionRate > 0 
                          ? colors.warning 
                          : colors.neutral400;
                
                return (
                  <TouchableOpacity 
                    key={day.name} 
                    style={{ alignItems: 'center' }}
                    onPress={() => setSelectedDate(day.date)}
                  >
                    {/* Completion indicator */}
                    {day.completionRate >= 1 && !day.isFuture && (
                      <Ionicons 
                        name="checkmark-circle" 
                        size={16} 
                        color={colors.success} 
                        style={{ marginBottom: 4 }}
                      />
                    )}
                    
                    <View style={{
                      width: 32,
                      height: 80,
                      backgroundColor: colors.neutral200,
                      borderRadius: 16,
                      overflow: 'hidden',
                      justifyContent: 'flex-end',
                      borderWidth: day.isToday ? 2 : 0,
                      borderColor: day.isToday ? colors.primary : 'transparent',
                    }}>
                      <Animatable.View
                        animation={barHeight > 0 ? "fadeIn" : undefined}
                        delay={600 + index * 50}
                        style={{
                          width: '100%',
                          height: `${Math.max(barHeight, day.isFuture ? 0 : 5)}%`,
                          backgroundColor: barColor,
                          borderRadius: 16,
                        }}
                      />
                    </View>
                    
                    <Text style={{
                      fontSize: 12,
                      color: day.isToday ? colors.primary : colors.textLight,
                      fontWeight: day.isToday ? '700' : '400',
                      marginTop: 8,
                    }}>
                      {day.name}
                    </Text>
                    
                    {/* Show completion count */}
                    {!day.isFuture && day.total > 0 && (
                      <Text style={{
                        fontSize: 10,
                        color: colors.textLight,
                        marginTop: 2,
                      }}>
                        {day.completed}/{day.total}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>
        </Animatable.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CalendarScreen;
