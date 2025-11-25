import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/contexts/ThemeContext";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

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
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Image
          source={require("../../assets/flecha-izquierda.png")}
          style={[styles.backIcon, { tintColor: isDark ? "#fff" : "#000" }]}
        />
      </TouchableOpacity>

      <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]}>
        Ayuda y Soporte
      </Text>

      <Text style={[styles.description, { color: isDark ? "#fff" : "#000" }]}>
        ¿Necesitas ayuda? Escríbenos a:
      </Text>

      <TouchableOpacity onPress={handleEmailPress}>
        <Text style={[styles.email, { color: isDark ? "#fff" : "#000" }]}>
          radarpet.soporte@gmail.com
        </Text>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    left: 24,
    zIndex: 10,
    padding: 6,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 60,
  },
  description: {
    marginTop: 20,
  },
  email: {
    fontWeight: "bold",
    marginTop: 10,
  },
});
