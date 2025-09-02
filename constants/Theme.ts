import { TextStyle, ViewStyle } from 'react-native'

// TIPOS DE DATOS
export interface ColorPalette {
  // Colores principales de RadarPet
  primary: string           // Verde azulado principal
  primaryDark: string       // Verde azulado oscuro
  primaryLight: string      // Verde azulado claro
  
  // Colores secundarios
  secondary: string         // Gris para botones secundarios
  secondaryDark: string     
  secondaryLight: string    
  accent: string           // Verde menta del fondo
  
  // Colores de fondo
  background: string        // Blanco principal
  backgroundSecondary: string // Gris muy claro
  backgroundAccent: string  // Verde menta claro
  
  // Colores de superficie
  surface: string
  surfaceSecondary: string
  card: string             // Para tarjetas de mascotas
  
  // Colores de texto
  text: string             // Negro/gris oscuro
  textSecondary: string    // Gris medio
  textTertiary: string     // Gris claro
  textLight: string        // Blanco
  textMuted: string        // Gris deshabilitado
  
  // Colores de estado
  success: string
  warning: string
  error: string
  info: string
  
  // Colores específicos de la app
  mapPin: string           // Color de los pins del mapa
  profileAccent: string    // Rosa del perfil
  inputBorder: string      // Bordes de inputs
  inputBackground: string  // Fondo de inputs
  
  // Colores neutros
  white: string
  black: string
  gray50: string
  gray100: string
  gray200: string
  gray300: string
  gray400: string
  gray500: string
  gray600: string
  gray700: string
  gray800: string
  gray900: string
  
  // Colores con transparencia
  overlay: string
  overlayLight: string
  shadowColor: string
  
  // Bordes
  border: string
  borderLight: string
}

export interface FontSizes {
  xs: number
  sm: number
  base: number
  lg: number
  xl: number
  '2xl': number
  '3xl': number
  '4xl': number
  '5xl': number
}

export interface FontFamilies {
  regular: string
  medium: string
  semiBold: string
  bold: string
  extraBold: string
  light: string
}

export interface LineHeights {
  tight: number
  snug: number
  normal: number
  relaxed: number
  loose: number
}

export interface TextStyles {
  h1: TextStyle
  h2: TextStyle
  h3: TextStyle
  h4: TextStyle
  body: TextStyle
  bodySmall: TextStyle
  caption: TextStyle
  button: TextStyle
  appTitle: TextStyle      // Para "RadarPet"
  subtitle: TextStyle      // Para subtítulos de la app
}

export interface TypographyConfig {
  fontFamily: FontFamilies
  fontSize: FontSizes
  lineHeight: LineHeights
  styles: TextStyles
}

export interface SpacingConfig {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
  '2xl': number
  '3xl': number
}

export interface BorderRadiusConfig {
  none: number
  sm: number
  md: number
  lg: number
  xl: number
  '2xl': number
  full: number
  button: number           // Radio específico para botones
}

export interface ShadowStyle extends ViewStyle {
  shadowColor: string
  shadowOffset: {
    width: number
    height: number
  }
  shadowOpacity: number
  shadowRadius: number
  elevation: number
}

export interface ShadowsConfig {
  small: ShadowStyle
  medium: ShadowStyle
  large: ShadowStyle
  card: ShadowStyle        // Sombra para tarjetas
}

export interface LayoutConfig {
  window: {
    width: number | null
    height: number | null
  }
  container: {
    paddingHorizontal: number
  }
  screen: {
    paddingTop: number
    paddingHorizontal: number
  }
}

export interface ThemeConfig {
  colors: ColorPalette
  typography: TypographyConfig
  spacing: SpacingConfig
  borderRadius: BorderRadiusConfig
  shadows: ShadowsConfig
  layout: LayoutConfig
}

