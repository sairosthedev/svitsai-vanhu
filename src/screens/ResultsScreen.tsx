import React, { useRef } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, SafeAreaView, StatusBar, Animated } from 'react-native';
import { theme } from '../theme';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

type Result = { id: string; provider: string; priceUsd: number; etaMin: number; service: string };

const MOCK_RESULTS: Result[] = [
  { id: 'uber', provider: 'Uber', priceUsd: 5.5, etaMin: 5, service: 'Standard' },
  { id: 'bolt', provider: 'Bolt', priceUsd: 4.8, etaMin: 4, service: 'Bolt' },
  { id: 'indrive', provider: 'inDrive', priceUsd: 6.2, etaMin: 6, service: 'Standard' },
  { id: 'tapgo', provider: 'Tap&Go', priceUsd: 5.9, etaMin: 5, service: 'Standard' },
];

export default function ResultsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<Record<string, any>, string>>();
  const params: any = route.params ?? {};
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

        <FlatList
          data={MOCK_RESULTS}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Pressable onPress={() => onSelect(item)} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.name}>{item.provider}</Text>
                <Text style={styles.price}>${item.priceUsd.toFixed(2)}</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.muted}>{item.service}</Text>
                <View style={styles.dot} />
                <Text style={styles.muted}>{item.etaMin} min</Text>
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


