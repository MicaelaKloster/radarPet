import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import React from "react";
import { Linking, StyleSheet, TouchableOpacity } from "react-native";

export default function SupportSettings() {
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
      <ThemedText type="subtitle">Ayuda y Soporte</ThemedText>
      <ThemedText style={{ marginTop: 20 }}>
        ¿Necesitas ayuda? Escríbenos a:
      </ThemedText>
      <TouchableOpacity onPress={handleEmailPress}>
        <ThemedText style={{ fontWeight: "bold", marginTop: 10 }}>
          radarpet.soporte@gmail.com
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
});
