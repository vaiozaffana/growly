import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { Card, StreakCelebration } from '../../components/ui';
import { useTheme } from '../../contexts';
import { useChatStore, useReflectionStore } from '../../store';
import { getHabitById } from '../../constants/habits';
import { apiService } from '../../services/api';
import { ChatMessage } from '../../types';
import { SHADOWS } from '../../constants/theme';
import { format } from 'date-fns';


const HABIT_SPECIFIC_PROMPTS: Record<string, string[]> = {
  sleep: [
    "Bagaimana kualitas tidurmu semalam? Apakah kamu merasa segar saat bangun?",
    "Apa yang biasanya mempengaruhi kualitas tidurmu?",
  ],
  meditation: [
    "Bagaimana sesi meditasimu hari ini? Apakah ada insight menarik yang muncul?",
    "Apa yang kamu rasakan setelah meditasi?",
  ],
  honesty: [
    "Apakah ada situasi hari ini di mana kejujuran terasa menantang?",
    "Bagaimana kejujuran mempengaruhi hubunganmu dengan orang lain?",
  ],
  empathy: [
    "Ceritakan tentang momen di mana kamu mencoba memahami perspektif orang lain hari ini.",
    "Bagaimana empati membantumu dalam interaksi sosial?",
  ],
  gratitude: [
    "Apa 3 hal yang membuatmu bersyukur hari ini?",
    "Siapa yang ingin kamu ucapkan terima kasih dan mengapa?",
  ],
};