// PALETA DE COLORES EXTRAÍDA DE RADARPET
export const Colors: ColorPalette = {
  // Colores principales - Verde azulado de los botones y elementos principales
  primary: '#2CBDAA',        // Verde azulado principal (botones, iconos activos)
  primaryDark: '#249A8A',    // Versión más oscura
  primaryLight: '#5CCAB8',   // Versión más clara
  
  // Colores secundarios - Gris de botones inactivos
  secondary: '#A8A8A8',      // Gris de botones secundarios
  secondaryDark: '#808080',  
  secondaryLight: '#C0C0C0',
  accent: '#E8F5F3',         // Verde menta muy claro del fondo de bienvenida
  
  // Colores de fondo
  background: '#FFFFFF',     // Blanco principal
  backgroundSecondary: '#F8F9FA', // Gris muy claro
  backgroundAccent: '#E8F5F3', // Verde menta claro de la pantalla de bienvenida
  
  // Colores de superficie
  surface: '#FFFFFF',
  surfaceSecondary: '#F5F5F5',
  card: '#FFFFFF',           // Fondo de tarjetas de mascotas
  
  // Colores de texto
  text: '#2C2C2E',           // Texto principal (títulos como "Comenzar", "Crear cuenta")
  textSecondary: '#6C6C70',  // Texto secundario
  textTertiary: '#8E8E93',   // Texto de placeholders y descripción
  textLight: '#FFFFFF',      // Texto en botones
  textMuted: '#999999',      // Texto deshabilitado
  
  // Colores de estado (manteniendo consistencia con la app)
  success: '#34C759',        
  warning: '#FF9500',        
  error: '#FF3B30',          
  info: '#2CBDAA',          // Usando el color principal
  
  // Colores específicos de RadarPet
  mapPin: '#2CBDAA',         // Color de los pins en el mapa
  profileAccent: '#FF8A80',  // Rosa del fondo del perfil
  inputBorder: '#E5E7EB',    // Bordes de los campos de entrada
  inputBackground: '#F9FAFB', // Fondo de inputs
  
  // Colores neutros
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',
  
  // Colores con transparencia
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  shadowColor: 'rgba(0, 0, 0, 0.1)',
  
  // Bordes
  border: '#E5E7EB',
  borderLight: '#F0F0F0',
}

// TIPOGRAFÍA
export const Typography: TypographyConfig = {
  // Familias de fuentes
  fontFamily: {
    regular: 'Poppins_400Regular',
    medium: 'Poppins_500Medium',
    semiBold: 'Poppins_600SemiBold',
    bold: 'Poppins_700Bold',
    extraBold: 'Poppins_800ExtraBold',
    light: 'Poppins_300Light',
  },
  
  // Tamaños de fuente
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,    // Para títulos como "RadarPet"
    '4xl': 32,
    '5xl': 48,
  },
  
  // Alturas de línea
  lineHeight: {
    tight: 1.2,
    snug: 1.3,
    normal: 1.4,
    relaxed: 1.5,
    loose: 1.6,
  },
  
  // Estilos de texto predefinidos basados en la app
  styles: {
    // Título principal de la app
    appTitle: {
      fontFamily: 'Poppins_700Bold',
      fontSize: 28,
      lineHeight: 34,
      color: Colors.text,
    },
    
    h1: {
      fontFamily: 'Poppins_700Bold',
      fontSize: 24,           // Como "Comenzar", "Crear cuenta"
      lineHeight: 30,
      color: Colors.text,
    },
    h2: {
      fontFamily: 'Poppins_600SemiBold',
      fontSize: 20,
      lineHeight: 26,
      color: Colors.text,
    },
    h3: {
      fontFamily: 'Poppins_600SemiBold',
      fontSize: 18,           // Como "Mascotas Perdidas"
      lineHeight: 24,
      color: Colors.text,
    },
    h4: {
      fontFamily: 'Poppins_500Medium',
      fontSize: 16,
      lineHeight: 22,
      color: Colors.text,
    },
    body: {
      fontFamily: 'Poppins_400Regular',
      fontSize: 16,
      lineHeight: 24,
      color: Colors.text,
    },
    bodySmall: {
      fontFamily: 'Poppins_400Regular',
      fontSize: 14,           // Texto descriptivo
      lineHeight: 20,
      color: Colors.textSecondary,
    },
    caption: {
      fontFamily: 'Poppins_400Regular',
      fontSize: 12,
      lineHeight: 16,
      color: Colors.textTertiary,
    },
    button: {
      fontFamily: 'Poppins_600SemiBold',
      fontSize: 16,
      lineHeight: 20,
      color: Colors.white,
    },
    subtitle: {
      fontFamily: 'Poppins_400Regular',
      fontSize: 16,           // Como "¡Bienvenido!", "Regístrate para continuar"
      lineHeight: 22,
      color: Colors.textSecondary,
    },
  }
}

// ESPACIADO
export const Spacing: SpacingConfig = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
}

// RADIO DE BORDES
export const BorderRadius: BorderRadiusConfig = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
  button: 8,              // Radio específico para los botones de la app
}

// SOMBRAS
export const Shadows: ShadowsConfig = {
  small: {
    shadowColor: Colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 2,
  },
  medium: {
    shadowColor: Colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.20,
    shadowRadius: 2.62,
    elevation: 4,
  },
  large: {
    shadowColor: Colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 8,
  },
  card: {
    shadowColor: Colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
}

// LAYOUT
export const Layout: LayoutConfig = {
  window: {
    width: null,
    height: null,
  },
  container: {
    paddingHorizontal: Spacing.md,
  },
  screen: {
    paddingTop: 44,
    paddingHorizontal: Spacing.md,
  }
}

// TEMA COMPLETO
export const Theme: ThemeConfig = {
  colors: Colors,
  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadows: Shadows,
  layout: Layout,
}