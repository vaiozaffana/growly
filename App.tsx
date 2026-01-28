import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation';
import { useAuthStore, useAppStore } from './src/store';
import { notificationService } from './src/services/notifications';
import { ThemeProvider } from './src/contexts';

import './global.css';

export default function App() {
  const { setLoading } = useAuthStore();
  const { isDarkMode } = useAppStore();

  useEffect(() => {
    // Initialize app
    const initializeApp = async () => {
      try {
        // Request notification permissions
        await notificationService.requestPermissions();
        
        // Check for stored auth token
        // In production, load from secure storage
        // const token = await SecureStore.getItemAsync('authToken');
        // if (token) {
        //   apiService.setToken(token);
        //   const profile = await apiService.getProfile();
        //   if (profile.success && profile.data) {
        //     login(profile.data, token);
        //   }
        // }
      } catch (error) {
        console.error('Failed to initialize app:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();

    // Set up notification listeners
    const responseListener = notificationService.addNotificationResponseListener(
      (response) => {
        const data = response.notification.request.content.data;
        console.log('Notification tapped:', data);
        // Handle navigation based on notification type
      }
    );

    const receivedListener = notificationService.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
      }
    );

    return () => {
      responseListener.remove();
      receivedListener.remove();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppNavigator />
          <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
