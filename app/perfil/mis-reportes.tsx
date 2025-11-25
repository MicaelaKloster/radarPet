import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { supabase } from "@/lib/supabase";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

type Reporte = {
  id: string;
  titulo: string;
  tipo: string;
  estado: string;
  created_at: string;
};

export default function MisReportes() {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarReportes();
  }, []);

  const cargarReportes = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("reportes")
        .select(
          `
          id,
          titulo,
          created_at,
          tipos_reportes(nombre),
          estados_reportes(nombre)
        `
        )
        .eq("reportero_id", user.id)
        .eq("estado", "AC")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const reportesFormateados = (data || []).map((r: any) => ({
        id: r.id,
        titulo: r.titulo,
        tipo: r.tipos_reportes?.nombre || "desconocido",
        estado: r.estados_reportes?.nombre || "abierto",
        created_at: r.created_at,
      }));

      setReportes(reportesFormateados);
    } catch (error) {
      console.error("Error cargando reportes:", error);
    } finally {
      setLoading(false);
    }
  };

  const marcarComoResuelto = async (reporteId: string, titulo: string) => {
    Alert.alert(
      "Marcar como resuelto",
      "¿Estás seguro de que quieres marcar este reporte como resuelto?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, resolver",
          onPress: async () => {
            try {
              const { data: estadoResuelto } = await supabase
                .from("estados_reportes")
                .select("id")
                .eq("nombre", "resuelto")
                .eq("estado", "AC")
                .single();

              if (!estadoResuelto) throw new Error("Estado no encontrado");

              const { error } = await supabase
                .from("reportes")
                .update({ estado_id: estadoResuelto.id })
                .eq("id", reporteId);

              if (error) throw error;

              Alert.alert(
                "¡Éxito!",
                "El reporte ha sido marcado como resuelto"
              );
              cargarReportes();
            } catch (error: any) {
              Alert.alert("Error", error.message);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color="#4ECDC4" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Mis Reportes
      </ThemedText>

      <ScrollView style={styles.content}>
        {reportes.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol size={50} name="doc.plaintext" color="#999" />
            <ThemedText style={styles.emptyText}>No tienes reportes</ThemedText>
          </View>
        ) : (
          reportes.map((reporte) => (
            <View key={reporte.id} style={styles.reporteCard}>
              <View style={styles.reporteHeader}>
                <IconSymbol
                  size={24}
                  name={
                    reporte.tipo === "perdida"
                      ? "exclamationmark.circle.fill"
                      : "checkmark.circle.fill"
                  }
                  color={reporte.tipo === "perdida" ? "#FF6B6B" : "#4ECDC4"}
                />
                <View style={styles.reporteInfo}>
                  <ThemedText style={styles.reporteTitulo}>
                    {reporte.titulo}
                  </ThemedText>
                  <ThemedText style={styles.reporteEstado}>
                    Estado: {reporte.estado}
                  </ThemedText>
                </View>
              </View>

              {reporte.estado !== "resuelto" &&
                reporte.estado !== "cerrado" && (
                  <TouchableOpacity
                    style={styles.botonResolver}
                    onPress={() =>
                      marcarComoResuelto(reporte.id, reporte.titulo)
                    }
                  >
                    <ThemedText style={styles.textoBotonResolver}>
                      Marcar como resuelto
                    </ThemedText>
                  </TouchableOpacity>
                )}
            </View>
          ))
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  content: { flex: 1 },
  emptyState: { alignItems: "center", padding: 40 },
  emptyText: { fontSize: 16, marginTop: 10 },
  reporteCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  reporteHeader: { flexDirection: "row", alignItems: "center" },
  reporteInfo: { flex: 1, marginLeft: 12 },
  reporteTitulo: { fontSize: 16, fontWeight: "600" },
  reporteEstado: { fontSize: 14, opacity: 0.7, marginTop: 4 },
  botonResolver: {
    backgroundColor: "#4ECDC4",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    alignItems: "center",
  },
  textoBotonResolver: { color: "#fff", fontWeight: "600" },
});
