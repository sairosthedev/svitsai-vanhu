import React from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView, StatusBar, Linking, Alert } from 'react-native';
import { theme } from '../theme';
import { useRoute } from '@react-navigation/native';

export default function ProviderDetailsScreen() {
  const route = useRoute<any>();
  const { item, coords } = route.params as any ?? {};

  function openProviderApp() {
    const provider = (item?.provider ?? '').toLowerCase();
    const p = coords?.pickup;
    const d = coords?.dropoff;
    const pLat = p?.latitude ?? p?.lat;
    const pLon = p?.longitude ?? p?.lon;
    const dLat = d?.latitude ?? d?.lat;
    const dLon = d?.longitude ?? d?.lon;
    let url: string | null = null;
    if (provider.includes('uber')) {
      // Uber deeplink with coords if available
      url = pLat && pLon && dLat && dLon
        ? `uber://?action=setPickup&pickup[latitude]=${pLat}&pickup[longitude]=${pLon}&dropoff[latitude]=${dLat}&dropoff[longitude]=${dLon}`
        : `uber://?action=setPickup&pickup=my_location`;
    } else if (provider.includes('bolt')) {
      // Bolt deeplink (coords support varies; try generic)
      url = pLat && pLon && dLat && dLon
        ? `bolt://ride?pickup_latitude=${pLat}&pickup_longitude=${pLon}&destination_latitude=${dLat}&destination_longitude=${dLon}`
        : `bolt://ride`;
    } else if (provider.includes('indrive')) {
      url = `indrive://`;
    } else if (provider.includes('tap')) {
      url = null; // placeholder if no known scheme
    }
    if (!url) {
      Alert.alert('Open Provider', 'Provider app link not configured.');
      return;
    }
    Linking.canOpenURL(url).then((supported) => {
      if (supported) Linking.openURL(url);
      else Alert.alert('Open Provider', 'Provider app not installed.');
    });
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


