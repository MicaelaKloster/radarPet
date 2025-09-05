import { Redirect, Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform } from "react-native";

import { CustomTabIcon } from "@/components/CustomTabIcon";
import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { supabase } from "@/lib/supabase";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [checking, setChecking] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(!!data.session?.user);
      setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setLoggedIn(!!session?.user);
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  if (checking) return null;
  if (!loggedIn) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarShowLabel: false,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Mapa",
          tabBarIcon: ({ focused }) => (
            <CustomTabIcon focused={focused} iconName="mapa" size={28} />
          ),
        }}
      />
      <Tabs.Screen
        name="reportes-perdidas"
        options={{
          title: "Perdida",
          tabBarIcon: ({ focused }) => (
            <CustomTabIcon focused={focused} iconName="patita" size={28} />
          ),
        }}
      />
      <Tabs.Screen
        name="reporte-encontradas"
        options={{
          title: "Encontrada",
          tabBarIcon: ({ focused }) => (
            <CustomTabIcon focused={focused} iconName="patita" size={28} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ focused }) => (
            <CustomTabIcon focused={focused} iconName="perfil" size={28} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explorar",
          tabBarIcon: ({ focused }) => (
            <CustomTabIcon focused={focused} iconName="inicio" size={28} />
          ),
        }}
      />
    </Tabs>
  );
}
