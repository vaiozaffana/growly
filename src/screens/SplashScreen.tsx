import React from 'react';
import { View, Image, StyleSheet, Dimensions, Text } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts';

const { width } = Dimensions.get('window');

export const SplashScreen: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={[colors.primary, colors.accentPurple]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Decorative Circles */}
      <View style={[styles.circle, { top: -100, right: -50, width: 300, height: 300, opacity: 0.1 }]} />
      <View style={[styles.circle, { bottom: -50, left: -50, width: 200, height: 200, opacity: 0.1 }]} />
      
      {/* Animated Logo Container */}
      <Animatable.View 
        animation="bounceIn" 
        duration={2000} 
        useNativeDriver
        style={styles.logoContainer}
      >
        <Image 
          source={require('../assets/image/Growly_Logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </Animatable.View>
      
      {/* Animated Text */}
      <Animatable.View 
        animation="fadeInUp" 
        delay={800} 
        duration={1000} 
        useNativeDriver
        style={styles.textContainer}
      >
        <Text style={styles.title}>Growly</Text>
        <Text style={styles.subtitle}>Tumbuh Bersama, Bahagia Bersama</Text>
      </Animatable.View>

       {/* Loading Indicator */}
       <Animatable.View 
        animation="pulse" 
        easing="ease-out" 
        iterationCount="infinite" 
        duration={1500}
        useNativeDriver
        style={styles.loadingContainer}
      >
        <View style={styles.dot} />
        <View style={[styles.dot, { marginHorizontal: 8, opacity: 0.7 }]} />
        <View style={[styles.dot, { opacity: 0.4 }]} />
      </Animatable.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B',
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'white',
  },
  logoContainer: {
    width: width * 0.4,
    height: width * 0.4,
    backgroundColor: 'white',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    marginBottom: 24,
  },
  logo: {
    width: '80%',
    height: '80%',
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.95)',
    marginTop: 8,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 60,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  }
});

export default SplashScreen;
