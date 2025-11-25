// Importaciones necesarias para el componente
import { Redirect, Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform } from "react-native";

// Componentes personalizados
import { CustomTabIcon } from "@/components/CustomTabIcon";
import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";

// Constantes y utilidades
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { supabase } from "@/lib/supabase";

/**
 * Componente principal que maneja el layout de pestañas de la aplicación
 * Se encarga de la navegación principal y la autenticación
 */
export default function TabLayout() {
  // Estado para manejar el tema (claro/oscuro)
  const colorScheme = useColorScheme();

  // Estados para controlar la autenticación
  const [checking, setChecking] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(!!data.session?.user);
      setChecking(false);
    });
  }, []);

  if (checking) return null;
  if (!loggedIn) return <Redirect href="/(auth)/login" />;
  return (
    <Tabs
      // Configuración global de las pestañas
      screenOptions={{
        // Color del ícono activo según el tema
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        // Ocultar el header por defecto
        headerShown: false,
        // Componente personalizado para los botones de pestaña con feedback háptico
        tabBarButton: HapticTab,
        // Fondo personalizado para la barra de pestañas
        tabBarBackground: TabBarBackground,
        // Estilos específicos por plataforma
        tabBarStyle: Platform.select({
          // En iOS: posición absoluta para mostrar el efecto de desenfoque
          ios: {
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      {/* Pestaña del Mapa */}
      <Tabs.Screen
        name="index" // Nombre de la ruta
        options={{
          title: "Mapa", // Título que se muestra en la pestaña
          // Ícono personalizado que cambia según si está activo o no
          tabBarIcon: ({ focused }) => (
            <CustomTabIcon focused={focused} iconName="mapa" size={28} />
          ),
        }}
      />

      {/* Pestaña de Mascotas Perdidas */}
      <Tabs.Screen
        name="reportes-perdidas"
        options={{
          title: "Perdida",
          tabBarIcon: ({ focused }) => (
            <CustomTabIcon focused={focused} iconName="patita" size={28} />
          ),
        }}
      />

      {/* Pestaña de Mascotas Encontradas */}
      <Tabs.Screen
        name="reporte-encontradas"
        options={{
          title: "Encontrada",
          tabBarIcon: ({ focused }) => (
            <CustomTabIcon focused={focused} iconName="patita" size={28} />
          ),
        }}
      />

      {/* Pestaña de Perfil de Usuario */}
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ focused }) => (
            <CustomTabIcon focused={focused} iconName="perfil" size={28} />
          ),
        }}
      />

      {/* Pestaña de Explorar */}
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explorar",
          tabBarIcon: ({ focused }) => (
            <CustomTabIcon focused={focused} iconName="inicio" size={28} />
          ),
        }}
      />
      {/* Pestaña de Telefonos útiles */}
      <Tabs.Screen
        name="telefonos-utiles"
        options={{
          title: "Telefonos útiles",
          tabBarIcon: ({ focused }) => (
            <CustomTabIcon
              focused={focused}
              iconName="telefono_utiles"
              size={28}
            />
          ),
        }}
      />
    </Tabs>
  );
}
