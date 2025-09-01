// Importamos React y los hooks necesarios
import React, { PropsWithChildren, useState } from "react";
// Importamos componentes de React Native para la interfaz
import { StyleSheet, TouchableOpacity } from "react-native";

// Importamos componentes personalizados del proyecto
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

/**
 * Componente Collapsible - Crea una sección expandible/colapsable
 * @param children - Contenido que se mostrará cuando esté expandido
 * @param title - Título que siempre se muestra en el encabezado
 */
export function Collapsible({
  children,
  title,
}: PropsWithChildren & { title: string }) {
  // Estado para controlar si el componente está abierto o cerrado
  const [isOpen, setIsOpen] = useState(false);

  // Obtiene el tema actual (claro u oscuro) con valor por defecto "light"
  const theme = useColorScheme() ?? "light";

  return (
    <ThemedView>
      {/* Encabezado clickeable que controla la expansión/colapso */}
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)} // Alterna entre abierto/cerrado
        activeOpacity={0.8} // Opacidad cuando se presiona
      >
        {/* Icono de chevron que rota según el estado */}
        <IconSymbol
          name="chevron.right"
          size={18}
          weight="medium"
          // Color del icono basado en el tema actual
          color={theme === "light" ? Colors.light.icon : Colors.dark.icon}
          // Rotación: 90° cuando está abierto, 0° cuando está cerrado
          style={{ transform: [{ rotate: isOpen ? "90deg" : "0deg" }] }}
        />

        {/* Título del componente collapsible */}
        <ThemedText type="defaultSemiBold">{title}</ThemedText>
      </TouchableOpacity>

      {/* Contenido que solo se muestra cuando isOpen es true */}
      {isOpen && <ThemedView style={styles.content}>{children}</ThemedView>}
    </ThemedView>
  );
}

// Estilos del componente
const styles = StyleSheet.create({
  // Estilo para el encabezado (título + icono)
  heading: {
    flexDirection: "row", // Elementos en fila horizontal
    alignItems: "center", // Centrados verticalmente
    gap: 6, // Espacio de 6px entre elementos
  },
  // Estilo para el contenido expandible
  content: {
    marginTop: 6, // Margen superior de 6px
    marginLeft: 24, // Indentación izquierda de 24px
  },
});
