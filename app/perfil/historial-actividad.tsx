import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/lib/supabase";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type ActividadItem = {
  id: string;
  tipo:
    | "reporte_perdida"
    | "reporte_encontrada"
    | "reporte_resuelto"
    | "seguimiento"
    | "mascota";
  titulo: string;
  subtitulo?: string;
  fecha: string;
  icono: string;
  color: string;
};

type Props = {
  userId: string;
};

export default function HistorialActividad({ userId }: Props) {
  const { isDark } = useTheme();
  const [actividades, setActividades] = useState<ActividadItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      cargarActividades();
    }
  }, [userId]);

  const cargarActividades = async () => {
    try {
      setLoading(true);
      const items: ActividadItem[] = [];

      const { data: reportes } = await supabase
        .from("reportes")
        .select(
          `
          id,
          titulo,
          creado_en,
          actualizado_en,
          tipos_reportes!inner(nombre),
          estados_reportes!inner(nombre),
          mascota:mascota_id(nombre)
        `
        )
        .eq("reportero_id", userId)
        .eq("estado", "AC")
        .order("creado_en", { ascending: false })
        .limit(30);

      reportes?.forEach((r: any) => {
        const tipoReporte = r.tipos_reportes?.nombre;
        const estadoReporte = r.estados_reportes?.nombre;
        const nombreMascota = r.mascota?.nombre || "una mascota";

        if (tipoReporte === "perdida") {
          items.push({
            id: `reporte-perdida-${r.id}`,
            tipo: "reporte_perdida",
            titulo: `Reportaste a ${nombreMascota} como perdida`,
            subtitulo: r.titulo,
            fecha: r.creado_en,
            icono: "exclamationmark.triangle.fill",
            color: "#FF6B6B",
          });
        } else if (tipoReporte === "encontrada") {
          items.push({
            id: `reporte-encontrada-${r.id}`,
            tipo: "reporte_encontrada",
            titulo: `Reportaste haber encontrado a ${nombreMascota}`,
            subtitulo: r.titulo,
            fecha: r.creado_en,
            icono: "checkmark.circle.fill",
            color: "#4ECDC4",
          });
        }

        if (
          (estadoReporte === "resuelto" || estadoReporte === "cerrado") &&
          r.actualizado_en !== r.creado_en
        ) {
          items.push({
            id: `reporte-resuelto-${r.id}`,
            tipo: "reporte_resuelto",
            titulo: `Marcaste como resuelto: ${nombreMascota}`,
            subtitulo: `¡Felicitaciones por resolver el caso!`,
            fecha: r.actualizado_en,
            icono: "heart.fill",
            color: "#79cb43",
          });
        }
      });

      const { data: seguimientos } = await supabase
        .from("seguimientos")
        .select(
          `
          id,
          creado_en,
          reporte:reporte_id(
            titulo,
            mascota:mascota_id(nombre)
          )
        `
        )
        .eq("usuario_id", userId)
        .eq("estado", "AC")
        .order("creado_en", { ascending: false })
        .limit(20);

      seguimientos?.forEach((s: any) => {
        const nombreMascota = s.reporte?.mascota?.nombre || "una mascota";
        items.push({
          id: `seguimiento-${s.id}`,
          tipo: "seguimiento",
          titulo: `Comenzaste a seguir el caso de ${nombreMascota}`,
          subtitulo: s.reporte?.titulo || "Reporte",
          fecha: s.creado_en,
          icono: "bell.fill",
          color: "#A78BFA",
        });
      });

      const { data: mascotas } = await supabase
        .from("mascotas")
        .select("id, nombre, creado_en, especie:especie_id(nombre)")
        .eq("duenio_id", userId)
        .eq("estado", "AC")
        .order("creado_en", { ascending: false })
        .limit(20);

      mascotas?.forEach((m: any) => {
        const especie = m.especie?.nombre || "mascota";
        items.push({
          id: `mascota-${m.id}`,
          tipo: "mascota",
          titulo: `Registraste a ${m.nombre}`,
          subtitulo: `Tu ${especie.toLowerCase()} ahora está en el sistema`,
          fecha: m.creado_en,
          icono: "pawprint.fill",
          color: "#4ECDC4",
        });
      });

      items.sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );

      setActividades(items.slice(0, 20));
    } catch (error) {
      console.error("Error cargando historial:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Hace un momento";
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays === 1) return "Ayer";
    if (diffDays < 7) return `Hace ${diffDays} días`;

    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: diffDays > 365 ? "numeric" : undefined,
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={[styles.titulo, { color: isDark ? "#fff" : "#333" }]}>
          Historial de Actividad
        </Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#4ECDC4" />
          <ThemedText style={styles.loadingText}>
            Cargando actividad...
          </ThemedText>
        </View>
      </View>
    );
  }

  if (actividades.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={[styles.titulo, { color: isDark ? "#fff" : "#333" }]}>
          Historial de Actividad
        </Text>
        <View style={styles.emptyState}>
          <IconSymbol size={50} name="clock.fill" color="#999" />
          <ThemedText style={styles.emptyText}>
            Sin actividad reciente
          </ThemedText>
          <ThemedText style={styles.emptySubtext}>
            Aquí verás tus reportes y acciones
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.titulo, { color: isDark ? "#fff" : "#333" }]}>
        Historial de Actividad
      </Text>

      <ScrollView style={styles.lista} showsVerticalScrollIndicator={false}>
        {actividades.map((item, index) => (
          <View key={item.id} style={styles.activityItem}>
            {/* Línea vertical conectora */}
            {index < actividades.length - 1 && (
              <View style={styles.lineaConectora} />
            )}

            {/* Icono con círculo de color */}
            <View
              style={[styles.iconoContainer, { backgroundColor: item.color }]}
            >
              <IconSymbol size={16} name={item.icono as any} color="#fff" />
            </View>

            {/* Contenido */}
            <View style={styles.contenido}>
              <ThemedText style={styles.activityTitulo}>
                {item.titulo}
              </ThemedText>

              {item.subtitulo && (
                <ThemedText style={styles.activitySubtitulo}>
                  {item.subtitulo}
                </ThemedText>
              )}

              <ThemedText style={styles.activityFecha}>
                {formatearFecha(item.fecha)}
              </ThemedText>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 25,
  },
  titulo: {
    marginBottom: 15,
    fontSize: 20,
    fontWeight: "bold",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    opacity: 0.6,
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: "center",
    marginTop: 8,
  },
  lista: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 15,
  },
  activityItem: {
    flexDirection: "row",
    marginBottom: 20,
    position: "relative",
  },
  lineaConectora: {
    position: "absolute",
    left: 11,
    top: 30,
    width: 2,
    height: "100%",
    backgroundColor: "#E9ECEF",
  },
  iconoContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    zIndex: 1,
  },
  contenido: {
    flex: 1,
    paddingBottom: 4,
  },
  activityTitulo: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  activitySubtitulo: {
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 4,
  },
  activityFecha: {
    fontSize: 11,
    opacity: 0.5,
  },
});
