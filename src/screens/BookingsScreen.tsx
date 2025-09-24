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
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

const { width } = Dimensions.get('window');

interface Booking {
  id: string;
  type: 'active' | 'completed' | 'cancelled';
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
  price: string;
  driver?: string;
  rating?: number;
  vehicleType: 'economy' | 'comfort' | 'premium';
}

const mockBookings: Booking[] = [
  {
    id: '1',
    type: 'active',
    pickup: 'Central Plaza Mall',
    dropoff: 'Harare International Airport',
    date: 'Today',
    time: '2:30 PM',
    price: '$15.50',
    driver: 'John Mhango',
    vehicleType: 'comfort',
  },
  {
    id: '2',
    type: 'completed',
    pickup: 'Home - Warren Park',
    dropoff: 'University of Zimbabwe',
    date: 'Yesterday',
    time: '8:15 AM',
    price: '$8.20',
    driver: 'Sarah Dube',
    rating: 5,
    vehicleType: 'economy',
  },
  {
    id: '3',
    type: 'completed',
    pickup: 'Avondale Shopping Center',
    dropoff: 'Sam Levy Village',
    date: 'Sep 22',
    time: '6:45 PM',
    price: '$12.30',
    driver: 'Mike Chivero',
    rating: 4,
    vehicleType: 'comfort',
  },
  {
    id: '4',
    type: 'cancelled',
    pickup: 'Eastgate Mall',
    dropoff: 'Borrowdale Brook',
    date: 'Sep 20',
    time: '4:20 PM',
    price: '$18.90',
    vehicleType: 'premium',
  },
];

export default function BookingsScreen() {
  const [selectedTab, setSelectedTab] = useState<'all' | 'active' | 'completed'>('all');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getStatusColor = (type: string) => {
    switch (type) {
      case 'active':
        return '#10b981';
      case 'completed':
        return '#3b82f6';
      case 'cancelled':
        return '#ef4444';
      default:
        return theme.colors.muted;
    }
  };

  const getVehicleIcon = (vehicleType: string) => {
    switch (vehicleType) {
      case 'economy':
        return 'car-outline';
      case 'comfort':
        return 'car';
      case 'premium':
        return 'car-sport';
      default:
        return 'car-outline';
    }
  };

  const filteredBookings = selectedTab === 'all' 
    ? mockBookings 
    : mockBookings.filter(booking => 
        selectedTab === 'active' ? booking.type === 'active' : booking.type === 'completed'
      );

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Ionicons
        key={i}
        name={i < rating ? 'star' : 'star-outline'}
        size={14}
        color="#fbbf24"
      />
    ));
  };

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <Pressable style={styles.bookingCard}>
      <View style={styles.cardHeader}>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(booking.type) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(booking.type) }]}>
            {booking.type.charAt(0).toUpperCase() + booking.type.slice(1)}
          </Text>
        </View>
        <View style={styles.vehicleInfo}>
          <Ionicons 
            name={getVehicleIcon(booking.vehicleType) as any} 
            size={20} 
            color={theme.colors.primary} 
          />
          <Text style={styles.priceText}>{booking.price}</Text>
        </View>
      </View>

      <View style={styles.routeContainer}>
        <View style={styles.routeInfo}>
          <View style={styles.routePoint}>
            <Ionicons name="navigate" size={16} color={theme.colors.primary} />
          </View>
          <Text style={styles.locationText} numberOfLines={1}>
            {booking.pickup}
          </Text>
        </View>
        
        <View style={styles.routeLine} />
        
        <View style={styles.routeInfo}>
          <View style={styles.routePoint}>
            <Ionicons name="location" size={16} color={theme.colors.primary} />
          </View>
          <Text style={styles.locationText} numberOfLines={1}>
            {booking.dropoff}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.dateTimeContainer}>
          <Ionicons name="calendar-outline" size={14} color={theme.colors.muted} />
          <Text style={styles.dateTimeText}>{booking.date} • {booking.time}</Text>
        </View>
        
        {booking.driver && (
          <View style={styles.driverInfo}>
            {booking.rating && (
              <View style={styles.ratingContainer}>
                {renderStars(booking.rating)}
              </View>
            )}
            <Text style={styles.driverName}>{booking.driver}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );

  const activeBookings = mockBookings.filter(b => b.type === 'active');
  const hasActiveBookings = activeBookings.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <View style={styles.container}>
        {/* Header */}
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.title}>My Bookings</Text>
          <Text style={styles.subtitle}>Track your rides and history</Text>
        </Animated.View>

        {/* Active Ride Alert */}
        {hasActiveBookings && (
          <Animated.View 
            style={[
              styles.activeRideAlert,
              { opacity: fadeAnim }
            ]}
          >
            <View style={styles.alertContent}>
              <Ionicons name="car" size={24} color="#10b981" />
              <View style={styles.alertTextContainer}>
                <Text style={styles.alertTitle}>Active Ride</Text>
                <Text style={styles.alertSubtitle}>Your driver is on the way</Text>
              </View>
              <Pressable style={styles.alertButton}>
                <Text style={styles.alertButtonText}>Track</Text>
              </Pressable>
            </View>
          </Animated.View>
        )}

        {/* Filter Tabs */}
        <Animated.View 
          style={[
            styles.tabContainer,
            { opacity: fadeAnim }
          ]}
        >
          {(['all', 'active', 'completed'] as const).map((tab) => (
            <Pressable
              key={tab}
              style={[
                styles.tab,
                selectedTab === tab && styles.activeTab
              ]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text style={[
                styles.tabText,
                selectedTab === tab && styles.activeTabText
              ]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </Pressable>
          ))}
        </Animated.View>

        {/* Bookings List */}
        <Animated.View 
          style={[
            styles.listContainer,
            { opacity: fadeAnim }
          ]}
        >
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="car-outline" size={64} color={theme.colors.muted} />
                <Text style={styles.emptyTitle}>No bookings found</Text>
                <Text style={styles.emptySubtitle}>
                  {selectedTab === 'active' 
                    ? "You don't have any active rides"
                    : "Your ride history will appear here"
                  }
                </Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>
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
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
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
  activeRideAlert: {
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065f46',
    marginBottom: 2,
  },
  alertSubtitle: {
    fontSize: 14,
    color: '#047857',
  },
  alertButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  alertButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.muted,
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  bookingCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginLeft: 8,
  },
  routeContainer: {
    marginBottom: 16,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  routePoint: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: theme.colors.border,
    marginLeft: 15,
    marginVertical: 4,
  },
  locationText: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTimeText: {
    fontSize: 14,
    color: theme.colors.muted,
    marginLeft: 6,
    fontWeight: '500',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  driverName: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.colors.muted,
    textAlign: 'center',
    lineHeight: 24,
  },
});