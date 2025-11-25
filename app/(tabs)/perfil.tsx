import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ThemeSelector from "@/components/ThemeSelector";

import Encabezado from "../perfil/encabezado";
import HistorialActividad from "../perfil/historial-actividad";
import MisMascotas from "../perfil/mis-mascotas";

type Mascota = {
  id: string;
  nombre: string;
  fotoPrincipalUrl: string | null;
  especieId: number | null;
  raza: string | null;
  tamanioId: number | null;
  sexoId: number | null;
  color: string | null;
  seniasParticulares: string | null;
};

export default function ProfileScreen() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [nombre, setNombre] = useState<string>("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [loggingOut, setLoggingOut] = useState(false);

  const [stats, setStats] = useState({
    perdidas: 0,
    encontradas: 0,
    reuniones: 0,
    loading: true,
  });

  const router = useRouter();
  const { isDark } = useTheme();

  const recargarMascotas = async (uid?: string) => {
    const id = uid || userId;
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from("mascotas")
        .select(
          "id, nombre, foto_principal_url, especie_id, raza, tamanio_id, sexo_id, color, senias_particulares"
        )
        .eq("estado", "AC")
        .eq("duenio_id", id);

      if (error) throw error;

      setMascotas(
        (data || []).map((m) => ({
          id: m.id,
          nombre: m.nombre,
          fotoPrincipalUrl: m.foto_principal_url,
          especieId: m.especie_id,
          raza: m.raza,
          tamanioId: m.tamanio_id,
          sexoId: m.sexo_id,
          color: m.color,
          seniasParticulares: m.senias_particulares,
        }))
      );
    } catch (error) {
      console.error("Error recargando mascotas:", error);
    }
  };

  useEffect(() => {
    const loadCounts = async (userId: string) => {
      try {
        setStats((prev) => ({ ...prev, loading: true }));

        const [tipoPerdidaRes, tipoEncontradaRes, estadosCierre] =
          await Promise.all([
            supabase
              .from("tipos_reportes")
              .select("id")
              .eq("nombre", "perdida")
              .eq("estado", "AC")
              .maybeSingle(),
            supabase
              .from("tipos_reportes")
              .select("id")
              .eq("nombre", "encontrada")
              .eq("estado", "AC")
              .maybeSingle(),
            supabase
              .from("estados_reportes")
              .select("id,nombre")
              .in("nombre", ["cerrado", "resuelto", "reunido"])
              .eq("estado", "AC"),
          ]);

        const tipoPerdidaId = (tipoPerdidaRes.data as any)?.id || null;
        const tipoEncontradaId = (tipoEncontradaRes.data as any)?.id || null;
        const estadosCierreIds =
          (estadosCierre.data as any[])?.map((r) => r.id) || [];

        const [perdidasCntRes, encontradasCntRes, reunionesCntRes] =
          await Promise.all([
            tipoPerdidaId
              ? supabase
                  .from("reportes")
                  .select("id", { count: "exact", head: true })
                  .eq("estado", "AC")
                  .eq("reportero_id", userId)
                  .eq("tipo_id", tipoPerdidaId)
              : Promise.resolve({ count: 0 } as any),
            tipoEncontradaId
              ? supabase
                  .from("reportes")
                  .select("id", { count: "exact", head: true })
                  .eq("estado", "AC")
                  .eq("reportero_id", userId)
                  .eq("tipo_id", tipoEncontradaId)
              : Promise.resolve({ count: 0 } as any),
            estadosCierreIds.length
              ? supabase
                  .from("reportes")
                  .select("id", { count: "exact", head: true })
                  .eq("estado", "AC")
                  .eq("reportero_id", userId)
                  .in("estado_id", estadosCierreIds)
              : Promise.resolve({ count: 0 } as any),
          ]);

        setStats({
          perdidas: (perdidasCntRes as any)?.count ?? 0,
          encontradas: (encontradasCntRes as any)?.count ?? 0,
          reuniones: (reunionesCntRes as any)?.count ?? 0,
          loading: false,
        });
      } catch (e) {
        console.warn("[Perfil] Error cargando contadores:", e);
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };

    const loadUserData = async (user: any) => {
      try {
        const { data: perfil } = await supabase
          .from("perfiles")
          .select("nombre, avatar_url")
          .eq("id", user.id)
          .maybeSingle();

        if (perfil) {
          setNombre(perfil.nombre || "");
          setAvatarUri(perfil.avatar_url || null);
        }
      } catch (error) {
        console.error("Error cargando datos del perfil:", error);
      }
    };

    const load = async () => {
      const sessRes: any = await supabase.auth.getSession();
      let user = sessRes?.data?.session?.user ?? null;

      if (!user) {
        const { data: u } = await supabase.auth.getUser();
        user = u?.user ?? null;
      }

      setUserEmail(user?.email ?? null);
      setUserId(user?.id ?? null);

      if (user) {
        await loadUserData(user);
        await Promise.all([loadCounts(user.id), recargarMascotas(user.id)]);
      } else {
        setStats({ perdidas: 0, encontradas: 0, reuniones: 0, loading: false });
        setMascotas([]);
      }
    };

    load();
  }, []);

  const handleAvatarChange = (newUrl: string) => {
    setAvatarUri(newUrl);
  };

  const logout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace("/(auth)/login");
    } catch (error: any) {
      Alert.alert("Error", error.message);
      setLoggingOut(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Encabezado
        nombre={nombre}
        email={userEmail}
        avatarUri={avatarUri}
        userId={userId}
        onAvatarChange={handleAvatarChange}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: isDark ? "#fff" : "#333" }]}
          >
            Mis Reportes
          </Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <IconSymbol
                size={24}
                name="exclamationmark.triangle.fill"
                color="#FF6B6B"
              />
              <ThemedText style={styles.statNumber}>
                {stats.loading ? "..." : String(stats.perdidas)}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Perdidas</ThemedText>
            </View>
            <View style={styles.statItem}>
              <IconSymbol
                size={24}
                name="checkmark.circle.fill"
                color="#4ECDC4"
              />
              <ThemedText style={styles.statNumber}>
                {stats.loading ? "..." : String(stats.encontradas)}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Encontradas</ThemedText>
            </View>
            <View style={styles.statItem}>
              <IconSymbol size={24} name="heart.fill" color="#FF9F43" />
              <ThemedText style={styles.statNumber}>
                {stats.loading ? "..." : String(stats.reuniones)}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Reuniones</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          {userId && (
            <MisMascotas
              mascotas={mascotas}
              setMascotas={setMascotas}
              userId={userId}
              recargarMascotas={recargarMascotas}
            />
          )}
        </View>

        <View style={styles.section}>
          {userId && <HistorialActividad userId={userId} />}
        </View>

        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: isDark ? "#fff" : "#333" }]}
          >
            Configuración
          </Text>

          <ThemeSelector />

          <View style={styles.menuItem}>
            <TouchableOpacity
              style={{ flexDirection: "row", flex: 1, alignItems: "center" }}
              onPress={() => router.push("/perfil/soporte")}
            >
              <IconSymbol
                size={20}
                name="questionmark.circle.fill"
                color="#666"
              />
              <ThemedText style={styles.menuText}>Ayuda y Soporte</ThemedText>
              <IconSymbol size={16} name="chevron.right" color="#999" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={[styles.menuItem, styles.logoutItem]}>
            <TouchableOpacity
              style={{ flexDirection: "row", flex: 1, alignItems: "center" }}
              onPress={logout}
              disabled={loggingOut}
            >
              <IconSymbol
                size={20}
                name="rectangle.portrait.and.arrow.right.fill"
                color={loggingOut ? "#ccc" : "#FF6B6B"}
              />
              <ThemedText style={[styles.menuText, styles.logoutText]}>
                {loggingOut ? "Cerrando..." : "Cerrar Sesión"}
              </ThemedText>
              {loggingOut && <ActivityIndicator size="small" />}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  content: { flex: 1, paddingHorizontal: 20 },
  section: { marginTop: 25 },
  sectionTitle: { marginBottom: 15, fontSize: 20, fontWeight: "bold" },

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 20,
  },
  statItem: { alignItems: "center" },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 4,
    marginBottom: 4,
  },
  statLabel: { fontSize: 12, opacity: 0.6 },

  emptyState: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
  },
  emptyText: { fontSize: 16, fontWeight: "600", marginTop: 15 },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    marginBottom: 8,
  },
  menuText: { flex: 1, fontSize: 16, marginLeft: 15 },
  logoutItem: {
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#FFE5E5",
  },
  logoutText: { color: "#FF6B6B" },

  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ECEFF1",
  },
  activityTitle: { fontSize: 14, fontWeight: "600" },
  activitySubtitle: { fontSize: 12, opacity: 0.7 },
  activityDate: { fontSize: 10, opacity: 0.6, marginLeft: 8 },
});
