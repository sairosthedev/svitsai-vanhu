import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Pressable, 
  Animated,
  Dimensions,
  StatusBar,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { theme } from '../theme';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [pickup, setPickup] = useState('Current location');
  const [dropoff, setDropoff] = useState('');
  const [pickupPreds, setPickupPreds] = useState<any[]>([]);
  const [dropoffPreds, setDropoffPreds] = useState<any[]>([]);
  const [focusedInput, setFocusedInput] = useState<'pickup' | 'dropoff' | null>(null);
  const navigation = useNavigation<any>();
  const [coords, setCoords] = useState<{ pickup?: Location.LocationObjectCoords; dropoff?: { lat: number; lon: number } }>({});
  const [locPermission, setLocPermission] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pickupRef = useRef<TextInput>(null);
  const dropoffRef = useRef<TextInput>(null);
  
  React.useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  React.useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocPermission(status as any);
      if (status === 'granted') {
        const current = await Location.getCurrentPositionAsync({});
        setCoords((c) => ({ ...c, pickup: current.coords }));
        setPickup('Current location');
      }
    })();
  }, []);

  function onSearch() {
    Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }).start(() => {
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }).start();
      navigation.navigate('Results' as never, { pickup, dropoff, coords } as never);
    });
  }

  const handleInputFocus = (inputName: 'pickup' | 'dropoff') => {
    setFocusedInput(inputName);
  };

  const handleInputBlur = () => {
    setFocusedInput(null);
  };

  function onSwap() {
    setPickup((prevPickup) => {
      const newPickup = dropoff || prevPickup;
      setDropoff(prevPickup === 'Current location' ? '' : prevPickup);
      return newPickup || 'Current location';
    });
  }

  function quickSet(from: string, to: string) {
    setPickup(from || pickup);
    setDropoff(to);
    setFocusedInput(null);
    if (to && to.trim()) {
      onSearch();
    }
  }

  const GEOAPIFY_KEY = (Constants.expoConfig as any)?.extra?.geoapifyApiKey;
  async function fetchPlaces(query: string) {
    if (!GEOAPIFY_KEY || !query || query.length < 2) return [] as any[];
    try {
      const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&apiKey=${GEOAPIFY_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      return data?.features ?? [];
    } catch {
      return [];
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Good morning!</Text>
          <Text style={styles.title}>Svitsai Vanhu</Text>
          <Text style={styles.subtitle}>Where are you going today?</Text>
        </View>

        {/* Input Card */}
        <View style={styles.inputCard}>
            <View style={styles.inputContainer}>
            <Pressable
              onPress={() => pickupRef.current?.focus()}
              style={[styles.inputRow, focusedInput === 'pickup' && styles.inputRowFocused]}
            >
              <View style={styles.iconContainer}>
                <Ionicons 
                  name="navigate" 
                  size={18} 
                  color={focusedInput === 'pickup' ? theme.colors.primary : theme.colors.muted} 
                />
              </View>
              <TextInput
                ref={pickupRef}
                value={pickup}
                onChangeText={async (text) => {
                  setPickup(text);
                  setPickupPreds(await fetchPlaces(text));
                }}
                onFocus={() => handleInputFocus('pickup')}
                onBlur={handleInputBlur}
                style={[styles.input, focusedInput === 'pickup' && styles.inputFocused]}
                placeholder="Pickup location"
                placeholderTextColor={theme.colors.muted}
              />
              <Pressable onPress={async () => {
                try {
                  const perm = await Location.requestForegroundPermissionsAsync();
                  if (perm.status === 'granted') {
                    const current = await Location.getCurrentPositionAsync({});
                    setCoords((c) => ({ ...c, pickup: current.coords }));
                    setPickup('Current location');
                  }
                } catch {}
              }}>
                <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>Use current</Text>
              </Pressable>
            </Pressable>
            
            <View style={styles.divider}>
              <View style={styles.connectionLine} />
              <Pressable style={styles.swapButton} onPress={onSwap}>
                <Ionicons name="swap-vertical" size={16} color={theme.colors.muted} />
              </Pressable>
            </View>
            
            <Pressable
              onPress={() => dropoffRef.current?.focus()}
              style={[styles.inputRow, focusedInput === 'dropoff' && styles.inputRowFocused]}
            >
              <View style={styles.iconContainer}>
                <Ionicons 
                  name="location" 
                  size={18} 
                  color={focusedInput === 'dropoff' ? theme.colors.primary : theme.colors.muted} 
                />
              </View>
              <TextInput
                ref={dropoffRef}
                value={dropoff}
                onChangeText={async (text) => {
                  setDropoff(text);
                  setDropoffPreds(await fetchPlaces(text));
                }}
                onFocus={() => handleInputFocus('dropoff')}
                onBlur={handleInputBlur}
                style={[styles.input, focusedInput === 'dropoff' && styles.inputFocused]}
                placeholder="Where to?"
                placeholderTextColor={theme.colors.muted}
              />
              {dropoff.length > 0 && (
                <Pressable onPress={() => setDropoff('')}>
                  <Ionicons name="close-circle" size={18} color={theme.colors.muted} />
                </Pressable>
              )}
            </Pressable>
            {/* Autocomplete lists */}
            {focusedInput === 'pickup' && !!pickup && pickupPreds.length > 0 && (
              <View style={styles.suggestionsCard}>
                {pickupPreds.map((f: any) => (
                  <Pressable key={f.properties.place_id} style={styles.suggestionRow} onPress={async () => {
                    const description = f.properties.formatted || f.properties.address_line1 || f.properties.name;
                    setPickup(description);
                    setPickupPreds([]);
                    const coords = f.geometry?.coordinates;
                    if (coords && coords.length >= 2) {
                      const [lon, lat] = coords;
                      setCoords((c) => ({ ...c, pickup: { latitude: lat, longitude: lon } as any }));
                    }
                  }}>
                    <Ionicons name="location-outline" size={16} color={theme.colors.primary} style={{ marginRight: 8 }} />
                    <Text style={styles.suggestionText} numberOfLines={1}>{f.properties.formatted}</Text>
                  </Pressable>
                ))}
              </View>
            )}
            {focusedInput === 'dropoff' && !!dropoff && dropoffPreds.length > 0 && (
              <View style={styles.suggestionsCard}>
                {dropoffPreds.map((f: any) => (
                  <Pressable key={f.properties.place_id} style={styles.suggestionRow} onPress={async () => {
                    const description = f.properties.formatted || f.properties.address_line1 || f.properties.name;
                    setDropoff(description);
                    setDropoffPreds([]);
                    const coords = f.geometry?.coordinates;
                    if (coords && coords.length >= 2) {
                      const [lon, lat] = coords;
                      setCoords((c) => ({ ...c, dropoff: { lat, lon } }));
                    }
                  }}>
                    <Ionicons name="location-outline" size={16} color={theme.colors.primary} style={{ marginRight: 8 }} />
                    <Text style={styles.suggestionText} numberOfLines={1}>{f.properties.formatted}</Text>
                  </Pressable>
                ))}
              </View>
            )}
            
          </View>
        </View>

        {/* Map Preview */}
        <View style={styles.mapContainer}>
          <View style={styles.mapMock}>
            <View style={styles.mapOverlay}>
              <Text style={styles.mapText}>Interactive Map Preview</Text>
              <Ionicons name="map" size={48} color="rgba(255,255,255,0.7)" />
            </View>
          </View>
        </View>

        

        {/* Search Button */}
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Pressable 
            onPress={onSearch} 
            style={[
              styles.cta,
              (!dropoff.trim()) && styles.ctaDisabled
            ]}
            disabled={!dropoff.trim()}
          >
            <View style={styles.ctaContent}>
              <Ionicons name="search" size={20} color="#fff" style={styles.ctaIcon} />
              <Text style={styles.ctaText}>Find Rides</Text>
            </View>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 32,
  },
  greeting: {
    fontSize: 16,
    color: theme.colors.muted,
    marginBottom: 4,
    fontWeight: '500',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    color: theme.colors.muted,
    fontWeight: '400',
  },
  inputCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 24,
    padding: 4,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  inputContainer: {
    padding: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(248, 250, 252, 0.8)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputRowFocused: {
    backgroundColor: '#fff',
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  inputFocused: {
    color: theme.colors.text,
  },
  divider: {
    alignItems: 'center',
    marginVertical: 8,
    position: 'relative',
  },
  connectionLine: {
    width: 2,
    height: 20,
    backgroundColor: theme.colors.border,
    position: 'absolute',
  },
  swapButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  mapContainer: {
    flex: 1,
    marginBottom: 24,
  },
  mapMock: {
    flex: 1,
    backgroundColor: '#e0f2fe',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  mapOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
    borderRadius: 16,
    padding: 24,
  },
  mapText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  quickActions: {
    marginBottom: 24,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    marginTop: 8,
  },
  cta: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaDisabled: {
    backgroundColor: theme.colors.muted,
    shadowOpacity: 0.1,
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaIcon: {
    marginRight: 8,
  },
  ctaText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  suggestionsCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    marginTop: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  suggestionText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '500',
  },
});