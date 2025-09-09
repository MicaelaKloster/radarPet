// Importaciones necesarias para React y componentes de React Native
import React from "react";
import { StyleSheet, View } from "react-native";
// Componentes personalizados de la aplicación
import { ThemedText } from "@/components/ThemedText"; // Texto que se adapta al tema claro/oscuro
import { ThemedView } from "@/components/ThemedView"; // Vista que se adapta al tema claro/oscuro
import { IconSymbol } from "@/components/ui/IconSymbol"; // Componente para mostrar íconos
import MapaListado from "@/components/MapaListado";

// Componente principal de la pantalla del mapa (pantalla de inicio)
export default function MapScreen() {
  return (
    // Contenedor principal que ocupa toda la pantalla
    <ThemedView style={styles.container}>
      {/* Sección del encabezado con branding de RadarPet */}
      <ThemedView style={styles.header}>
        {/* Título principal de la aplicación */}
        <ThemedText type="title" style={styles.title}>
          RadarPet
        </ThemedText>
        {/* Subtítulo descriptivo de la funcionalidad */}
        <ThemedText style={styles.subtitle}>
          Encuentra a tu mascota perdida
        </ThemedText>
      </ThemedView>

      {/* Mapa interactivo con reportes */}
      <View style={styles.mapContainer}>
        <MapaListado />
      </View>

      {/* Sección de acciones rápidas para el usuario */}
      <ThemedView style={styles.quickActions}>
        {/* Título de la sección de acciones */}
        <ThemedText type="subtitle" style={styles.quickActionsTitle}>
          Acciones Rápidas
        </ThemedText>
        {/* Contenedor horizontal para los botones de acción */}
        <View style={styles.actionButtons}>
          {/* Botón para reportar mascota perdida */}
          <View style={styles.actionButton}>
            {/* Ícono de alerta para mascotas perdidas */}
            <IconSymbol
              size={32}
              name="exclamationmark.triangle.fill"
              color="#FF6B6B"
            />
            {/* Texto descriptivo del botón */}
            <ThemedText style={styles.actionText}>Reportar Perdida</ThemedText>
          </View>
          {/* Botón para reportar mascota encontrada */}
          <View style={styles.actionButton}>
            {/* Ícono de check para mascotas encontradas */}
            <IconSymbol
              size={32}
              name="checkmark.circle.fill"
              color="#4ECDC4"
            />
            {/* Texto descriptivo del botón */}
            <ThemedText style={styles.actionText}>
              Reportar Encontrada
            </ThemedText>
          </View>
        </View>
      </ThemedView>
    </ThemedView>
  );
}

// Objeto de estilos para todos los componentes de la pantalla
const styles = StyleSheet.create({
  // Contenedor principal que ocupa toda la pantalla
  container: {
    flex: 1, // Ocupa todo el espacio disponible
    paddingTop: 60, // Espacio superior para evitar la barra de estado
  },
  // Estilo para la sección del encabezado
  header: {
    alignItems: "center", // Centra los elementos horizontalmente
    paddingHorizontal: 20, // Espaciado horizontal interno
    paddingBottom: 20, // Espaciado inferior
  },
  // Estilo para el título principal de RadarPet
  title: {
    fontSize: 32, // Tamaño de fuente grande para el título
    fontWeight: "bold", // Texto en negrita
    color: "#2E86AB", // Color azul característico de la marca
  },
  // Estilo para el subtítulo descriptivo
  subtitle: {
    fontSize: 16, // Tamaño de fuente mediano
    marginTop: 5, // Pequeño espacio superior
    opacity: 0.7, // Transparencia para menor prominencia
  },
  // Contenedor del mapa interactivo
  mapContainer: {
    flex: 1, // Ocupa el espacio principal disponible
    margin: 20, // Margen exterior
    borderRadius: 15, // Bordes muy redondeados
    overflow: 'hidden', // Esconde el desbordamiento de bordes redondeados
    backgroundColor: '#F5F5F5' // Fondo gris claro
  },
  // Contenedor de la sección de acciones rápidas
  quickActions: {
    padding: 20, // Espaciado interno
  },
  // Título de la sección de acciones rápidas
  quickActionsTitle: {
    marginBottom: 15, // Espacio inferior antes de los botones
  },
  // Contenedor horizontal para los botones de acción
  actionButtons: {
    flexDirection: "row", // Disposición horizontal
    justifyContent: "space-around", // Distribución uniforme del espacio
  },
  // Estilo individual para cada botón de acción
  actionButton: {
    alignItems: "center", // Centra el contenido verticalmente
    padding: 15, // Espaciado interno
    backgroundColor: "#F8F9FA", // Fondo gris muy claro
    borderRadius: 12, // Bordes redondeados
    minWidth: 120, // Ancho mínimo para consistencia
  },
  // Texto descriptivo de los botones de acción
  actionText: {
    marginTop: 8, // Espacio superior después del ícono
    fontSize: 12, // Tamaño de fuente pequeño
    textAlign: "center", // Texto centrado
  },
});
