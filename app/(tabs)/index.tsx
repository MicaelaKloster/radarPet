import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";

import MapaListado from "@/components/MapaListado";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { suscribirseAReportes } from '@/lib/subscriptions';

export default function MapScreen() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setRefreshKey(prev => prev + 1);
    }, [])
  );

  useEffect(() => {
    const channel = suscribirseAReportes();
    return () => {
      channel.then(ch => ch.unsubscribe());
    };
  }, []);

  const navigateToLostPets = () => {
    router.push("/(tabs)/reportes-perdidas");
  };

  const navigateToFoundPets = () => {
    router.push("/(tabs)/reporte-encontradas");
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          RadarPet
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Encuentra a tu mascota perdida
        </ThemedText>
        <TouchableOpacity
          style={styles.fullMapButton}
          onPress={() => router.push("/mapa-completo")}
        >
          <ThemedText style={styles.fullMapButtonText}>Ver Mapa</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <View style={styles.mapContainer}>
        <MapaListado key={refreshKey} />
      </View>

      <ThemedView style={styles.quickActions}>
        <ThemedText type="subtitle" style={styles.quickActionsTitle}>
          Acciones Rápidas
        </ThemedText>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.lostButton,
              { backgroundColor: "#2CBDAA" },
            ]}
            onPress={navigateToLostPets}
            activeOpacity={0.8}
          >
            <IconSymbol
              size={28}
              name="exclamationmark.triangle.fill"
              color="#FFFFFF"
            />
            <ThemedText style={[styles.actionText, styles.lostButtonText]}>
              Reportar Perdida
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.foundButton,
              { backgroundColor: "#E5E7EB" },
            ]}
            onPress={navigateToFoundPets}
            activeOpacity={0.8}
          >
            <IconSymbol
              size={28}
              name="checkmark.circle.fill"
              color="#4B5563"
            />
            <ThemedText
              style={[
                styles.actionText,
                styles.foundButtonText,
                { color: "#4B5563" },
              ]}
            >
              Reportar Encontrada
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    backgroundColor: "#F8FAFB",
  },

  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    position: "relative",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 16,
    color: "#6B7280",
  },

  mapContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  quickActions: {
    padding: 16,
    paddingTop: 8,
  },

  quickActionsTitle: {
    marginBottom: 12,
    color: "#1E293B",
    fontFamily: "Poppins-SemiBold",
  },

  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },

  actionButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },

  lostButton: {
    marginRight: 6,
  },

  foundButton: {
    marginLeft: 6,
  },

  actionText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: "#FFFFFF",
  },

  lostButtonText: {
    color: "#FFFFFF",
  },

  foundButtonText: {
    color: "#FFFFFF",
  },
  fullMapButton: {
    position: "absolute",
    top: 20,
    right: 16,
    backgroundColor: "#2CBDAA",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  fullMapButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
});
