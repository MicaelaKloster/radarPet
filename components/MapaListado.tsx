import { supabase } from "@/lib/supabase";
import { Image } from "expo-image";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import patita_roja from "../Iconos/patita_roja.png";
import patita_verde from "../Iconos/patita_verde.png";

export type ReportMarker = {
  id: string;
  lat: number;
  lng: number;
  tipo: "perdida" | "encontrada";
  titulo?: string | null;
  fotoUrl?: string | null;
};

// ---------------------------
// 🔥 Parser correcto: WKB HEX
// ---------------------------
function parseWKBPoint(wkb?: string | null): { lat: number; lng: number } | null {
  if (!wkb || wkb.length < 32) return null;

  try {
    const coordsHex = wkb.slice(-32);
    const xHex = coordsHex.slice(0, 16);
    const yHex = coordsHex.slice(16, 32);

    const hexToDouble = (hex: string): number => {
      const buffer = new ArrayBuffer(8);
      const view = new DataView(buffer);
      for (let i = 0; i < 8; i++) {
        view.setUint8(i, parseInt(hex.substr(i * 2, 2), 16));
      }
      return view.getFloat64(0, true);
    };

    const lng = hexToDouble(xHex);
    const lat = hexToDouble(yHex);

    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

    return { lat, lng };
  } catch (e) {
    console.error("❌ Error parseando WKB:", e);
    return null;
  }
}

// Icono personalizado
function CustomPin({ tipo }: { tipo: "perdida" | "encontrada" }) {
  const source = tipo === "perdida" ? patita_roja : patita_verde;
  return <Image source={source} style={{ width: 36, height: 36 }} />;
}

export default function MapaListado({ height }: { height?: number }) {
  const router = useRouter();
  const mapRef = useRef<MapView | null>(null);

  const [loading, setLoading] = useState(true);
  const [markers, setMarkers] = useState<ReportMarker[]>([]);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Ubicación del usuario
  useEffect(() => {
    const loadUserLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      }
    };
    loadUserLocation();
  }, []);

  // Cargar marcadores
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const [tipoPerdidaRes, tipoEncontradaRes] = await Promise.all([
          supabase.from("tipos_reportes").select("id").eq("nombre", "perdida").maybeSingle(),
          supabase.from("tipos_reportes").select("id").eq("nombre", "encontrada").maybeSingle(),
        ]);

        const perdidaId = tipoPerdidaRes.data?.id;
        const encontradaId = tipoEncontradaRes.data?.id;

        const tiposIds = [perdidaId, encontradaId].filter(Boolean);

        const { data: reportes, error } = await supabase
          .from("reportes")
          .select("id,tipo_id,ubicacion,titulo")
          .eq("estado", "AC")
          .in("tipo_id", tiposIds)
          .limit(500);

        if (error) throw error;

        // Fotos
        const { data: fotos } = await supabase
          .from("fotos_reportes")
          .select("reporte_id,ruta_storage")
          .eq("estado", "AC");

        const fotoMap = new Map<string, string>();
        const BUCKET = "reportes-fotos";

        fotos?.forEach((f) => {
          if (!fotoMap.has(String(f.reporte_id))) {
            const { data: pub } = supabase.storage
              .from(BUCKET)
              .getPublicUrl(f.ruta_storage);
            fotoMap.set(String(f.reporte_id), pub?.publicUrl ?? null);
          }
        });

        const items: ReportMarker[] = [];

        reportes?.forEach((r) => {
          const point = parseWKBPoint(r.ubicacion);
          if (!point) return;

          const tipo = r.tipo_id === perdidaId ? "perdida" : "encontrada";

          items.push({
            id: String(r.id),
            lat: point.lat,
            lng: point.lng,
            tipo,
            titulo: r.titulo,
            fotoUrl: fotoMap.get(String(r.id)) ?? null,
          });
        });

        setMarkers(items);
      } catch (e) {
        console.error("❌ Error cargando marcadores:", e);
      } finally {
        setLoading(false);
      }
    };

    load();

    const channel = supabase
      .channel("reportes-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "reportes" }, () => {
        load();
      })
      .subscribe();

    return () => channel.unsubscribe();
  }, []);

  const initialRegion = useMemo(() => {
    if (userLocation) {
      return {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }
    return {
      latitude: -31.4201,
      longitude: -64.1888,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    };
  }, [userLocation]);

  return (
    <View style={[styles.container, height ? { height } : { flex: 1 }]}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {markers.map((m) => (
          <Marker
            key={m.id}
            coordinate={{ latitude: m.lat, longitude: m.lng }}
            title={m.titulo ?? (m.tipo === "perdida" ? "Mascota perdida" : "Mascota encontrada")}
            anchor={{ x: 0.5, y: 1 }}
            onCalloutPress={() => router.push("/explore")}
          >
            <CustomPin tipo={m.tipo} />
          </Marker>
        ))}
      </MapView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" />
        </View>
      )}

      <View style={styles.markerCount}>
        <Text style={styles.markerCountText}>{markers.length} reportes</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%" },
  loadingOverlay: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 8,
    borderRadius: 8,
  },
  markerCount: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 8,
    borderRadius: 8,
  },
  markerCountText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
});

