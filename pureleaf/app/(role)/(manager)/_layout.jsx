import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// --- Custom Tab Bar ---
function CustomTabBar({ state, descriptors, navigation }) {
  const tabRoutes = ['index', 'fertilizer'];
  return (
    <View style={styles.tabBar}>
      {state.routes
        .filter(route => tabRoutes.includes(route.name))
        .map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

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

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              style={styles.tab}
            >
              <Ionicons name={iconName} size={24} color={isFocused ? '#183d2b' : '#888'} />
              <Text style={[styles.tabLabel, { color: isFocused ? '#183d2b' : '#888' }]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
    </View>
  );
}

// --- Your Manager Header (unchanged) ---
function ManagerHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.logoRow}>
        <Image
          source={require('../../../assets/images/logo2.png')}
          style={styles.logo}
        />
        <Text style={styles.brandText}>ureleaf</Text>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="notifications-outline" size={28} color="#183d2b" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image
            source={require('../../../assets/images/propic.jpg')}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
        <Tabs.Screen
          name="index"
          options={{
            tabBarLabel: 'Home',
          }}
        />
        <Tabs.Screen
          name="fertilizer"
          options={{
            tabBarLabel: 'Fertilizer',
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  // --- Custom tab bar styles ---
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

  // --- Header styles (unchanged) ---
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
});
