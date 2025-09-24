import React, { useRef, useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  Pressable, 
  TextInput, 
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';

const { width: screenWidth } = Dimensions.get('window');
const DEMO_EMAIL = 'demo@svitsai.app';
const DEMO_PASSWORD = '123456';

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { 
        toValue: 1, 
        duration: 800, 
        useNativeDriver: true 
      }),
      Animated.timing(slideAnim, { 
        toValue: 0, 
        duration: 800, 
        useNativeDriver: true 
      }),
      Animated.timing(scaleAnim, { 
        toValue: 1, 
        duration: 800, 
        useNativeDriver: true 
      }),
    ]).start();
  }, []);

  const runShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 2, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 3, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 4, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    const isDemo = email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD;
    setTimeout(() => {
      if (isDemo) {
        setIsLoading(false);
        navigation.replace('Main');
      } else {
        setIsLoading(false);
        setError('Invalid demo credentials');
        runShake();
      }
    }, 800);
  };

  const animatePress = (callback: () => void) => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(callback);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View 
          style={[
            styles.container, 
            { 
              opacity: fadeAnim, 
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ] 
            }
          ]}
        > 
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>✨</Text>
              </View>
            </View>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to your account to continue</Text>
          </View>

          {/* Demo Banner */}
          <View style={styles.demoBanner}>
            <Text style={styles.demoText}>Demo: {DEMO_EMAIL} • {DEMO_PASSWORD}</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            <Animated.View 
              style={[
                styles.card,
                {
                  transform: [{
                    translateX: shakeAnim.interpolate({
                      inputRange: [0, 1, 2, 3, 4],
                      outputRange: [0, -8, 8, -6, 0],
                    })
                  }]
                }
              ]}
            >
              {/* Email Input */}
              <View style={[
                styles.inputContainer,
                emailFocused && styles.inputContainerFocused
              ]}>
                <View style={styles.inputHeader}>
                  <Text style={styles.inputLabel}>Email</Text>
                </View>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor={theme.colors.muted}
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                />
              </View>

              {/* Password Input */}
              <View style={[
                styles.inputContainer,
                passwordFocused && styles.inputContainerFocused,
                styles.passwordContainer
              ]}>
                <View style={styles.inputHeader}>
                  <Text style={styles.inputLabel}>Password</Text>
                </View>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor={theme.colors.muted}
                  style={styles.input}
                  secureTextEntry
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
              </View>

              {/* Forgot Password Link */}
              <Pressable style={styles.forgotPasswordContainer}>
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </Pressable>
              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
            </Animated.View>

            {/* Login Button */}
            <Pressable 
              style={[
                styles.cta, 
                (!email || !password) && styles.ctaDisabled,
                isLoading && styles.ctaLoading
              ]} 
              onPress={() => animatePress(handleLogin)}
              disabled={!email || !password || isLoading}
            >
              <Text style={[
                styles.ctaText,
                (!email || !password) && styles.ctaTextDisabled
              ]}>
                {isLoading ? 'Signing in...' : 'Continue'}
              </Text>
            </Pressable>

            {/* Sign Up Link */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <Pressable>
                <Text style={styles.signupLink}>Sign up</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: theme.colors.background 
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: { 
    flex: 1, 
    paddingHorizontal: 24,
  },
  header: { 
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 32,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 28,
  },
  title: { 
    fontSize: 36, 
    fontWeight: '800', 
    color: theme.colors.text, 
    marginBottom: 8, 
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  subtitle: { 
    fontSize: 17, 
    color: theme.colors.muted,
    textAlign: 'center',
    lineHeight: 24,
  },
  formContainer: {
    flex: 1,
  },
  card: { 
    backgroundColor: theme.colors.card, 
    borderRadius: 20, 
    padding: 24,
    borderWidth: StyleSheet.hairlineWidth, 
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputContainer: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: theme.colors.background,
  },
  inputContainerFocused: {
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  passwordContainer: {
    marginTop: 20,
  },
  inputHeader: {
    paddingTop: 8,
    paddingBottom: 2,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  input: { 
    fontSize: 17, 
    color: theme.colors.text,
    paddingBottom: 12,
    fontWeight: '500',
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: 20,
  },
  forgotPasswordText: {
    fontSize: 15,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  cta: { 
    backgroundColor: theme.colors.primary, 
    paddingVertical: 20, 
    borderRadius: 16, 
    alignItems: 'center', 
    marginTop: 32,
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaDisabled: {
    backgroundColor: theme.colors.muted,
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaLoading: {
    backgroundColor: theme.colors.primary,
    opacity: 0.8,
  },
  ctaText: { 
    color: '#fff', 
    fontWeight: '700', 
    fontSize: 18, 
    letterSpacing: 0.5 
  },
  ctaTextDisabled: {
    color: '#fff',
    opacity: 0.7,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    paddingBottom: 32,
  },
  signupText: {
    fontSize: 16,
    color: theme.colors.muted,
  },
  signupLink: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  demoBanner: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  demoText: {
    color: '#3730A3',
    fontWeight: '600',
  },
  errorContainer: {
    marginTop: 12,
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  errorText: {
    color: '#B91C1C',
    fontWeight: '600',
  },
});