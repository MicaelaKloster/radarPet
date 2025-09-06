import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useAppFonts } from '@/hooks/useFonts';

export default function RootLayout() {
  // Removí useColorScheme para forzar siempre tema claro
  const fontsLoaded = useAppFonts(); // Usamos hook de fuentes
  
  if (!fontsLoaded) return null;
  
  return (
    <ThemeProvider value={DefaultTheme}> {/* Siempre tema claro */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="dark" /> {/* Texto oscuro en barra de estado */}
    </ThemeProvider>
  );
}