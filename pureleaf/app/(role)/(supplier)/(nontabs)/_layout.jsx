import { Stack } from 'expo-router';

export default function NonTabLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