export const ChatScreen: React.FC<{ route?: any; navigation?: any }> = ({ route, navigation }) => {
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const habitId = route?.params?.habitId;
  const habitName = route?.params?.habitName;
  const initialMessage = route?.params?.initialMessage;
  const habitContext = route?.params?.habitContext;
  
  const { messages, addMessage, setMessages, setLoading, isLoading, setHabitContext, clearChat } = useChatStore();
  const { addReflection } = useReflectionStore();
  const [inputText, setInputText] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasProcessedInitialMessage, setHasProcessedInitialMessage] = useState(false);
  const [showStreakCelebration, setShowStreakCelebration] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  // Fetch chat history from API for the current user
  const fetchChatHistory = useCallback(async () => {
    try {
      setInitialLoading(true);
      
      // Clear local messages first to prevent showing old user's data
      clearChat();
      
      // Fetch chat history from backend (which filters by userId)
      const response = await apiService.getChatHistory(habitId);
      
      if (response.success && response.data) {
        // Convert API response to ChatMessage format
        const chatMessages: ChatMessage[] = response.data.map((msg: any) => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          timestamp: msg.createdAt,
          habitContext: msg.habitContext,
        }));
        setMessages(chatMessages);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
      // On error, show welcome message
      addWelcomeMessage();
    } finally {
      setInitialLoading(false);
    }
  }, [habitId, clearChat, setMessages]);

  // Add welcome message if no chat history
  const addWelcomeMessage = useCallback(() => {
    if (habitId) {
      const habit = getHabitById(habitId);
      if (habit) {
        const initialMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Hebat! Kamu telah menyelesaikan "${habit.name}" hari ini! 🎉\n\n${habit.reflectionPrompts[0]}`,
          timestamp: new Date().toISOString(),
          habitContext: habitId,
        };
        addMessage(initialMessage);
      }
    } else {
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Halo! 👋 Aku di sini untuk membantumu merefleksikan perjalanan kebiasaanmu. Ceritakan apa yang ada di pikiranmu hari ini, atau bagaimana perasaanmu tentang kebiasaan yang sedang kamu bangun.',
        timestamp: new Date().toISOString(),
      };
      addMessage(welcomeMessage);
    }
  }, [habitId, addMessage]);

  useEffect(() => {
    fetchChatHistory();
  }, [fetchChatHistory]);

  // Add welcome message after fetch if no messages
  useEffect(() => {
    if (!initialLoading && messages.length === 0 && !hasProcessedInitialMessage) {
      addWelcomeMessage();
    }
  }, [initialLoading, messages.length, hasProcessedInitialMessage, addWelcomeMessage]);

  useEffect(() => {
    if (habitId) {
      setHabitContext(habitId);
    }
  }, [habitId, setHabitContext]);

  // Handle initial message from Dashboard (habit selection + reflection)
  useEffect(() => {
    const processInitialMessage = async () => {
      if (initialMessage && habitContext && !hasProcessedInitialMessage) {
        setHasProcessedInitialMessage(true);
        
        // Clear existing messages and show context
        clearChat();
        
        // Create user context message (summary of what user selected)
        const habitNames = habitContext.selectedHabits.map((h: any) => h.name).join(', ');
        const userContextMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'user',
          content: `Saya telah memilih kebiasaan: ${habitNames}\n\nRefleksi saya: "${habitContext.reflection}"`,
          timestamp: new Date().toISOString(),
        };
        addMessage(userContextMessage);
        
        setLoading(true);
        
        // Scroll to show the user message
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
        
        try {
          // Send to AI for analysis
          const response = await apiService.sendChatMessage(initialMessage, undefined);
          
          if (response.success && response.data) {
            const aiMessage: ChatMessage = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: response.data.response,
              timestamp: new Date().toISOString(),
            };
            addMessage(aiMessage);
            
            // Save reflection to backend
            try {
              await apiService.createReflection({
                content: habitContext.reflection,
                aiResponse: response.data.response,
                mood: 'good',
                habitId: habitContext.createdHabitIds?.[0] || undefined,
              });
            } catch (reflectionError) {
              console.error('Error saving reflection to backend:', reflectionError);
            }
            
            // Save reflection to local store
            addReflection({
              id: Date.now().toString(),
              userId: '1',
              habitId: habitContext.createdHabitIds?.[0] || undefined,
              content: habitContext.reflection,
              aiResponse: response.data.response,
              createdAt: new Date().toISOString(),
            });
            
            // Fetch and show streak celebration
            try {
              const statsResponse = await apiService.getStats();
              if (statsResponse.success && statsResponse.data) {
                const streak = statsResponse.data.currentStreak || 0;
                if (streak > 0) {
                  setCurrentStreak(streak);
                  // Delay celebration untuk membiarkan user melihat respons AI dulu
                  setTimeout(() => {
                    setShowStreakCelebration(true);
                  }, 800);
                }
              }
            } catch (statsError) {
              console.error('Error fetching streak:', statsError);
            }
          } else {
            const errorMessage: ChatMessage = {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: 'Maaf, terjadi kesalahan saat menganalisis. Silakan coba lagi nanti.',
              timestamp: new Date().toISOString(),
            };
            addMessage(errorMessage);
          }
        } catch (error) {
          console.error('Error processing initial message:', error);
          const errorMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: 'Maaf, terjadi kesalahan koneksi. Pastikan server backend berjalan.',
            timestamp: new Date().toISOString(),
          };
          addMessage(errorMessage);
        } finally {
          setLoading(false);
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      }
    };
    
    processInitialMessage();
  }, [initialMessage, habitContext, hasProcessedInitialMessage]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date().toISOString(),
      habitContext: habitId,
    };

    addMessage(userMessage);
    const messageContent = inputText.trim();
    setInputText('');
    setLoading(true);

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      // Call AI API
      const response = await apiService.sendChatMessage(messageContent, habitId);
      
      if (response.success && response.data) {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.data.response,
          timestamp: new Date().toISOString(),
          habitContext: habitId,
        };

        addMessage(aiMessage);

        // Save reflection
        addReflection({
          id: Date.now().toString(),
          userId: '1',
          habitId: habitId,
          content: messageContent,
          aiResponse: response.data.response,
          createdAt: new Date().toISOString(),
        });
      } else {
        // Show error message
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Maaf, terjadi kesalahan. Silakan coba lagi nanti.',
          timestamp: new Date().toISOString(),
          habitContext: habitId,
        };
        addMessage(errorMessage);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Maaf, terjadi kesalahan koneksi. Pastikan server backend berjalan.',
        timestamp: new Date().toISOString(),
        habitContext: habitId,
      };
      addMessage(errorMessage);
    } finally {
      setLoading(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleClearChat = () => {
    clearChat();
    // Re-add welcome message
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: 'Halo! 👋 Aku di sini untuk membantumu merefleksikan perjalanan kebiasaanmu. Ceritakan apa yang ada di pikiranmu hari ini!',
      timestamp: new Date().toISOString(),
    };
    addMessage(welcomeMessage);
  };

  const renderMessage = (message: ChatMessage, index: number) => {
    const isUser = message.role === 'user';
    
    return (
      <Animatable.View
        key={message.id}
        animation="fadeInUp"
        duration={400}
        delay={index * 50}
        style={{
          flexDirection: 'row',
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          marginBottom: 16,
          paddingHorizontal: 16,
        }}
      >
        {!isUser && (
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 16,
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : colors.accentMint + '40',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 10,
              ...SHADOWS.sm,
            }}
          >
            <Text style={{ fontSize: 20 }}>🌱</Text>
          </View>
        )}
        
        <View
          style={{
            maxWidth: '75%',
            backgroundColor: isUser 
              ? colors.primary 
              : isDarkMode ? 'rgba(255,255,255,0.08)' : colors.surface,
            borderRadius: 24,
            borderBottomRightRadius: isUser ? 6 : 24,
            borderBottomLeftRadius: isUser ? 24 : 6,
            paddingHorizontal: 18,
            paddingVertical: 14,
            borderWidth: isUser ? 0 : 1,
            borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : colors.neutral200,
            ...SHADOWS.sm,
          }}
        >
          <Text
            style={{
              fontSize: 15,
              lineHeight: 24,
              color: isUser ? colors.textInverse : colors.text,
              fontWeight: '400',
            }}
          >
            {message.content}
          </Text>
          <Text
            style={{
              fontSize: 11,
              color: isUser ? 'rgba(255,255,255,0.6)' : colors.textLight,
              marginTop: 6,
              alignSelf: 'flex-end',
              fontWeight: '500',
            }}
          >
            {format(new Date(message.timestamp), 'HH:mm')}
          </Text>
        </View>
        
        {isUser && (
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 16,
              backgroundColor: colors.accentPurple + '30',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 10,
              ...SHADOWS.sm,
            }}
          >
            <Text style={{ fontSize: 18 }}>😊</Text>
          </View>
        )}
      </Animatable.View>
    );
  };

  const renderTypingIndicator = () => (
    <Animatable.View
      animation="fadeIn"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 16,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 16,
          backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : colors.accentMint + '40',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 10,
        }}
      >
        <Text style={{ fontSize: 20 }}>🌱</Text>
      </View>
      <View
        style={{
          backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : colors.surface,
          borderRadius: 24,
          borderBottomLeftRadius: 6,
          paddingHorizontal: 20,
          paddingVertical: 16,
          flexDirection: 'row',
          borderWidth: 1,
          borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : colors.neutral200,
          ...SHADOWS.sm,
        }}
      >
        <Animatable.View
          animation="pulse"
          iterationCount="infinite"
          duration={600}
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: colors.primary,
            marginRight: 6,
          }}
        />
        <Animatable.View
          animation="pulse"
          iterationCount="infinite"
          duration={600}
          delay={200}
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: colors.accentMint,
            marginRight: 6,
          }}
        />
        <Animatable.View
          animation="pulse"
          iterationCount="infinite"
          duration={600}
          delay={400}
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: colors.accentPurple,
          }}
        />
      </View>
    </Animatable.View>
  );

  const quickPrompts = habitId
    ? HABIT_SPECIFIC_PROMPTS[habitId] || []
    : [
        "Bagaimana harimu?",
        "Aku butuh motivasi",
        "Ceritakan tentang streakku",
      ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
      >
        {/* Modern Header */}
        <LinearGradient
          colors={isDarkMode 
            ? ['#2D1B4E', '#1E3A5F'] 
            : [colors.primaryLight + '50', colors.accentPurple + '30']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
            ...SHADOWS.sm,
          }}
        >
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 20,
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.9)',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 14,
              ...SHADOWS.sm,
            }}
          >
            <Text style={{ fontSize: 28 }}>🌱</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 20,
              fontWeight: '700',
              color: colors.text,
              letterSpacing: -0.3,
            }}>
              Refleksi AI ✨
            </Text>
            <Text style={{
              fontSize: 14,
              color: colors.textLight,
              fontWeight: '500',
              marginTop: 2,
            }}>
              {habitName ? `Tentang: ${habitName}` : 'Teman refleksimu'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleClearChat}
            style={{
              width: 44,
              height: 44,
              borderRadius: 16,
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)',
              alignItems: 'center',
              justifyContent: 'center',
              ...SHADOWS.sm,
            }}
          >
            <Ionicons name="refresh-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
        </LinearGradient>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{ paddingVertical: 16, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((message, index) => renderMessage(message, index))}
          {isLoading && renderTypingIndicator()}
        </ScrollView>

        {/* Quick Prompts */}
        {messages.length <= 2 && quickPrompts.length > 0 && (
          <Animatable.View
            animation="fadeInUp"
            style={{ paddingHorizontal: 16, paddingBottom: 8 }}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 16 }}
            >
              {quickPrompts.map((prompt, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setInputText(prompt)}
                  style={{
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : colors.surface,
                    borderWidth: 2,
                    borderColor: colors.primary + '50',
                    borderRadius: 24,
                    paddingHorizontal: 18,
                    paddingVertical: 12,
                    marginRight: 10,
                    ...SHADOWS.sm,
                  }}
                >
                  <Text style={{
                    fontSize: 14,
                    color: colors.primary,
                    fontWeight: '600',
                  }}>
                    💬 {prompt}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animatable.View>
        )}

        {/* Input - dengan padding untuk floating tab bar */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            paddingHorizontal: 16,
            paddingTop: 14,
            paddingBottom: Math.max(insets.bottom + 80, 90), // Tambah padding untuk floating tab bar (68px + gap)
            backgroundColor: isDarkMode ? colors.surface : colors.background,
            borderTopWidth: 1,
            borderTopColor: isDarkMode ? 'rgba(255,255,255,0.08)' : colors.neutral200,
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'flex-end',
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : colors.surface,
              borderRadius: 28,
              paddingHorizontal: 18,
              paddingTop: 12,
              paddingBottom: 12,
              marginRight: 12,
              minHeight: 52,
              maxHeight: 120,
              borderWidth: 2,
              borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : colors.neutral200,
              ...SHADOWS.sm,
            }}
          >
            <TextInput
              ref={inputRef}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Tulis refleksimu... ✍️"
              placeholderTextColor={colors.neutral400}
              multiline
              textAlignVertical="center"
              style={{
                flex: 1,
                fontSize: 16,
                color: colors.text,
                maxHeight: 100,
                minHeight: 28,
                lineHeight: 22,
                paddingTop: 0,
                paddingBottom: 0,
              }}
            />
          </View>
          <TouchableOpacity
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
            style={{
              width: 52,
              height: 52,
              borderRadius: 20,
              backgroundColor: inputText.trim() ? colors.primary : colors.neutral300,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 0,
              ...SHADOWS.md,
            }}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.textInverse} />
            ) : (
              <Ionicons
                name="arrow-up"
                size={24}
                color={colors.textInverse}
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      
      {/* Streak Celebration Modal */}
      <StreakCelebration
        visible={showStreakCelebration}
        streak={currentStreak}
        onAnimationEnd={() => setShowStreakCelebration(false)}
      />
    </SafeAreaView>
  );
};

export default ChatScreen;
