import { useFonts } from 'expo-font'
import {
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
} from '@expo-google-fonts/poppins'

export const useAppFonts = (): boolean => {
  const [fontsLoaded] = useFonts({
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  })

  return fontsLoaded
}

// Alternativa si prefieres cargar fuentes locales:
/*
export const useAppFonts = (): boolean => {
  const [fontsLoaded] = useFonts({
    'Poppins_300Light': require('../assets/fonts/Poppins-Light.ttf'),
    'Poppins_400Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins_500Medium': require('../assets/fonts/Poppins-Medium.ttf'),
    'Poppins_600SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins_700Bold': require('../assets/fonts/Poppins-Bold.ttf'),
    'Poppins_800ExtraBold': require('../assets/fonts/Poppins-ExtraBold.ttf'),
  })

  return fontsLoaded
}
*/