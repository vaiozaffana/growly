import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useAppStore } from '../store';
import { LIGHT_COLORS, DARK_COLORS } from '../constants/theme';

type ThemeColors = typeof LIGHT_COLORS;

interface ThemeContextType {
  colors: ThemeColors;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const { isDarkMode, setDarkMode } = useAppStore();

  const colors = useMemo(() => {
    return isDarkMode ? DARK_COLORS : LIGHT_COLORS;
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!isDarkMode);
  };

  const value = useMemo(() => ({
    colors,
    isDarkMode,
    toggleDarkMode,
  }), [colors, isDarkMode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const useColors = () => {
  const { colors } = useTheme();
  return colors;
};

export default ThemeContext;
