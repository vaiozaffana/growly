import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation';
import { useAuthStore, useAppStore } from './src/store';
import { notificationService } from './src/services/notifications';
import { ThemeProvider } from './src/contexts';

import './src/styles/global.css';

export default function App() {
  const { setLoading } = useAuthStore();
  const { isDarkMode } = useAppStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
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
  
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (error) {
        console.error('Failed to initialize app:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();

    const responseListener = notificationService.addNotificationResponseListener(
      (response) => {
        const data = response.notification.request.content.data;
        console.log('Notification tapped:', data);
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
