import React from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView, StatusBar, Linking, Alert, Platform } from 'react-native';
import { theme } from '../theme';
import { useRoute } from '@react-navigation/native';

export default function ProviderDetailsScreen() {
  const route = useRoute<any>();
  const { item, coords } = route.params as any ?? {};

  async function openProviderApp() {
    const provider = (item?.provider ?? '').toLowerCase();
    const p = coords?.pickup;
    const d = coords?.dropoff;
    const pLat = p?.latitude ?? p?.lat;
    const pLon = p?.longitude ?? p?.lon;
    const dLat = d?.latitude ?? d?.lat;
    const dLon = d?.longitude ?? d?.lon;

    // Build scheme URLs first (works in custom dev/prod builds), then universal web fallbacks
    let schemeUrl: string | null = null;
    let webUrl: string | null = null;

    if (provider.includes('uber')) {
      schemeUrl = pLat && pLon && dLat && dLon
        ? `uber://?action=setPickup&pickup[latitude]=${pLat}&pickup[longitude]=${pLon}&dropoff[latitude]=${dLat}&dropoff[longitude]=${dLon}`
        : `uber://?action=setPickup&pickup=my_location`;
      webUrl = pLat && pLon && dLat && dLon
        ? `https://m.uber.com/ul/?action=setPickup&pickup[latitude]=${pLat}&pickup[longitude]=${pLon}&dropoff[latitude]=${dLat}&dropoff[longitude]=${dLon}`
        : `https://m.uber.com/ul/?action=setPickup&pickup=my_location`;
    } else if (provider.includes('bolt')) {
      schemeUrl = pLat && pLon && dLat && dLon
        ? `bolt://ride?pickup_latitude=${pLat}&pickup_longitude=${pLon}&destination_latitude=${dLat}&destination_longitude=${dLon}`
        : `bolt://ride`;
      // taxify legacy
      if (!schemeUrl) schemeUrl = 'taxify://';
      webUrl = 'https://bolt.eu';
    } else if (provider.includes('indrive')) {
      schemeUrl = 'indrive://';
      if (!schemeUrl) schemeUrl = 'indriver://';
      webUrl = 'https://indrive.com';
    } else if (provider.includes('tap')) {
      webUrl = 'https://tapgo.rw';
    }

    const tryOpen = async (target?: string | null) => {
      if (!target) return false;
      try {
        const supported = await Linking.canOpenURL(target);
        if (supported) {
          await Linking.openURL(target);
          return true;
        }
      } catch {}
      return false;
    };

    // In Expo Go, schemes won’t be allowed; this will likely fail and fall back to web
    const openedScheme = await tryOpen(schemeUrl);
    if (!openedScheme) {
      const openedWeb = await tryOpen(webUrl);
      if (!openedWeb) Alert.alert('Open Provider', 'Unable to open the provider link.');
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{item?.provider ?? 'Provider'}</Text>
          <Text style={styles.price}>${item?.priceUsd?.toFixed?.(2) ?? '--'}</Text>
          <Text style={styles.muted}>Estimate • {item?.etaMin ?? '--'} min</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Ride details</Text>
          <View style={styles.rowBetween}> 
            <Text style={styles.label}>Service</Text>
            <Text style={styles.value}>{item?.service ?? 'Standard'}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.rowBetween}> 
            <Text style={styles.label}>ETA</Text>
            <Text style={styles.value}>{item?.etaMin ?? '--'} min</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Payment</Text>
          <View style={styles.rowBetween}>
            <Text style={styles.value}>Cash</Text>
            <Text style={styles.change}>Change</Text>
          </View>
        </View>

        <Pressable style={styles.cta} onPress={openProviderApp}>
          <View style={styles.ctaContent}>
            <Text style={styles.ctaText}>Open Provider App</Text>
          </View>
        </Pressable>
      </View>
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
    marginBottom: 16,
  },
  title: { fontSize: 32, fontWeight: '800', marginBottom: 6, color: theme.colors.text, letterSpacing: -0.5 },
  price: { fontSize: 28, fontWeight: '800', color: theme.colors.text, marginBottom: 4 },
  muted: { color: theme.colors.muted },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.muted,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    color: theme.colors.muted,
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '600',
  },
  change: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 12,
  },
  cta: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 'auto',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: 18, letterSpacing: 0.5 },
});


