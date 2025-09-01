// Importaciones necesarias para React y componentes de React Native
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
// Componentes personalizados de la aplicación
import { ThemedText } from "@/components/ThemedText"; // Texto que se adapta al tema claro/oscuro
import { ThemedView } from "@/components/ThemedView"; // Vista que se adapta al tema claro/oscuro
import { IconSymbol } from "@/components/ui/IconSymbol"; // Componente para mostrar íconos

// Componente principal para reportar mascotas encontradas
export default function ReportFoundScreen() {
  return (
    // Contenedor principal que ocupa toda la pantalla
    <ThemedView style={styles.container}>
      {/* Sección del encabezado con información sobre la funcionalidad */}
      <ThemedView style={styles.header}>
        {/* Ícono representativo de éxito/confirmación para mascotas encontradas */}
        <IconSymbol size={40} name="checkmark.circle.fill" color="#4ECDC4" />
        {/* Título principal de la pantalla */}
        <ThemedText type="title" style={styles.title}>
          Reportar Mascota Encontrada
        </ThemedText>
        {/* Texto explicativo para guiar al usuario */}
        <ThemedText style={styles.subtitle}>
          Ayuda a reunir una mascota con su familia proporcionando detalles del
          hallazgo
        </ThemedText>
      </ThemedView>

      {/* Vista desplazable para el formulario completo */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Primera sección: Descripción de la mascota encontrada */}
        <View style={styles.formSection}>
          {/* Título de la sección */}
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Descripción de la Mascota
          </ThemedText>

          {/* Campo para el tipo de mascota */}
          <View style={styles.formField}>
            <ThemedText style={styles.fieldLabel}>Tipo de mascota</ThemedText>
            {/* Placeholder visual del campo de entrada */}
            <View style={styles.inputPlaceholder}>
              <ThemedText style={styles.placeholderText}>
                Perro, Gato, Otro...
              </ThemedText>
            </View>
          </View>

          {/* Campo para el tamaño aproximado */}
          <View style={styles.formField}>
            <ThemedText style={styles.fieldLabel}>Tamaño aproximado</ThemedText>
            <View style={styles.inputPlaceholder}>
              <ThemedText style={styles.placeholderText}>
                Pequeño, Mediano, Grande
              </ThemedText>
            </View>
          </View>

          {/* Campo de texto largo para características físicas */}
          <View style={styles.formField}>
            <ThemedText style={styles.fieldLabel}>
              Color y características
            </ThemedText>
            {/* Placeholder más grande para texto largo */}
            <View style={[styles.inputPlaceholder, styles.textAreaPlaceholder]}>
              <ThemedText style={styles.placeholderText}>
                Describe el color, raza aparente, collar, señas particulares...
              </ThemedText>
            </View>
          </View>

          {/* Campo para el estado de salud de la mascota */}
          <View style={styles.formField}>
            <ThemedText style={styles.fieldLabel}>
              Estado de la mascota
            </ThemedText>
            <View style={styles.inputPlaceholder}>
              <ThemedText style={styles.placeholderText}>
                Saludable, herida, asustada, etc.
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Segunda sección: Información del hallazgo */}
        <View style={styles.formSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Información del Hallazgo
          </ThemedText>

          {/* Campo para la ubicación donde se encontró */}
          <View style={styles.formField}>
            <ThemedText style={styles.fieldLabel}>
              Ubicación donde la encontraste
            </ThemedText>
            <View style={styles.inputPlaceholder}>
              <ThemedText style={styles.placeholderText}>
                Dirección exacta o punto de referencia
              </ThemedText>
            </View>
          </View>

          {/* Campo para fecha y hora del hallazgo */}
          <View style={styles.formField}>
            <ThemedText style={styles.fieldLabel}>
              Fecha y hora del hallazgo
            </ThemedText>
            <View style={styles.inputPlaceholder}>
              <ThemedText style={styles.placeholderText}>
                ¿Cuándo la encontraste?
              </ThemedText>
            </View>
          </View>

          {/* Campo para la ubicación actual de la mascota */}
          <View style={styles.formField}>
            <ThemedText style={styles.fieldLabel}>
              ¿Dónde está ahora la mascota?
            </ThemedText>
            <View style={styles.inputPlaceholder}>
              <ThemedText style={styles.placeholderText}>
                En mi casa, veterinaria, refugio...
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Tercera sección: Carga de fotografía */}
        <View style={styles.photoSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Fotografía
          </ThemedText>
          {/* Área de carga de foto con estilo especial */}
          <View style={styles.photoPlaceholder}>
            {/* Ícono de cámara */}
            <IconSymbol size={50} name="camera.fill" color="#999" />
            {/* Texto principal del área de carga */}
            <ThemedText style={styles.photoText}>
              Agregar foto de la mascota
            </ThemedText>
            {/* Texto explicativo sobre la importancia de la foto */}
            <ThemedText style={styles.photoSubtext}>
              Una foto ayudará al dueño a identificar si es su mascota
            </ThemedText>
          </View>
        </View>

        {/* Cuarta sección: Información de contacto (destacada con fondo especial) */}
        <View style={styles.contactSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Información de Contacto
          </ThemedText>

          {/* Campo para el nombre del usuario que encontró la mascota */}
          <View style={styles.formField}>
            <ThemedText style={styles.fieldLabel}>Tu nombre</ThemedText>
            <View style={styles.inputPlaceholder}>
              <ThemedText style={styles.placeholderText}>
                ¿Cómo te pueden contactar?
              </ThemedText>
            </View>
          </View>

          {/* Campo para el teléfono de contacto */}
          <View style={styles.formField}>
            <ThemedText style={styles.fieldLabel}>
              Teléfono de contacto
            </ThemedText>
            <View style={styles.inputPlaceholder}>
              <ThemedText style={styles.placeholderText}>
                Número para coordinar la entrega
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Sección del botón de envío */}
        <View style={styles.buttonContainer}>
          {/* Botón principal para publicar el hallazgo */}
          <View style={styles.submitButton}>
            <ThemedText style={styles.submitButtonText}>
              Publicar Hallazgo
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
    paddingBottom: 20, // Espaciado inferior
  },
  // Estilo para el título principal (color verde para mascotas encontradas)
  title: {
    fontSize: 24, // Tamaño de fuente grande
    fontWeight: "bold", // Texto en negrita
    color: "#4ECDC4", // Color verde azulado característico para mascotas encontradas
    marginTop: 10, // Espacio superior después del ícono
    textAlign: "center", // Texto centrado
  },
  // Estilo para el subtítulo explicativo
  subtitle: {
    fontSize: 14, // Tamaño de fuente pequeño
    marginTop: 10, // Espacio superior
    opacity: 0.7, // Transparencia para menor prominencia
    textAlign: "center", // Texto centrado
    paddingHorizontal: 10, // Espaciado horizontal para evitar que toque los bordes
  },
  // Contenedor del contenido desplazable
  content: {
    flex: 1, // Ocupa el espacio restante
    paddingHorizontal: 20, // Espaciado horizontal interno
  },
  // Estilo para cada sección del formulario
  formSection: {
    marginBottom: 25, // Espacio inferior entre secciones
  },
  // Sección especial para información de contacto con fondo destacado
  contactSection: {
    marginBottom: 25, // Espacio inferior entre secciones
    backgroundColor: "#F0F8FF", // Fondo azul muy claro para destacar
    padding: 15, // Espaciado interno
    borderRadius: 12, // Bordes redondeados
  },
  // Estilo para los títulos de cada sección
  sectionTitle: {
    marginBottom: 15, // Espacio inferior antes de los campos
    color: "#333", // Color de texto oscuro
  },
  // Contenedor individual para cada campo del formulario
  formField: {
    marginBottom: 15, // Espacio inferior entre campos
  },
  // Estilo para las etiquetas de los campos
  fieldLabel: {
    fontSize: 16, // Tamaño de fuente mediano
    fontWeight: "600", // Peso semi-negrita
    marginBottom: 8, // Espacio inferior antes del campo
  },
  // Placeholder visual para los campos de entrada
  inputPlaceholder: {
    backgroundColor: "#F8F9FA", // Fondo gris muy claro
    borderRadius: 8, // Bordes redondeados
    padding: 15, // Espaciado interno
    borderWidth: 1, // Borde visible
    borderColor: "#E9ECEF", // Color del borde gris claro
  },
  // Modificador para campos de texto largo (textarea)
  textAreaPlaceholder: {
    minHeight: 80, // Altura mínima mayor para texto largo
  },
  // Estilo para el texto placeholder dentro de los campos
  placeholderText: {
    color: "#6C757D", // Color gris para texto de ayuda
    fontSize: 14, // Tamaño de fuente pequeño
  },
  // Sección especial para la carga de fotos
  photoSection: {
    marginBottom: 30, // Espacio inferior mayor
  },
  // Área de carga de fotos con estilo especial
  photoPlaceholder: {
    backgroundColor: "#F8F9FA", // Fondo gris claro
    borderRadius: 12, // Bordes más redondeados
    padding: 40, // Espaciado interno generoso
    alignItems: "center", // Centra horizontalmente
    borderWidth: 2, // Borde más grueso
    borderColor: "#E9ECEF", // Color del borde
    borderStyle: "dashed", // Estilo de borde punteado
  },
  // Texto principal del área de carga de fotos
  photoText: {
    fontSize: 16, // Tamaño de fuente mediano
    fontWeight: "600", // Peso semi-negrita
    marginTop: 10, // Espacio superior después del ícono
  },
  // Texto explicativo del área de carga de fotos
  photoSubtext: {
    fontSize: 12, // Tamaño de fuente pequeño
    opacity: 0.6, // Transparencia
    textAlign: "center", // Texto centrado
    marginTop: 5, // Pequeño espacio superior
  },
  // Contenedor del botón de envío
  buttonContainer: {
    paddingBottom: 30, // Espacio inferior para evitar que toque el borde
  },
  // Botón principal de envío del formulario
  submitButton: {
    backgroundColor: "#4ECDC4", // Color verde azulado que coincide con el tema de mascotas encontradas
    borderRadius: 12, // Bordes redondeados
    padding: 18, // Espaciado interno generoso
    alignItems: "center", // Centra el texto horizontalmente
  },
  // Texto del botón de envío
  submitButtonText: {
    color: "white", // Texto blanco para contraste
    fontSize: 16, // Tamaño de fuente mediano
    fontWeight: "bold", // Texto en negrita
  },
});
