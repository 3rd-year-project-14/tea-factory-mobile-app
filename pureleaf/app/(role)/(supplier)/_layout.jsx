import React, { useState } from 'react';
import { Tabs } from 'expo-router';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// --- Custom Tab Bar ---
function CustomTabBar({ state, descriptors, navigation }) {
  const visibleTabs = ['index', 'fertilizer', 'wallet'];

  return (
    <View style={styles.tabBar}>
      {state.routes
        .filter(route => visibleTabs.includes(route.name))
        .map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel ?? options.title ?? route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          let iconName = 'home';
          if (route.name === 'fertilizer') iconName = 'leaf';
          if (route.name === 'wallet') iconName = 'wallet';

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              style={styles.tab}
              onPress={onPress}
            >
              <Ionicons
                name={iconName}
                size={24}
                color={isFocused ? '#183d2b' : '#888'}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: isFocused ? '#183d2b' : '#888' },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
    </View>
  );
}

// --- Header ---
function ManagerHeader() {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <View style={{ position: 'relative' }}>
      {/* Header Bar */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Image
            source={require('../../../assets/images/logo2.png')}
            style={styles.logo}
          />
          <Text style={styles.brandText}>ureleaf</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setShowNotifications(prev => !prev)}
          >
            <Ionicons name="notifications-outline" size={28} color="#183d2b" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(nontabs)/profile')}>
            <Image
              source={require('../../../assets/images/propic.jpg')}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Notification Dropdown */}
      {showNotifications && (
        <TouchableOpacity
          activeOpacity={1}
          onPressOut={() => setShowNotifications(false)}
          style={styles.dropdownWrapper}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.notificationDropdown}
            onPress={() => {}}
          >
            {/* Arrow */}
            <View style={styles.dropdownArrow} />

            <Text style={styles.dropdownTitle}>Notifications</Text>

            <View style={styles.dropdownItem}>
              <Ionicons
                name="leaf-outline"
                size={18}
                color="#4e6c50"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.dropdownText}>Your fertilizer order has shipped.</Text>
            </View>

            <View style={styles.dropdownItem}>
              <Ionicons
                name="wallet-outline"
                size={18}
                color="#4e6c50"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.dropdownText}>Wallet balance updated.</Text>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    </View>
  );
}

// --- Main Layout ---
export default function ManagerLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#eaf2ea' }}>
      <ManagerHeader />
      <Tabs
        tabBar={props => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen name="index" options={{ tabBarLabel: 'Home' }} />
        <Tabs.Screen name="fertilizer" options={{ tabBarLabel: 'Fertilizer' }} />
        <Tabs.Screen name="wallet" options={{ tabBarLabel: 'Wallet' }} />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 18,
    alignSelf: 'center',
    width: 330,
    height: 70,
    backgroundColor: '#fff',
    borderRadius: 32,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    zIndex: 100,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    zIndex: 10,
    paddingTop: 16,
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    paddingTop: 5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
  },
  iconBtn: {
    marginRight: 16,
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    paddingTop: 5,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#eee',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandText: {
    fontSize: 15,
    fontWeight: '300',
    color: '#183d2b',
    marginTop: 20,
    letterSpacing: 1,
  },

  // Notification Dropdown
  dropdownWrapper: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1000,
    backgroundColor: 'transparent',
  },
  notificationDropdown: {
    width: 260,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dropdownArrow: {
    position: 'absolute',
    top: -8,
    right: 16,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#fff',
    zIndex: 10,
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: '#183d2b',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dropdownText: {
    fontSize: 14,
    color: '#4e6c50',
    flexShrink: 1,
  },
});
