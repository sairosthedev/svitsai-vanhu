import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  SafeAreaView,
  StatusBar,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface MenuItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  type: 'navigation' | 'toggle' | 'action';
  value?: boolean;
  onPress?: () => void;
  destructive?: boolean;
}

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(true);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            // Reset entire navigation state to Splash at the root level
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Splash' }],
              })
            );
          },
        },
      ]
    );
  };

  const menuSections: MenuSection[] = [
    {
      title: 'Account',
      items: [
        {
          id: 'edit-profile',
          title: 'Edit Profile',
          subtitle: 'Update your personal information',
          icon: 'person-outline',
          type: 'navigation',
        },
        {
          id: 'payment-methods',
          title: 'Payment Methods',
          subtitle: 'Manage cards and payment options',
          icon: 'card-outline',
          type: 'navigation',
        },
        {
          id: 'ride-preferences',
          title: 'Ride Preferences',
          subtitle: 'Set default pickup locations',
          icon: 'car-outline',
          type: 'navigation',
        },
      ],
    },
    {
      title: 'Notifications & Privacy',
      items: [
        {
          id: 'notifications',
          title: 'Push Notifications',
          subtitle: 'Ride updates and promotions',
          icon: 'notifications-outline',
          type: 'toggle',
          value: notificationsEnabled,
          onPress: () => setNotificationsEnabled(!notificationsEnabled),
        },
        {
          id: 'location',
          title: 'Location Services',
          subtitle: 'Allow location access for rides',
          icon: 'location-outline',
          type: 'toggle',
          value: locationEnabled,
          onPress: () => setLocationEnabled(!locationEnabled),
        },
        {
          id: 'privacy',
          title: 'Privacy Settings',
          subtitle: 'Data sharing and privacy controls',
          icon: 'shield-outline',
          type: 'navigation',
        },
      ],
    },
    {
      title: 'App Settings',
      items: [
        {
          id: 'dark-mode',
          title: 'Dark Mode',
          subtitle: 'Switch to dark theme',
          icon: 'moon-outline',
          type: 'toggle',
          value: darkModeEnabled,
          onPress: () => setDarkModeEnabled(!darkModeEnabled),
        },
        {
          id: 'language',
          title: 'Language',
          subtitle: 'English',
          icon: 'language-outline',
          type: 'navigation',
        },
        {
          id: 'accessibility',
          title: 'Accessibility',
          subtitle: 'Voice and display options',
          icon: 'accessibility-outline',
          type: 'navigation',
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 'help',
          title: 'Help Center',
          subtitle: 'FAQs and support articles',
          icon: 'help-circle-outline',
          type: 'navigation',
        },
        {
          id: 'contact',
          title: 'Contact Support',
          subtitle: 'Get help with your account',
          icon: 'chatbubble-outline',
          type: 'navigation',
        },
        {
          id: 'feedback',
          title: 'Send Feedback',
          subtitle: 'Help us improve the app',
          icon: 'thumbs-up-outline',
          type: 'navigation',
        },
        {
          id: 'about',
          title: 'About',
          subtitle: 'App version and legal info',
          icon: 'information-circle-outline',
          type: 'navigation',
        },
      ],
    },
    {
      title: 'Account Actions',
      items: [
        {
          id: 'logout',
          title: 'Sign Out',
          icon: 'log-out-outline',
          type: 'action',
          destructive: true,
          onPress: handleLogout,
        },
      ],
    },
  ];

  const MenuItem = ({ item }: { item: MenuItem }) => (
    <Pressable
      style={({ pressed }) => [
        styles.menuItem,
        pressed && styles.menuItemPressed,
        item.destructive && styles.destructiveItem,
      ]}
      onPress={item.onPress}
    >
      <View style={styles.menuItemContent}>
        <View style={[
          styles.iconContainer,
          item.destructive && styles.destructiveIconContainer
        ]}>
          <Ionicons
            name={item.icon as any}
            size={20}
            color={item.destructive ? '#ef4444' : theme.colors.primary}
          />
        </View>
        <View style={styles.menuItemText}>
          <Text style={[
            styles.menuItemTitle,
            item.destructive && styles.destructiveText
          ]}>
            {item.title}
          </Text>
          {item.subtitle && (
            <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
          )}
        </View>
        <View style={styles.menuItemAction}>
          {item.type === 'toggle' ? (
            <Switch
              value={item.value}
              onValueChange={item.onPress}
              trackColor={{ false: '#e5e7eb', true: theme.colors.primary }}
              thumbColor="#fff"
            />
          ) : item.type === 'navigation' ? (
            <Ionicons
              name="chevron-forward"
              size={16}
              color={theme.colors.muted}
            />
          ) : null}
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <Animated.View
          style={[
            styles.profileHeader,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>TM</Text>
            </View>
            <Pressable style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color="#fff" />
            </Pressable>
          </View>
          <Text style={styles.userName}>Tendai Mukamuri</Text>
          <Text style={styles.userEmail}>tendai.mukamuri@email.com</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>127</Text>
              <Text style={styles.statLabel}>Total Rides</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>4.9</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>$1,240</Text>
              <Text style={styles.statLabel}>Saved</Text>
            </View>
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View
          style={[
            styles.quickActions,
            { opacity: fadeAnim },
          ]}
        >
          <Pressable style={styles.quickActionButton}>
            <Ionicons name="wallet-outline" size={24} color={theme.colors.primary} />
            <Text style={styles.quickActionText}>Wallet</Text>
          </Pressable>
          <Pressable style={styles.quickActionButton}>
            <Ionicons name="gift-outline" size={24} color={theme.colors.primary} />
            <Text style={styles.quickActionText}>Rewards</Text>
          </Pressable>
          <Pressable style={styles.quickActionButton}>
            <Ionicons name="share-outline" size={24} color={theme.colors.primary} />
            <Text style={styles.quickActionText}>Refer</Text>
          </Pressable>
        </Animated.View>

        {/* Menu Sections */}
        <Animated.View
          style={[
            styles.menuContainer,
            { opacity: fadeAnim },
          ]}
        >
          {menuSections.map((section) => (
            <View key={section.title} style={styles.menuSection}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.sectionContent}>
                {section.items.map((item) => (
                  <MenuItem key={item.id} item={item} />
                ))}
              </View>
            </View>
          ))}
        </Animated.View>

        {/* App Version */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>Svitsai Vanhu v2.1.0</Text>
          <Text style={styles.copyrightText}>© 2025 Svitsai Technologies</Text>
        </View>
      </ScrollView>
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
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.background,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: theme.colors.muted,
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: theme.colors.muted,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: theme.colors.border,
    marginHorizontal: 16,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
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
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 8,
  },
  menuContainer: {
    paddingHorizontal: 20,
  },
  menuSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  sectionContent: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    backgroundColor: theme.colors.card,
  },
  menuItemPressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  destructiveItem: {
    backgroundColor: theme.colors.card,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  destructiveIconContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  destructiveText: {
    color: '#ef4444',
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: theme.colors.muted,
    lineHeight: 20,
  },
  menuItemAction: {
    marginLeft: 12,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  versionText: {
    fontSize: 14,
    color: theme.colors.muted,
    fontWeight: '500',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: theme.colors.muted,
  },
});