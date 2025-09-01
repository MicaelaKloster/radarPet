import { Image } from "expo-image"; // Componente optimizado para mostrar imágenes
import { Platform, StyleSheet } from "react-native"; // Utilidades de React Native para detectar plataforma y estilos

import { Collapsible } from "@/components/Collapsible"; // Componente personalizado para secciones colapsables
import { ExternalLink } from "@/components/ExternalLink"; // Componente para enlaces externos
import ParallaxScrollView from "@/components/ParallaxScrollView"; // Componente de scroll con efecto parallax
import { ThemedText } from "@/components/ThemedText"; // Componente de texto que se adapta al tema
import { ThemedView } from "@/components/ThemedView"; // Componente de vista que se adapta al tema
import { IconSymbol } from "@/components/ui/IconSymbol"; // Componente para mostrar iconos multiplataforma

// Función principal que renderiza la pantalla de exploración/información
export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      // Colores de fondo del header según el tema
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      // Imagen/ícono que se muestra en el header con efecto parallax
      headerImage={
        <IconSymbol
          size={310} // Tamaño del ícono
          color="#808080" // Color gris del ícono
          name="chevron.left.forwardslash.chevron.right" // Ícono de código < / >
          style={styles.headerImage} // Estilos aplicados al ícono
        />
      }
    >
      {/* Contenedor del título principal */}
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Explore</ThemedText>
      </ThemedView>

      {/* Texto descriptivo de la aplicación */}
      <ThemedText>
        This app includes example code to help you get started.
      </ThemedText>

      {/* Sección colapsable: Explicación del enrutamiento basado en archivos */}
      <Collapsible title="File-based routing">
        <ThemedText>
          This app has two screens:{" "}
          <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText>{" "}
          and{" "}
          <ThemedText type="defaultSemiBold">app/(tabs)/explore.tsx</ThemedText>
        </ThemedText>
        <ThemedText>
          The layout file in{" "}
          <ThemedText type="defaultSemiBold">app/(tabs)/_layout.tsx</ThemedText>{" "}
          sets up the tab navigator.
        </ThemedText>
        {/* Enlace externo para más información */}
        <ExternalLink href="https://docs.expo.dev/router/introduction">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>

      {/* Sección colapsable: Soporte multiplataforma */}
      <Collapsible title="Android, iOS, and web support">
        <ThemedText>
          You can open this project on Android, iOS, and the web. To open the
          web version, press <ThemedText type="defaultSemiBold">w</ThemedText>{" "}
          in the terminal running this project.
        </ThemedText>
      </Collapsible>

      {/* Sección colapsable: Manejo de imágenes */}
      <Collapsible title="Images">
        <ThemedText>
          For static images, you can use the{" "}
          <ThemedText type="defaultSemiBold">@2x</ThemedText> and{" "}
          <ThemedText type="defaultSemiBold">@3x</ThemedText> suffixes to
          provide files for different screen densities
        </ThemedText>
        {/* Imagen de ejemplo del logo de React */}
        <Image
          source={require("@/assets/images/react-logo.png")}
          style={{ alignSelf: "center" }}
        />
        <ExternalLink href="https://reactnative.dev/docs/images">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>

      {/* Sección colapsable: Fuentes personalizadas */}
      <Collapsible title="Custom fonts">
        <ThemedText>
          Open <ThemedText type="defaultSemiBold">app/_layout.tsx</ThemedText>{" "}
          to see how to load{" "}
          <ThemedText style={{ fontFamily: "SpaceMono" }}>
            custom fonts such as this one.
          </ThemedText>
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/versions/latest/sdk/font">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>

      {/* Sección colapsable: Soporte de temas claro/oscuro */}
      <Collapsible title="Light and dark mode components">
        <ThemedText>
          This template has light and dark mode support. The{" "}
          <ThemedText type="defaultSemiBold">useColorScheme()</ThemedText> hook
          lets you inspect what the user&apos;s current color scheme is, and so
          you can adjust UI colors accordingly.
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>

      {/* Sección colapsable: Animaciones */}
      <Collapsible title="Animations">
        <ThemedText>
          This template includes an example of an animated component. The{" "}
          <ThemedText type="defaultSemiBold">
            components/HelloWave.tsx
          </ThemedText>{" "}
          component uses the powerful{" "}
          <ThemedText type="defaultSemiBold">
            react-native-reanimated
          </ThemedText>{" "}
          library to create a waving hand animation.
        </ThemedText>
        {/* Contenido específico para iOS sobre el efecto parallax */}
        {Platform.select({
          ios: (
            <ThemedText>
              The{" "}
              <ThemedText type="defaultSemiBold">
                components/ParallaxScrollView.tsx
              </ThemedText>{" "}
              component provides a parallax effect for the header image.
            </ThemedText>
          ),
        })}
      </Collapsible>
    </ParallaxScrollView>
  );
}

// Estilos del componente
const styles = StyleSheet.create({
  // Estilos para el ícono del header
  headerImage: {
    color: "#808080", // Color gris
    bottom: -90, // Posición desde abajo
    left: -35, // Posición desde la izquierda
    position: "absolute", // Posicionamiento absoluto
  },
  // Estilos para el contenedor del título
  titleContainer: {
    flexDirection: "row", // Disposición horizontal
    gap: 8, // Espacio entre elementos
  },
});
