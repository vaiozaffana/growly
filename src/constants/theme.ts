export const LIGHT_COLORS = {
  // Primary Colors - Coral/Salmon (Energetic & Warm)
  primary: '#FF6B6B',
  primaryLight: '#FF8E8E',
  primaryDark: '#E85555',
  
  // Secondary Colors - Deep Teal (Calm & Trustworthy)
  secondary: '#20B2AA',
  secondaryLight: '#4ECDC4',
  secondaryDark: '#17A398',
  
  // Accent Colors - Playful Mix
  accent: '#FFE66D', // Sunny Yellow
  accentOrange: '#FFA94D', // Mango Orange
  accentPink: '#F687B3', // Bubblegum Pink
  accentPurple: '#9F7AEA', // Lavender Purple
  accentMint: '#81E6D9', // Fresh Mint
  
  // Neutral Colors - Warm Grays
  neutral100: '#FAF9F7',
  neutral200: '#F0EFED',
  neutral300: '#E2E0DD',
  neutral400: '#B8B5B0',
  neutral500: '#8A8680',
  neutral600: '#5C5955',
  neutral700: '#3D3B38',
  neutral800: '#252422',
  neutral900: '#1A1918',
  
  // Semantic Colors
  success: '#38D99A',
  warning: '#FFB547',
  error: '#FF6B6B',
  info: '#54C6FF',
  
  // Background Colors
  background: '#FFFCF9',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFAF5',
  
  // Text Colors
  text: '#2D2926',
  textLight: '#6B6660',
  textInverse: '#FFFFFF',
  textAccent: '#FF6B6B',
  
  // Gradient Colors
  gradientStart: '#FF6B6B',
  gradientMid: '#FFA94D',
  gradientEnd: '#FFE66D',
  
  // Card Colors
  cardBg1: '#FFF5F5',
  cardBg2: '#F0FFFF',
  cardBg3: '#FFFEF0',
  cardBg4: '#F8F5FF',
};

export const DARK_COLORS = {
  // Primary Colors
  primary: '#FF8080',
  primaryLight: '#FFA3A3',
  primaryDark: '#FF6B6B',
  
  // Secondary Colors
  secondary: '#4ECDC4',
  secondaryLight: '#6EE7E0',
  secondaryDark: '#20B2AA',
  
  // Accent Colors
  accent: '#FFE66D',
  accentOrange: '#FFB86C',
  accentPink: '#FF79C6',
  accentPurple: '#BD93F9',
  accentMint: '#8BE9DE',
  
  // Neutral Colors
  neutral100: '#1E1E24',
  neutral200: '#2A2A32',
  neutral300: '#3A3A44',
  neutral400: '#5A5A66',
  neutral500: '#8888A0',
  neutral600: '#B0B0C0',
  neutral700: '#D0D0E0',
  neutral800: '#E8E8F0',
  neutral900: '#F5F5FA',
  
  // Semantic Colors
  success: '#50FA7B',
  warning: '#FFB86C',
  error: '#FF6B6B',
  info: '#8BE9FD',
  
  // Background Colors
  background: '#16161A',
  surface: '#1E1E24',
  surfaceElevated: '#2A2A32',
  
  // Text Colors
  text: '#FFFFFE',
  textLight: '#94A1B2',
  textInverse: '#16161A',
  textAccent: '#FF8080',
  
  // Gradient Colors
  gradientStart: '#FF8080',
  gradientMid: '#FFB86C',
  gradientEnd: '#FFE66D',
  
  // Card Colors
  cardBg1: '#2A2030',
  cardBg2: '#1A2A2A',
  cardBg3: '#2A2A20',
  cardBg4: '#2A2035',
};

export const COLORS = LIGHT_COLORS;

export const getColors = (isDarkMode: boolean) => {
  return isDarkMode ? DARK_COLORS : LIGHT_COLORS;
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  semibold: 'System',
  bold: 'System',
};

export const SIZES = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  
  fontXs: 12,
  fontSm: 14,
  fontMd: 16,
  fontLg: 18,
  fontXl: 20,
  font2xl: 24,
  font3xl: 30,
  font4xl: 36,
 
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusXl: 24,
  radiusFull: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

export default {
  COLORS,
  FONTS,
  SIZES,
  SHADOWS,
};
