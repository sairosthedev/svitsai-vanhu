import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';

export default function SplashScreen() {
  const navigation = useNavigation<any>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();

    const pulse = () => {
      pulseAnim.setValue(0);
      Animated.timing(pulseAnim, { toValue: 1, duration: 1800, useNativeDriver: true }).start(() => pulse());
    };
    pulse();

    const t = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <View style={styles.decorLayer}>
        <View style={[styles.bubble, styles.bubbleOne]} />
        <View style={[styles.bubble, styles.bubbleTwo]} />
        <View style={[styles.bubble, styles.bubbleThree]} />
      </View>
      <Animated.View style={[styles.container, { opacity: fadeAnim }] }>
        <Animated.View style={[styles.logoWrap, { transform: [{ scale: scaleAnim }] }]}>
          <Animated.View
            style={[
              styles.pulse,
              {
                transform: [
                  { scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] }) },
                ],
                opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] }),
              },
            ]}
          />
          <View style={styles.logoCircle}>
            <Text style={styles.logoInitials}>SV</Text>
          </View>
        </Animated.View>
        <Text style={styles.brand}>Svitsai Vanhu</Text>
        <Text style={styles.tagline}>Compare rides. Save more.</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  decorLayer: { position: 'absolute', inset: 0 },
  bubble: { position: 'absolute', backgroundColor: '#DBEAFE', borderRadius: 9999 },
  bubbleOne: { width: 220, height: 220, top: -40, right: -40, opacity: 0.6 },
  bubbleTwo: { width: 140, height: 140, bottom: 60, left: -30, opacity: 0.5 },
  bubbleThree: { width: 100, height: 100, top: 140, left: 40, opacity: 0.4 },
  logoWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  pulse: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.primary,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 10,
  },
  logoInitials: { color: '#fff', fontSize: 40, fontWeight: '800', letterSpacing: 2 },
  brand: { fontSize: 22, fontWeight: '800', color: theme.colors.text, letterSpacing: 0.5, marginTop: 6 },
  tagline: { marginTop: 6, color: theme.colors.muted, fontSize: 16, fontWeight: '500' },
});


