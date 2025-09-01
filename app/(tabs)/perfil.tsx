// Importaciones necesarias para React y componentes de React Native
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
// Componentes personalizados de la aplicación
import { ThemedText } from "@/components/ThemedText"; // Texto que se adapta al tema claro/oscuro
import { ThemedView } from "@/components/ThemedView"; // Vista que se adapta al tema claro/oscuro
import { IconSymbol } from "@/components/ui/IconSymbol"; // Componente para mostrar íconos

// Componente principal de la pantalla de perfil
export default function ProfileScreen() {
  return (
    // Contenedor principal que ocupa toda la pantalla
    <ThemedView style={styles.container}>
      {/* Sección del encabezado con información del usuario */}
      <ThemedView style={styles.header}>
        {/* Contenedor circular para el avatar del usuario */}
        <View style={styles.avatarContainer}>
          {/* Ícono de persona que actúa como avatar por defecto */}
          <IconSymbol size={60} name="person.fill" color="#2E86AB" />
        </View>
        {/* Nombre del usuario mostrado como título */}
        <ThemedText type="title" style={styles.userName}>
          Usuario RadarPet
        </ThemedText>
        {/* Email del usuario con menor prominencia */}
        <ThemedText style={styles.userEmail}>usuario@example.com</ThemedText>
      </ThemedView>

      {/* Vista desplazable para el contenido principal */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Sección de estadísticas de reportes del usuario */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Mis Reportes
          </ThemedText>

          {/* Contenedor horizontal para mostrar estadísticas */}
          <View style={styles.statsContainer}>
            {/* Estadística de mascotas perdidas reportadas */}
            <View style={styles.statItem}>
              <IconSymbol
                size={24}
                name="exclamationmark.triangle.fill"
                color="#FF6B6B"
              />
              <ThemedText style={styles.statNumber}>0</ThemedText>
              <ThemedText style={styles.statLabel}>Perdidas</ThemedText>
            </View>
            {/* Estadística de mascotas encontradas reportadas */}
            <View style={styles.statItem}>
              <IconSymbol
                size={24}
                name="checkmark.circle.fill"
                color="#4ECDC4"
              />
              <ThemedText style={styles.statNumber}>0</ThemedText>
              <ThemedText style={styles.statLabel}>Encontradas</ThemedText>
            </View>
            {/* Estadística de reuniones exitosas facilitadas */}
            <View style={styles.statItem}>
              <IconSymbol size={24} name="heart.fill" color="#FF9F43" />
              <ThemedText style={styles.statNumber}>0</ThemedText>
              <ThemedText style={styles.statLabel}>Reuniones</ThemedText>
            </View>
          </View>
        </View>

        {/* Sección para mostrar las mascotas registradas del usuario */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Mis Mascotas Registradas
          </ThemedText>

          {/* Estado vacío cuando no hay mascotas registradas */}
          <View style={styles.emptyState}>
            <IconSymbol size={50} name="pawprint.fill" color="#999" />
            <ThemedText style={styles.emptyText}>
              No tienes mascotas registradas
            </ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Registra tus mascotas para crear reportes más rápido
            </ThemedText>
            {/* Botón para agregar una nueva mascota */}
            <View style={styles.addButton}>
              <ThemedText style={styles.addButtonText}>
                + Agregar Mascota
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Sección del historial de actividad del usuario */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Historial de Actividad
          </ThemedText>

          {/* Estado vacío cuando no hay actividad reciente */}
          <View style={styles.emptyState}>
            <IconSymbol size={50} name="clock.fill" color="#999" />
            <ThemedText style={styles.emptyText}>
              Sin actividad reciente
            </ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Aquí verás tus reportes y interacciones
            </ThemedText>
          </View>
        </View>

        {/* Sección del menú de configuración */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Configuración
          </ThemedText>

          {/* Opción de configuración de notificaciones */}
          <View style={styles.menuItem}>
            <IconSymbol size={20} name="bell.fill" color="#666" />
            <ThemedText style={styles.menuText}>Notificaciones</ThemedText>
            <IconSymbol size={16} name="chevron.right" color="#999" />
          </View>

          {/* Opción de configuración de ubicación */}
          <View style={styles.menuItem}>
            <IconSymbol size={20} name="location.fill" color="#666" />
            <ThemedText style={styles.menuText}>Ubicación</ThemedText>
            <IconSymbol size={16} name="chevron.right" color="#999" />
          </View>

          {/* Opción de configuración de privacidad */}
          <View style={styles.menuItem}>
            <IconSymbol size={20} name="shield.fill" color="#666" />
            <ThemedText style={styles.menuText}>Privacidad</ThemedText>
            <IconSymbol size={16} name="chevron.right" color="#999" />
          </View>

          {/* Opción de ayuda y soporte */}
          <View style={styles.menuItem}>
            <IconSymbol
              size={20}
              name="questionmark.circle.fill"
              color="#666"
            />
            <ThemedText style={styles.menuText}>Ayuda y Soporte</ThemedText>
            <IconSymbol size={16} name="chevron.right" color="#999" />
          </View>
        </View>

        {/* Sección para cerrar sesión */}
        <View style={styles.section}>
          {/* Botón de cerrar sesión con estilo diferenciado */}
          <View style={[styles.menuItem, styles.logoutItem]}>
            <IconSymbol
              size={20}
              name="rectangle.portrait.and.arrow.right.fill"
              color="#FF6B6B"
            />
            <ThemedText style={[styles.menuText, styles.logoutText]}>
              Cerrar Sesión
            </ThemedText>
          </View>
        </View>
      </ScrollView>
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
    paddingBottom: 30, // Espaciado inferior
    borderBottomWidth: 1, // Línea divisoria inferior
    borderBottomColor: "#E9ECEF", // Color de la línea divisoria
  },
  // Contenedor circular para el avatar
  avatarContainer: {
    width: 100, // Ancho fijo
    height: 100, // Alto fijo
    borderRadius: 50, // Radio para hacer círculo perfecto
    backgroundColor: "#F8F9FA", // Color de fondo gris claro
    justifyContent: "center", // Centra verticalmente
    alignItems: "center", // Centra horizontalmente
    marginBottom: 15, // Espacio inferior
  },
  // Estilo para el nombre del usuario
  userName: {
    fontSize: 24, // Tamaño de fuente grande
    fontWeight: "bold", // Texto en negrita
    marginBottom: 5, // Pequeño espacio inferior
  },
  // Estilo para el email del usuario
  userEmail: {
    fontSize: 14, // Tamaño de fuente pequeño
    opacity: 0.6, // Transparencia para menor prominencia
  },
  // Contenedor del contenido desplazable
  content: {
    flex: 1, // Ocupa el espacio restante
    paddingHorizontal: 20, // Espaciado horizontal interno
  },
  // Estilo para cada sección de contenido
  section: {
    marginTop: 25, // Espacio superior entre secciones
  },
  // Estilo para los títulos de sección
  sectionTitle: {
    marginBottom: 15, // Espacio inferior
    color: "#333", // Color de texto oscuro
  },
  // Contenedor horizontal para las estadísticas
  statsContainer: {
    flexDirection: "row", // Disposición horizontal
    justifyContent: "space-around", // Distribución uniforme
    backgroundColor: "#F8F9FA", // Fondo gris claro
    borderRadius: 12, // Bordes redondeados
    padding: 20, // Espaciado interno
  },
  // Estilo para cada elemento de estadística
  statItem: {
    alignItems: "center", // Centra los elementos verticalmente
  },
  // Estilo para los números de estadística
  statNumber: {
    fontSize: 24, // Tamaño de fuente grande
    fontWeight: "bold", // Texto en negrita
    marginTop: 8, // Espacio superior
    marginBottom: 4, // Espacio inferior
  },
  // Estilo para las etiquetas de estadística
  statLabel: {
    fontSize: 12, // Tamaño de fuente pequeño
    opacity: 0.6, // Transparencia para menor prominencia
  },
  // Estilo para estados vacíos (sin contenido)
  emptyState: {
    alignItems: "center", // Centra horizontalmente
    padding: 40, // Espaciado interno generoso
    backgroundColor: "#F8F9FA", // Fondo gris claro
    borderRadius: 12, // Bordes redondeados
  },
  // Texto principal en estados vacíos
  emptyText: {
    fontSize: 16, // Tamaño de fuente mediano
    fontWeight: "600", // Peso de fuente semi-negrita
    marginTop: 15, // Espacio superior
  },
  // Texto secundario en estados vacíos
  emptySubtext: {
    fontSize: 14, // Tamaño de fuente pequeño
    opacity: 0.6, // Transparencia
    textAlign: "center", // Texto centrado
    marginTop: 8, // Espacio superior
    marginBottom: 20, // Espacio inferior
  },
  // Botón para agregar nueva mascota
  addButton: {
    backgroundColor: "#2E86AB", // Color azul de la marca
    paddingHorizontal: 20, // Espaciado horizontal interno
    paddingVertical: 10, // Espaciado vertical interno
    borderRadius: 8, // Bordes redondeados
  },
  // Texto del botón de agregar
  addButtonText: {
    color: "white", // Texto blanco
    fontSize: 14, // Tamaño de fuente pequeño
    fontWeight: "600", // Peso semi-negrita
  },
  // Estilo para elementos del menú
  menuItem: {
    flexDirection: "row", // Disposición horizontal
    alignItems: "center", // Centra verticalmente
    paddingVertical: 15, // Espaciado vertical interno
    paddingHorizontal: 15, // Espaciado horizontal interno
    backgroundColor: "#F8F9FA", // Fondo gris claro
    borderRadius: 8, // Bordes redondeados
    marginBottom: 8, // Espacio inferior entre elementos
  },
  // Texto de los elementos del menú
  menuText: {
    flex: 1, // Ocupa el espacio disponible
    fontSize: 16, // Tamaño de fuente mediano
    marginLeft: 15, // Espacio a la izquierda del ícono
  },
  // Estilo especial para el elemento de cerrar sesión
  logoutItem: {
    backgroundColor: "#FFF5F5", // Fondo rojizo claro
    borderWidth: 1, // Borde visible
    borderColor: "#FFE5E5", // Color del borde rojizo
  },
  // Texto del botón de cerrar sesión
  logoutText: {
    color: "#FF6B6B", // Color rojo para indicar acción destructiva
  },
});
