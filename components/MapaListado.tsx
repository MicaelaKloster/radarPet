import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Image } from 'expo-image';
import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase';

export type ReportMarker = {
  id: string;
  lat: number;
  lng: number;
  tipo: 'perdida' | 'encontrada';
  titulo?: string | null;
  fotoUrl?: string | null;
};

function parseWKTPoint(wkt?: string | null): { lat: number; lng: number } | null {
  if (!wkt) return null;
  const m = wkt.match(/POINT\s*\(\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s*\)/i);
  if (!m) return null;
  const lon = parseFloat(m[1]);
  const lat = parseFloat(m[2]);
  if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
  return { lat, lng: lon };
}

export default function MapaListado({ height = undefined }: { height?: number }) {
  const [loading, setLoading] = useState(true);
  const [markers, setMarkers] = useState<ReportMarker[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    const getUserLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    };
    getUserLocation();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // Obtener IDs de tipos
        const [tipoPerdidaRes, tipoEncontradaRes] = await Promise.all([
          supabase.from('tipos_reportes').select('id').eq('nombre', 'perdida').maybeSingle(),
          supabase.from('tipos_reportes').select('id').eq('nombre', 'encontrada').maybeSingle(),
        ]);
        const perdidaId = (tipoPerdidaRes.data as any)?.id;
        const encontradaId = (tipoEncontradaRes.data as any)?.id;

        const { data: reportes, error } = await supabase
          .from('reportes')
          .select('id,tipo_id,ubicacion,titulo')
          .eq('estado', 'AC')
          .in('tipo_id', [perdidaId, encontradaId].filter(Boolean) as number[])
          .limit(500);
        if (error) throw error;

        const { data: fotos } = await supabase
          .from('fotos_reportes')
          .select('reporte_id,ruta_storage')
          .eq('estado', 'AC');
        const fotoMap = new Map<string, string>();
        const BUCKET = 'reportes-fotos';
        (fotos as any[])?.forEach(f => {
          if (!fotoMap.has(String(f.reporte_id))) {
            const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(f.ruta_storage);
            fotoMap.set(String(f.reporte_id), pub?.publicUrl ?? null);
          }
        });

        const items: ReportMarker[] = [];
        (reportes as any[])?.forEach(r => {
          const p = parseWKTPoint(r.ubicacion);
          if (!p) return;
          const tipo: 'perdida' | 'encontrada' = r.tipo_id === perdidaId ? 'perdida' : 'encontrada';
          items.push({ id: String(r.id), lat: p.lat, lng: p.lng, tipo, titulo: r.titulo, fotoUrl: fotoMap.get(String(r.id)) || null });
        });
        setMarkers(items);

        // Ajustar a los marcadores
        setTimeout(() => {
          if (mapRef.current && items.length) {
            mapRef.current.fitToCoordinates(
              items.map(i => ({ latitude: i.lat, longitude: i.lng })),
              { edgePadding: { top: 80, left: 40, right: 40, bottom: 120 }, animated: true }
            );
          } else if (mapRef.current && userLocation) {
            mapRef.current.animateToRegion({
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
          }
        }, 0);
      } catch (e) {
        console.warn('[MapaListado] Error cargando marcadores:', e);
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
    return { latitude: -31.4201, longitude: -64.1888, latitudeDelta: 0.2, longitudeDelta: 0.2 };
  }, [userLocation]);

  return (
    <View style={[styles.container, height ? { height } : { flex: 1 }]}>
      <MapView ref={mapRef} style={StyleSheet.absoluteFill} initialRegion={initialRegion} showsUserLocation={true} showsMyLocationButton={true}>
        {markers.map(m => (
          <Marker key={m.id} coordinate={{ latitude: m.lat, longitude: m.lng }}>
            <View style={[styles.pin, { borderColor: m.tipo === 'perdida' ? '#ef4444' : '#22c55e' }]}>              
              {m.fotoUrl ? (
                <Image source={{ uri: m.fotoUrl }} style={styles.thumb} />
              ) : (
                <View style={[styles.thumb, styles.thumbPlaceholder]} />
              )}
            </View>
          </Marker>
        ))}
      </MapView>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4ECDC4" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  loadingOverlay: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(255,255,255,0.9)', padding: 8, borderRadius: 8 },
  pin: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden', borderWidth: 3, backgroundColor: '#fff' },
  thumb: { width: '100%', height: '100%' },
  thumbPlaceholder: { backgroundColor: '#E5E7EB' },
});
