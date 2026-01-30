import axios, { AxiosInstance, AxiosError } from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import {
  User,
  Habit,
  HabitLog,
  Reflection,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  ApiResponse,
} from '../types';

const getApiUrl = (): string => {

  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  const isExpoGo = Constants.appOwnership === 'expo';

  const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
  
  if (debuggerHost) {
    const hostIP = debuggerHost.split(':')[0];
    console.log('[API] Detected host IP:', hostIP);
    return `http://${hostIP}:3000`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000'; // Android Emulator
  } else if (Platform.OS === 'ios') {
    return 'http://localhost:3000'; // iOS Simulator
  }

  return 'http://localhost:3000';
};

const API_BASE_URL = getApiUrl();

class ApiService {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    console.log('[API] Initializing with base URL:', API_BASE_URL);
    
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(
      (config) => {
        const fullUrl = `${config.baseURL}${config.url}`;
        console.log(`[API] ${config.method?.toUpperCase()} ${fullUrl}`);
        if (config.data) {
          console.log('[API] Request body:', JSON.stringify(config.data));
        }
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        console.error('[API] Request error:', error);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        console.log(`[API] Response ${response.status}:`, JSON.stringify(response.data).substring(0, 200));
        return response;
      },
      (error: AxiosError) => {
        if (error.response) {
          console.error(`[API] Error ${error.response.status}:`, error.response.data);
        } else if (error.request) {
          console.error('[API] No response received. Is backend running?');
          console.error('[API] Trying to reach:', API_BASE_URL);
        } else {
          console.error('[API] Error:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string | null) {
    this.token = token;
    console.log('[API] Token', token ? 'set' : 'cleared');
  }

  getBaseUrl() {
    return API_BASE_URL;
  }

  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await this.client.post('/auth/login', credentials);
      // Backend returns { success: true, data: { user, token } }
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Login failed';
      return { success: false, error: message };
    }
  }

  async register(credentials: RegisterCredentials): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await this.client.post('/auth/register', credentials);
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Registration failed';
      return { success: false, error: message };
    }
  }

  async getProfile(): Promise<ApiResponse<User>> {
    try {
      const response = await this.client.get('/auth/profile');
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      return response.data;
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Failed to get profile' };
    }
  }

  async updateProfile(updates: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response = await this.client.put('/auth/profile', updates);
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      return response.data;
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Failed to update profile' };
    }
  }

  async deleteAccount(): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await this.client.delete('/auth/account');
      if (response.data.success) {
        return { success: true, data: response.data };
      }
      return response.data;
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Failed to delete account' };
    }
  }

  async getHabits(): Promise<ApiResponse<Habit[]>> {
    try {
      const response = await this.client.get('/habits');
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      return response.data;
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Failed to get habits' };
    }
  }

  async createHabit(habit: Omit<Habit, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Habit>> {
    try {
      const response = await this.client.post('/habits', habit);
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      return response.data;
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Failed to create habit' };
    }
  }

  async updateHabit(habitId: string, updates: Partial<Habit>): Promise<ApiResponse<Habit>> {
    try {
      const response = await this.client.put(`/habits/${habitId}`, updates);
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      return response.data;
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Failed to update habit' };
    }
  }

  async deleteHabit(habitId: string): Promise<ApiResponse<void>> {
    try {
      const response = await this.client.delete(`/habits/${habitId}`);
      return { success: true, data: undefined };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Failed to delete habit' };
    }
  }

  async logHabit(habitId: string, data: Partial<HabitLog>): Promise<ApiResponse<HabitLog>> {
    try {
      const response = await this.client.post(`/habits/${habitId}/log`, data);
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      return response.data;
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Failed to log habit' };
    }
  }

  async getHabitLogs(habitId: string, startDate?: string, endDate?: string): Promise<ApiResponse<HabitLog[]>> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const url = `/habits/${habitId}/logs${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await this.client.get(url);
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      return response.data;
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Failed to get habit logs' };
    }
  }

  async getTodayProgress(): Promise<ApiResponse<{ completed: string[]; total: number }>> {
    try {
      const response = await this.client.get('/habits/today/progress');
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      return response.data;
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Failed to get today progress' };
    }
  }

  async getReflections(habitId?: string): Promise<ApiResponse<Reflection[]>> {
    try {
      const url = habitId ? `/reflections?habitId=${habitId}` : '/reflections';
      const response = await this.client.get(url);
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      return response.data;
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Failed to get reflections' };
    }
  }

  async createReflection(reflection: Omit<Reflection, 'id' | 'userId' | 'createdAt'>): Promise<ApiResponse<Reflection>> {
    try {
      const response = await this.client.post('/reflections', reflection);
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      return response.data;
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Failed to create reflection' };
    }
  }

  async sendChatMessage(message: string, habitContext?: string): Promise<ApiResponse<{ response: string }>> {
    try {
      const response = await this.client.post('/ai/chat', { 
        message, 
        habitContext 
      });
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      return response.data;
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Failed to send message' };
    }
  }

  async getChatHistory(habitContext?: string, limit?: number): Promise<ApiResponse<any[]>> {
    try {
      const params = new URLSearchParams();
      if (habitContext) params.append('habitContext', habitContext);
      if (limit) params.append('limit', limit.toString());
      
      const url = `/ai/history${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await this.client.get(url);
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      return response.data;
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Failed to get chat history' };
    }
  }

  async clearChatHistory(): Promise<ApiResponse<void>> {
    try {
      const response = await this.client.delete('/ai/history');
      return { success: true, data: undefined };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Failed to clear chat history' };
    }
  }

  async getStats(): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.get('/stats');
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      return response.data;
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Failed to get stats' };
    }
  }

  async getCalendarData(month: number, year: number): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.get(`/calendar?month=${month}&year=${year}`);
      if (response.data.success && response.data.data) {
        return { success: true, data: response.data.data };
      }
      return response.data;
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Failed to get calendar data' };
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.client.get('/');
      console.log('[API] Connection test successful:', response.data);
      return true;
    } catch (error) {
      console.error('[API] Connection test failed');
      return false;
    }
  }
}

export const apiService = new ApiService();
export default apiService;