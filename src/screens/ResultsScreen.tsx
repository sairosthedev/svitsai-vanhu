import React, { useRef, useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, SafeAreaView, StatusBar, Animated, ActivityIndicator } from 'react-native';
import { theme } from '../theme';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Constants from 'expo-constants';

type Result = { id: string; provider: string; priceUsd: number; etaMin: number; service: string };

const PROVIDERS: Array<{ id: string; provider: string; service: string }> = [
  { id: 'uber', provider: 'Uber', service: 'Standard' },
  { id: 'bolt', provider: 'Bolt', service: 'Bolt' },
  { id: 'indrive', provider: 'inDrive', service: 'Standard' },
  { id: 'tapgo', provider: 'Tap&Go', service: 'Standard' },
];

export default function ResultsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<Record<string, any>, string>>();
  const params: any = route.params ?? {};
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<Result[]>([]);
  const [travelMin, setTravelMin] = useState<number | null>(null);

  function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function fallbackEstimates(): Result[] {
    const p = params?.coords?.pickup;
    const d = params?.coords?.dropoff;
    const pLat = p?.latitude ?? p?.lat;
    const pLon = p?.longitude ?? p?.lon;
    const dLat = d?.latitude ?? d?.lat;
    const dLon = d?.longitude ?? d?.lon;
    if (![pLat, pLon, dLat, dLon].every(Boolean)) {
      return PROVIDERS.map(pr => ({ id: pr.id, provider: pr.provider, service: pr.service, priceUsd: NaN, etaMin: NaN }));
    }
    const km = haversineKm(pLat, pLon, dLat, dLon);
    const base: Record<string, { start: number; perKm: number; minEta: number }> = {
      uber: { start: 1.0, perKm: 0.5, minEta: 4 },
      bolt: { start: 0.9, perKm: 0.45, minEta: 4 },
      indrive: { start: 1.1, perKm: 0.48, minEta: 5 },
      tapgo: { start: 0.95, perKm: 0.46, minEta: 5 },
    };
    return PROVIDERS.map(pr => {
      const b = base[pr.id] || base.uber;
      const price = b.start + b.perKm * km;
      const eta = Math.max(b.minEta, Math.round((travelMin ?? 0))); // travel time if available
      return { id: pr.id, provider: pr.provider, service: pr.service, priceUsd: Math.max(1, price), etaMin: eta };
    });
  }
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const apiBase = (Constants.expoConfig as any)?.extra?.apiBaseUrl;
    const p = params?.coords?.pickup;
    const d = params?.coords?.dropoff;
    if (!apiBase || !p || !d) {
      setRows(fallbackEstimates());
      return;
    }
    const pLat = p?.latitude ?? p?.lat;
    const pLon = p?.longitude ?? p?.lon;
    const dLat = d?.latitude ?? d?.lat;
    const dLon = d?.longitude ?? d?.lon;
    if (![pLat, pLon, dLat, dLon].every(Boolean)) {
      setRows(PROVIDERS.map(pr => ({ id: pr.id, provider: pr.provider, service: pr.service, priceUsd: NaN, etaMin: NaN })));
      return;
    }
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await fetch(`${apiBase}/estimates`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pickup: { lat: pLat, lon: pLon }, dropoff: { lat: dLat, lon: dLon }, providers: PROVIDERS.map(p => p.id) }),
        });
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        const out: Result[] = PROVIDERS.map(pr => {
          const r = data?.prices?.[pr.id];
          return {
            id: pr.id,
            provider: pr.provider,
            service: pr.service,
            priceUsd: typeof r?.priceUsd === 'number' ? r.priceUsd : NaN,
            etaMin: typeof r?.etaMin === 'number' ? r.etaMin : NaN,
          };
        });
        setRows(out);
      } catch (e) {
        setError('Unable to fetch live prices');
        setRows(fallbackEstimates());
      } finally {
        setLoading(false);
      }
    })();
  }, [params?.coords]);

  // Compute travel duration via Geoapify routing for better ETA when live provider ETAs unavailable
  useEffect(() => {
    const key = (Constants.expoConfig as any)?.extra?.geoapifyApiKey;
    const p = params?.coords?.pickup;
    const d = params?.coords?.dropoff;
    const pLat = p?.latitude ?? p?.lat;
    const pLon = p?.longitude ?? p?.lon;
    const dLat = d?.latitude ?? d?.lat;
    const dLon = d?.longitude ?? d?.lon;
    if (!key || ![pLat, pLon, dLat, dLon].every(Boolean)) {
      setTravelMin(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const url = `https://api.geoapify.com/v1/routing?waypoints=${pLat},${pLon}|${dLat},${dLon}&mode=drive&apiKey=${key}`;
        const res = await fetch(url);
        const data = await res.json();
        const seconds = data?.features?.[0]?.properties?.time;
        if (!cancelled && typeof seconds === 'number') {
          setTravelMin(Math.ceil(seconds / 60));
        }
      } catch {
        if (!cancelled) setTravelMin(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params?.coords]);

  function onSelect(item: Result) {
    navigation.navigate('ProviderDetails' as never, { item, pickup: params?.pickup, dropoff: params?.dropoff, coords: params?.coords } as never);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Results</Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {(params?.pickup ?? 'Pickup') + ' → ' + (params?.dropoff ?? 'Destination')}
          </Text>
        </View>

        {error && (
          <Text style={[styles.muted, { marginBottom: 8 }]}>{error}</Text>
        )}
        {loading && (
          <View style={{ paddingVertical: 8 }}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        )}
        <FlatList
          data={rows.length ? rows : PROVIDERS.map(pr => ({ id: pr.id, provider: pr.provider, priceUsd: NaN, etaMin: NaN, service: pr.service }))}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Pressable onPress={() => onSelect(item)} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.name}>{item.provider}</Text>
                {Number.isFinite(item.priceUsd) ? (
                  <Text style={styles.price}>${item.priceUsd.toFixed(2)}</Text>
                ) : (
                  <Text style={styles.muted}>Price unavailable</Text>
                )}
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.muted}>{item.service}</Text>
                <View style={styles.dot} />
                {Number.isFinite(item.etaMin) ? (
                  <Text style={styles.muted}>{item.etaMin} min</Text>
                ) : (
                  <Text style={styles.muted}>ETA unknown</Text>
                )}
              </View>
            </Pressable>
          )}
        />
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
    paddingTop: 20,
  },
  header: {
    paddingBottom: 12,
  },
  title: { fontSize: 32, fontWeight: '800', color: theme.colors.text, marginBottom: 4, letterSpacing: -0.5 },
  subtitle: { fontSize: 16, color: theme.colors.muted, fontWeight: '400' },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    marginHorizontal: 8,
  },
  name: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
  muted: { color: theme.colors.muted },
  price: { fontWeight: '800', color: theme.colors.text, fontSize: 18 },
});


