import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'react-native';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style="light" backgroundColor="#000" translucent />
      {/* This SafeAreaView ONLY colors the top and bottom safe areas black */}
      <SafeAreaView
        style={{ flex: 1, backgroundColor: '#000' }}
        edges={['top', 'bottom']}
      >
        {/* Your app content fills the rest, with NO extra margin/padding */}
        <View style={{ flex: 1, backgroundColor: '#f4f8f4' }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="login" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(role)" />
            <Stack.Screen name="+not-found" />
          </Stack>
        </View>
      </SafeAreaView>
    </ThemeProvider>
  );
}
