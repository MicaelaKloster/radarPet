import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import React from "react";
import { Linking, StyleSheet, TouchableOpacity, Text } from "react-native";
import { useTheme } from '@/contexts/ThemeContext';

export default function SupportSettings() {
  const { isDark } = useTheme();
  const handleEmailPress = () => {
    const email = "radarpet.soporte@gmail.com";
    const subject = "Soporte RadarPet";
    const body = "Tengo un problema con ";
    Linking.openURL(
      `mailto:${email}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`
    );
  };

  return (
    <ThemedView style={styles.container}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: isDark ? '#fff' : '#000' }}>Ayuda y Soporte</Text>
      <Text style={{ marginTop: 20, color: isDark ? '#fff' : '#000' }}>
        ¿Necesitas ayuda? Escríbenos a:
      </Text>
      <TouchableOpacity onPress={handleEmailPress}>
        <Text style={{ fontWeight: "bold", marginTop: 10, color: isDark ? '#fff' : '#000' }}>
          radarpet.soporte@gmail.com
        </Text>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
});
