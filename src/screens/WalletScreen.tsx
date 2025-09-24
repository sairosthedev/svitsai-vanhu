import React, { useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, Pressable, FlatList, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

type Transaction = {
  id: string;
  title: string;
  subtitle: string;
  amountUsd: number;
  type: 'credit' | 'debit';
};

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', title: 'Ride - Bolt', subtitle: 'Yesterday • 6:30 PM', amountUsd: -6.5, type: 'debit' },
  { id: '2', title: 'Top Up', subtitle: 'Sep 20 • Visa **** 2048', amountUsd: 20, type: 'credit' },
  { id: '3', title: 'Ride - Uber', subtitle: 'Sep 18 • 8:12 AM', amountUsd: -4.2, type: 'debit' },
];

export default function WalletScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }).start();
  }, []);

  const balance = 32.4;

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.txnCard}>
      <View style={styles.txnLeft}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={item.type === 'credit' ? 'arrow-down-circle' : 'arrow-up-circle'}
            size={20}
            color={theme.colors.primary}
          />
        </View>
        <View>
          <Text style={styles.txnTitle}>{item.title}</Text>
          <Text style={styles.txnSubtitle}>{item.subtitle}</Text>
        </View>
      </View>
      <Text style={[
        styles.txnAmount,
        { color: item.type === 'credit' ? '#10b981' : theme.colors.text }
      ]}>
        {item.type === 'credit' ? '+' : ''}${Math.abs(item.amountUsd).toFixed(2)}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}> 
        <View style={styles.header}>
          <Text style={styles.title}>Wallet</Text>
          <Text style={styles.subtitle}>Manage your payments and balance</Text>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceValue}>${balance.toFixed(2)}</Text>
          <View style={styles.balanceActions}>
            <Pressable style={styles.actionBtn}>
              <Ionicons name="add-circle" size={18} color={theme.colors.primary} />
              <Text style={styles.actionText}>Top Up</Text>
            </Pressable>
            <Pressable style={styles.actionBtn}>
              <Ionicons name="card-outline" size={18} color={theme.colors.primary} />
              <Text style={styles.actionText}>Payment Methods</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <Pressable>
            <Text style={styles.sectionLink}>View All</Text>
          </Pressable>
        </View>

        <FlatList
          data={MOCK_TRANSACTIONS}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.listContent}
          renderItem={renderTransaction}
          showsVerticalScrollIndicator={false}
        />

        <Pressable style={styles.cta}>
          <Text style={styles.ctaText}>Add Funds</Text>
        </Pressable>
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
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.muted,
    fontWeight: '400',
  },
  balanceCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
    marginTop: 8,
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 14,
    color: theme.colors.muted,
    fontWeight: '600',
    marginBottom: 6,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 16,
  },
  balanceActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  actionText: {
    marginLeft: 8,
    color: theme.colors.text,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  sectionLink: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 20,
  },
  txnCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txnTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  txnSubtitle: {
    fontSize: 13,
    color: theme.colors.muted,
    marginTop: 2,
  },
  txnAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  cta: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.5,
  },
});


