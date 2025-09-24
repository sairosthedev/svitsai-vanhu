import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, Pressable, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';

export default function OnboardingScreen() {
  const navigation = useNavigation<any>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const heroScale = useRef(new Animated.Value(0.98)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }).start();
    Animated.spring(heroScale, { toValue: 1, useNativeDriver: true }).start();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <View style={styles.decorLayer}>
        <View style={[styles.ring, styles.ringOne]} />
        <View style={[styles.ring, styles.ringTwo]} />
        <View style={[styles.ring, styles.ringThree]} />
      </View>
      <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}> 
        <Animated.View style={[styles.hero, { transform: [{ scale: heroScale }] }]}> 
          <Text style={styles.kicker}>Ride Smarter</Text>
          <Text style={styles.title}>Compare rides across providers</Text>
          <Text style={styles.subtitle}>Cheapest, fastest, all in one place</Text>
        </Animated.View>

        <View style={styles.bullets}>
          <Text style={styles.bullet}>• Live prices from Uber, Bolt, inDrive, Tap&Go</Text>
          <Text style={styles.bullet}>• Book in-app or jump to provider</Text>
          <Text style={styles.bullet}>• Keep history, receipts, and payments</Text>
        </View>

        <Pressable style={styles.cta} onPress={() => navigation.replace('Login')}>
          <Text style={styles.ctaText}>Get Started</Text>
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  decorLayer: { position: 'absolute', inset: 0 },
  ring: { position: 'absolute', borderWidth: 24, borderColor: '#DBEAFE', borderRadius: 9999 },
  ringOne: { width: 280, height: 280, top: -80, right: -80, opacity: 0.4 },
  ringTwo: { width: 200, height: 200, bottom: -60, left: -60, opacity: 0.35 },
  ringThree: { width: 140, height: 140, top: 120, left: 20, opacity: 0.25 },
  hero: {
    marginTop: 40,
    marginBottom: 16,
    backgroundColor: theme.colors.card,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  kicker: { fontSize: 14, color: theme.colors.primary, fontWeight: '800', marginBottom: 8, letterSpacing: 1.5, textTransform: 'uppercase' },
  title: { fontSize: 32, fontWeight: '800', color: theme.colors.text, marginBottom: 8, letterSpacing: -0.5 },
  subtitle: { fontSize: 16, color: theme.colors.muted },
  bullets: { marginTop: 20, gap: 12 },
  bullet: { fontSize: 16, color: theme.colors.text },
  cta: { backgroundColor: theme.colors.primary, paddingVertical: 18, borderRadius: 20, alignItems: 'center', marginTop: 'auto', marginBottom: 20 },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: 18, letterSpacing: 0.5 },
});


