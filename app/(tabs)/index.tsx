// Importaciones necesarias para React y componentes de React Native
import { useRouter } from "expo-router";
import React from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";

// Componentes personalizados de la aplicación
import MapaListado from "@/components/MapaListado"; // Componente del mapa interactivo
import { ThemedText } from "@/components/ThemedText"; // Componente de texto que se adapta al tema
import { ThemedView } from "@/components/ThemedView"; // Componente de vista que se adapta al tema
import { IconSymbol } from "@/components/ui/IconSymbol"; // Componente para mostrar íconos

/**
 * Pantalla principal de la aplicación que muestra el mapa y acciones rápidas
 * Esta pantalla es la entrada principal de la aplicación y muestra un mapa interactivo
 * con reportes de mascotas perdidas y encontradas, además de acciones rápidas para
 * reportar mascotas perdidas o encontradas.
 */
export default function MapScreen() {
  // Hook para la navegación entre pantallas
  const router = useRouter();

  /**
   * Navega a la pantalla de reportar mascota perdida
   * Esta función es llamada cuando el usuario presiona el botón de "Reportar Perdida"
   */
  const navigateToLostPets = () => {
    router.push("/(tabs)/reportes-perdidas");
  };

  /**
   * Navega a la pantalla de reportar mascota encontrada
   * Esta función es llamada cuando el usuario presiona el botón de "Reportar Encontrada"
   */
  const navigateToFoundPets = () => {
    router.push("/(tabs)/reporte-encontradas");
  };

  return (
    // Contenedor principal de la pantalla
    <ThemedView style={styles.container}>
      {/* Encabezado con el título de la aplicación */}
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

      {/* Sección del mapa interactivo */}
      <View style={styles.mapContainer}>
        <MapaListado />
      </View>

      {/* Sección de acciones rápidas */}
      <ThemedView style={styles.quickActions}>
        <ThemedText type="subtitle" style={styles.quickActionsTitle}>
          Acciones Rápidas
        </ThemedText>

        {/* Contenedor de botones de acción */}
        <View style={styles.actionButtons}>
          {/* Botón para reportar mascota perdida */}
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

          {/* Botón para reportar mascota encontrada */}
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

// Estilos de la pantalla
const styles = StyleSheet.create({
  // Contenedor principal
  container: {
    flex: 1,
    paddingTop: 60,
    backgroundColor: "#F8FAFB",
  },

  // Estilos del encabezado
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    position: "relative",
  },

  // Estilos del título principal
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },

  // Estilos del subtítulo
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
  },

  // Contenedor del mapa
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

  // Sección de acciones rápidas
  quickActions: {
    padding: 16,
    paddingTop: 8,
  },

  // Título de la sección de acciones
  quickActionsTitle: {
    marginBottom: 12,
    color: "#1E293B",
    fontFamily: "Poppins-SemiBold",
  },

  // Contenedor de botones
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },

  // Estilo base para los botones
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

  // Estilo específico para el botón de "Reportar Perdida"
  lostButton: {
    marginRight: 6,
  },

  // Estilo específico para el botón de "Reportar Encontrada"
  foundButton: {
    marginLeft: 6,
  },

  // Estilo base para el texto de los botones
  actionText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: "#FFFFFF",
  },

  // Estilos específicos para el texto de cada botón
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
