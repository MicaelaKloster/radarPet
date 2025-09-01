import { Tabs } from "expo-router"; // Componente de navegación por pestañas de Expo Router
import React from "react"; // Librería principal de React
import { Platform } from "react-native"; // Utilidad para detectar la plataforma (iOS/Android)

import { HapticTab } from "@/components/HapticTab"; // Componente personalizado que añade vibración táctil a las pestañas
import { IconSymbol } from "@/components/ui/IconSymbol"; // Componente para mostrar iconos multiplataforma
import TabBarBackground from "@/components/ui/TabBarBackground"; // Componente que define el fondo de la barra de pestañas
import { Colors } from "@/constants/Colors"; // Constantes de colores del tema
import { useColorScheme } from "@/hooks/useColorScheme"; // Hook personalizado para detectar tema claro/oscuro

// Función principal que define el layout de navegación por pestañas
export default function TabLayout() {
  // Obtiene el esquema de color actual (light/dark) del dispositivo
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        // Color del ícono y texto cuando la pestaña está activa
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        // Oculta el header superior en todas las pantallas
        headerShown: false,
        // Usa el componente HapticTab para añadir vibración al tocar pestañas
        tabBarButton: HapticTab,
        // Aplica el fondo personalizado a la barra de pestañas
        tabBarBackground: TabBarBackground,
        // Estilos específicos por plataforma para la barra de pestañas
        tabBarStyle: Platform.select({
          ios: {
            // En iOS usa fondo transparente para mostrar el efecto blur
            position: "absolute",
          },
          default: {}, // En Android usa estilos por defecto
        }),
      }}
    >
      {/* Pestaña 1: Mapa principal (pantalla de inicio) */}
      <Tabs.Screen
        name="index" // Nombre del archivo de la pantalla
        options={{
          title: "Mapa", // Texto que aparece bajo el ícono
          // Función que renderiza el ícono de la pestaña
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="map.fill" color={color} />
          ),
        }}
      />
      {/* Pestaña 2: Reportar mascota perdida */}
      <Tabs.Screen
        name="report-lost"
        options={{
          title: "Perdida",
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={28}
              name="exclamationmark.triangle.fill" // Ícono de triángulo con exclamación
              color={color}
            />
          ),
        }}
      />
      {/* Pestaña 3: Reportar mascota encontrada */}
      <Tabs.Screen
        name="report-found"
        options={{
          title: "Encontrada",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="checkmark.circle.fill" color={color} /> // Ícono de check circular
          ),
        }}
      />
      {/* Pestaña 4: Perfil del usuario */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.fill" color={color} /> // Ícono de persona
          ),
        }}
      />
    </Tabs>
  );
}
