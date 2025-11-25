import { supabase } from "@/lib/supabase";
import { Image } from "expo-image";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import patita_roja from "../Iconos/patita_roja.png";
import patita_verde from "../Iconos/patita_verde.png";
import pin_bomberos from "../Iconos/pin_bomberos.png";
import pin_policia from "../Iconos/pin_policia.png";
import pin_refugios from "../Iconos/pin_refugio.png";
import pin_veterinarias from "../Iconos/pin_veterinaria.png";

export type ReportMarker = {
  id: string;
  lat: number;
  lng: number;
  tipo: "perdida" | "encontrada";
  titulo?: string | null;
  fotoUrl?: string | null;
};

export type ServiceMarker = {
  id: string;
  lat: number;
  lng: number;
  tipo: "bomberos" | "policia" | "refugio" | "veterinaria";
  nombre: string;
  direccion?: string;
};

// Parser WKB
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
    console.error("Error parseando WKB:", e);
    return null;
  }
}

// Función para obtener servicios cercanos desde Overpass API
async function fetchNearbyServices(
  lat: number,
  lng: number,
  radiusKm: number = 5
): Promise<ServiceMarker[]> {
  const radius = radiusKm * 1000; // Convertir a metros
  
  // Query de Overpass API
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="fire_station"](around:${radius},${lat},${lng});
      node["amenity"="police"](around:${radius},${lat},${lng});
      node["amenity"="animal_shelter"](around:${radius},${lat},${lng});
      node["amenity"="veterinary"](around:${radius},${lat},${lng});
    );
    out body;
  `;

  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query,
    });

    if (!response.ok) throw new Error("Error en Overpass API");

    const data = await response.json();
    const services: ServiceMarker[] = [];

    data.elements?.forEach((element: any) => {
      if (!element.lat || !element.lon) return;

      let tipo: ServiceMarker["tipo"] | null = null;
      
      switch (element.tags?.amenity) {
        case "fire_station":
          tipo = "bomberos";
          break;
        case "police":
          tipo = "policia";
          break;
        case "animal_shelter":
          tipo = "refugio";
          break;
        case "veterinary":
          tipo = "veterinaria";
          break;
      }

      if (tipo) {
        services.push({
          id: `service-${element.id}`,
          lat: element.lat,
          lng: element.lon,
          tipo,
          nombre: element.tags?.name || `${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`,
          direccion: element.tags?.["addr:street"],
        });
      }
    });

    return services;
  } catch (error) {
    console.error("Error obteniendo servicios cercanos:", error);
    return [];
  }
}

// Icono personalizado para reportes
function CustomPin({ tipo }: { tipo: "perdida" | "encontrada" }) {
  const source = tipo === "perdida" ? patita_roja : patita_verde;
  return <Image source={source} style={{ width: 36, height: 36 }} />;
}

// Icono personalizado para servicios
function ServicePin({ tipo }: { tipo: ServiceMarker["tipo"] }) {
  let source;
  switch (tipo) {
    case "bomberos":
      source = pin_bomberos;
      break;
    case "policia":
      source = pin_policia;
      break;
    case "refugio":
      source = pin_refugios;
      break;
    case "veterinaria":
      source = pin_veterinarias;
      break;
  }
  return <Image source={source} style={{ width: 32, height: 32 }} />;
}

export default function MapaListado({ height }: { height?: number }) {
  const router = useRouter();
  const mapRef = useRef<MapView | null>(null);

  const [loading, setLoading] = useState(true);
  const [markers, setMarkers] = useState<ReportMarker[]>([]);
  const [services, setServices] = useState<ServiceMarker[]>([]);
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

  // Cargar servicios cercanos cuando tengamos la ubicación
  useEffect(() => {
    if (userLocation) {
      fetchNearbyServices(userLocation.latitude, userLocation.longitude, 5)
        .then(setServices)
        .catch((err) => console.error("Error cargando servicios:", err));
    }
  }, [userLocation]);

  // Cargar marcadores de reportes
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
        console.error("Error cargando marcadores:", e);
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
        {/* Marcadores de reportes */}
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

        {/* Marcadores de servicios */}
        {services.map((s) => (
          <Marker
            key={s.id}
            coordinate={{ latitude: s.lat, longitude: s.lng }}
            title={s.nombre}
            description={s.direccion}
            anchor={{ x: 0.5, y: 1 }}
          >
            <ServicePin tipo={s.tipo} />
          </Marker>
        ))}
      </MapView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" />
        </View>
      )}

      <View style={styles.markerCount}>
        <Text style={styles.markerCountText}>
          {markers.length} reportes • {services.length} servicios
        </Text>
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