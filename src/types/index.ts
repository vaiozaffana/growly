export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Habit {
  id: string;
  userId: string;
  templateId: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  isActive: boolean;
  reminderTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  userId: string;
  completedAt: string;
  reflection?: string;
  mood?: 'great' | 'good' | 'neutral' | 'bad' | 'terrible';
  notes?: string;
}

export interface Streak {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedAt?: string;
}
export interface Reflection {
  id: string;
  userId: string;
  habitId?: string;
  content: string;
  aiResponse?: string;
  mood?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  habitContext?: string;
}

export interface CalendarDay {
  date: string;
  completed: boolean;
  habits: string[];
  mood?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface Reminder {
  id: string;
  habitId: string;
  time: string;
  isActive: boolean;
  days: number[]; // 0-6 for Sunday-Saturday
}

export interface UserStats {
  totalHabits: number;
  completedToday: number;
  currentStreak: number;
  longestStreak: number;
  totalReflections: number;
  weeklyProgress: number[];
}

export type RootStackParamList = {
  Landing: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
  HabitDetail: { habitId: string };
  Reflection: { habitId?: string };
  Settings: undefined;
  Profile: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Calendar: undefined;
  Chat: {
    habitId?: string;
    habitName?: string;
    initialMessage?: string;
    habitContext?: {
      selectedHabits: any[];
      reflection: string;
    };
  } | undefined;
  Profile: undefined;
};
