import { create } from 'zustand';
import { User, Habit, HabitLog, Streak, Reflection, ChatMessage, UserStats } from '../types';

export const clearAllStores = () => {
  useAuthStore.getState().logout();
  useHabitStore.getState().reset();
  useChatStore.getState().clearChat();
  useReflectionStore.getState().reset();
  useStatsStore.getState().reset();
};

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setToken: (token) => set({ token }),
  login: (user, token) => set({ user, token, isAuthenticated: true, isLoading: false }),
  logout: () => set({ user: null, token: null, isAuthenticated: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));

interface HabitState {
  habits: Habit[];
  habitLogs: HabitLog[];
  streaks: Map<string, Streak>;
  todayCompleted: string[];
  setHabits: (habits: Habit[]) => void;
  addHabit: (habit: Habit) => void;
  removeHabit: (habitId: string) => void;
  updateHabit: (habitId: string, updates: Partial<Habit>) => void;
  addLog: (log: HabitLog) => void;
  setTodayCompleted: (habitIds: string[]) => void;
  toggleHabitCompletion: (habitId: string) => void;
  getStreak: (habitId: string) => Streak | undefined;
  updateStreak: (habitId: string, streak: Streak) => void;
  reset: () => void;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  habitLogs: [],
  streaks: new Map(),
  todayCompleted: [],
  setHabits: (habits) => set({ habits }),
  addHabit: (habit) => set((state) => ({ habits: [...state.habits, habit] })),
  removeHabit: (habitId) =>
    set((state) => ({ habits: state.habits.filter((h) => h.id !== habitId) })),
  updateHabit: (habitId, updates) =>
    set((state) => ({
      habits: state.habits.map((h) => (h.id === habitId ? { ...h, ...updates } : h)),
    })),
  addLog: (log) => set((state) => ({ habitLogs: [...state.habitLogs, log] })),
  setTodayCompleted: (habitIds) => set({ todayCompleted: habitIds }),
  toggleHabitCompletion: (habitId) =>
    set((state) => {
      const isCompleted = state.todayCompleted.includes(habitId);
      return {
        todayCompleted: isCompleted
          ? state.todayCompleted.filter((id) => id !== habitId)
          : [...state.todayCompleted, habitId],
      };
    }),
  getStreak: (habitId) => get().streaks.get(habitId),
  updateStreak: (habitId, streak) =>
    set((state) => {
      const newStreaks = new Map(state.streaks);
      newStreaks.set(habitId, streak);
      return { streaks: newStreaks };
    }),
  reset: () => set({ 
    habits: [], 
    habitLogs: [], 
    streaks: new Map(), 
    todayCompleted: [] 
  }),
}));

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  currentHabitContext: string | null;
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setLoading: (loading: boolean) => void;
  setHabitContext: (habitId: string | null) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  currentHabitContext: null,
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setMessages: (messages) => set({ messages }),
  setLoading: (isLoading) => set({ isLoading }),
  setHabitContext: (currentHabitContext) => set({ currentHabitContext }),
  clearChat: () => set({ messages: [], currentHabitContext: null }),
}));

interface ReflectionState {
  reflections: Reflection[];
  addReflection: (reflection: Reflection) => void;
  setReflections: (reflections: Reflection[]) => void;
  getReflectionsByHabit: (habitId: string) => Reflection[];
  reset: () => void;
}

export const useReflectionStore = create<ReflectionState>((set, get) => ({
  reflections: [],
  addReflection: (reflection) =>
    set((state) => ({ reflections: [...state.reflections, reflection] })),
  setReflections: (reflections) => set({ reflections }),
  getReflectionsByHabit: (habitId) =>
    get().reflections.filter((r) => r.habitId === habitId),
  reset: () => set({ reflections: [] }),
}));

interface StatsState {
  stats: UserStats;
  setStats: (stats: UserStats) => void;
  updateStats: (updates: Partial<UserStats>) => void;
  reset: () => void;
}

export const useStatsStore = create<StatsState>((set) => ({
  stats: {
    totalHabits: 0,
    completedToday: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalReflections: 0,
    weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
  },
  setStats: (stats) => set({ stats }),
  updateStats: (updates) =>
    set((state) => ({ stats: { ...state.stats, ...updates } })),
  reset: () => set({
    stats: {
      totalHabits: 0,
      completedToday: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalReflections: 0,
      weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
    },
  }),
}));

interface AppState {
  isFirstLaunch: boolean;
  isDarkMode: boolean;
  notificationsEnabled: boolean;
  setFirstLaunch: (value: boolean) => void;
  setDarkMode: (value: boolean) => void;
  setNotificationsEnabled: (value: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isFirstLaunch: true,
  isDarkMode: false,
  notificationsEnabled: true,
  setFirstLaunch: (isFirstLaunch) => set({ isFirstLaunch }),
  setDarkMode: (isDarkMode) => set({ isDarkMode }),
  setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
}));
