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

function parseWKBPoint(
  wkb?: string | null
): { lat: number; lng: number } | null {
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
      return view.getFloat64(0, true); // little-endian
    };

    const lng = hexToDouble(xHex);
    const lat = hexToDouble(yHex);

    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

    console.log("✅ Coordenadas parseadas:", { lat, lng });
    return { lat, lng };
  } catch (e) {
    console.error("❌ Error parseando WKB:", e);
    return null;
  }
}

// Componente para el pin personalizado
function CustomPin({ tipo }: { tipo: "perdida" | "encontrada" }) {
  const isPerdida = tipo === "perdida";
  const source = isPerdida ? patita_roja : patita_verde;

  return (
    <View style={styles.pinContainer}>
      <Image source={source} style={styles.pinImage} />
    </View>
  );
}

export default function MapaListado({
  height = undefined,
}: {
  height?: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [markers, setMarkers] = useState<ReportMarker[]>([]);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    const getUserLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        console.log("📍 Ubicación usuario:", location.coords);
      }
    };
    getUserLocation();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        console.log("🔄 Iniciando carga de marcadores...");

        // Obtener IDs de tipos
        const [tipoPerdidaRes, tipoEncontradaRes] = await Promise.all([
          supabase
            .from("tipos_reportes")
            .select("id")
            .eq("nombre", "perdida")
            .maybeSingle(),
          supabase
            .from("tipos_reportes")
            .select("id")
            .eq("nombre", "encontrada")
            .maybeSingle(),
        ]);

        const perdidaId = (tipoPerdidaRes.data as any)?.id;
        const encontradaId = (tipoEncontradaRes.data as any)?.id;

        console.log("🔑 IDs tipos:", { perdidaId, encontradaId });

        const { data: reportes, error } = await supabase
          .from("reportes")
          .select("id,tipo_id,ubicacion,titulo")
          .eq("estado", "AC")
          .in("tipo_id", [perdidaId, encontradaId].filter(Boolean) as number[])
          .limit(500);

        if (error) {
          console.error("❌ Error en reportes:", error);
          throw error;
        }

        console.log("📋 Reportes encontrados:", reportes?.length);
        console.log("📋 Primer reporte:", reportes?.[0]);

        const { data: fotos } = await supabase
          .from("fotos_reportes")
          .select("reporte_id,ruta_storage")
          .eq("estado", "AC");

        console.log("📸 Fotos encontradas:", fotos?.length);

        const fotoMap = new Map<string, string>();
        const BUCKET = "reportes-fotos";
        (fotos as any[])?.forEach((f) => {
          if (!fotoMap.has(String(f.reporte_id))) {
            const { data: pub } = supabase.storage
              .from(BUCKET)
              .getPublicUrl(f.ruta_storage);
            fotoMap.set(String(f.reporte_id), pub?.publicUrl ?? null);
          }
        });

        const items: ReportMarker[] = [];
        (reportes as any[])?.forEach((r) => {
          console.log(
            "🔍 Procesando reporte:",
            r.id,
            "ubicacion:",
            r.ubicacion
          );
          const p = parseWKBPoint(r.ubicacion);
          if (!p) {
            console.warn("⚠️ No se pudo parsear ubicación:", r.ubicacion);
            return;
          }
          console.log("✅ Punto parseado:", p);

          const tipo: "perdida" | "encontrada" =
            r.tipo_id === perdidaId ? "perdida" : "encontrada";
          items.push({
            id: String(r.id),
            lat: p.lat,
            lng: p.lng,
            tipo,
            titulo: r.titulo,
            fotoUrl: fotoMap.get(String(r.id)) || null,
          });
        });

        console.log("🎯 Total marcadores creados:", items.length);
        console.log("🎯 Primer marcador:", items[0]);

        setMarkers(items);

        // Ajustar a los marcadores
        setTimeout(() => {
          if (mapRef.current && items.length) {
            console.log("🗺️ Ajustando mapa a marcadores");
            mapRef.current.fitToCoordinates(
              items.map((i) => ({ latitude: i.lat, longitude: i.lng })),
              {
                edgePadding: { top: 80, left: 40, right: 40, bottom: 120 },
                animated: true,
              }
            );
          } else if (mapRef.current && userLocation) {
            console.log("🗺️ Centrando en usuario");
            mapRef.current.animateToRegion({
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
          }
        }, 500);
      } catch (e) {
        console.error("❌ [MapaListado] Error cargando marcadores:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userLocation]);

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
      latitudeDelta: 0.2,
      longitudeDelta: 0.2,
    };
  }, [userLocation]);

  console.log("🎨 Renderizando mapa con", markers.length, "marcadores");

  return (
    <View style={[styles.container, height ? { height } : { flex: 1 }]}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {markers.map((m) => {
          console.log("📌 Renderizando marcador:", m.id, "en", m.lat, m.lng);
          return (
            <Marker
              key={m.id}
              coordinate={{ latitude: m.lat, longitude: m.lng }}
              title={
                m.titulo ??
                (m.tipo === "perdida"
                  ? "Mascota perdida"
                  : "Mascota encontrada")
              }
              anchor={{ x: 0.5, y: 1 }}
              onCalloutPress={() => {
                router.push("/explore");
              }}
            >
              <CustomPin tipo={m.tipo} />
            </Marker>
          );
        })}
      </MapView>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4ECDC4" />
        </View>
      )}

      {/* Indicador de cantidad de marcadores */}
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
  pinContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  pinCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  pinImage: {
    width: 32,
    height: 32,
    resizeMode: "contain",
  },
  pinIcon: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
  },
  pinTip: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    marginTop: -2,
  },
});
