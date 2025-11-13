import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
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
  
  if (typeof wkt === 'string' && wkt.includes(',')) {
    const parts = wkt.split(',').map(p => parseFloat(p.trim()));
    if (parts.length === 2 && !Number.isNaN(parts[0]) && !Number.isNaN(parts[1])) {
      return { lat: parts[0], lng: parts[1] };
    }
  }
  
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
          supabase.from('tipos_reportes').select('id').eq('nombre', 'perdida').eq('estado', 'AC').maybeSingle(),
          supabase.from('tipos_reportes').select('id').eq('nombre', 'encontrada').eq('estado', 'AC').maybeSingle(),
        ]);
        const perdidaId = (tipoPerdidaRes.data as any)?.id;
        const encontradaId = (tipoEncontradaRes.data as any)?.id;
        console.log('Tipos:', { perdidaId, encontradaId });

        const tiposIds = [perdidaId, encontradaId].filter(Boolean) as number[];
        const { data: reportes, error } = await supabase.rpc('obtener_reportes_con_coordenadas', {
          p_tipos_ids: tiposIds,
          p_limite: 500
        });
        console.log('Reportes:', reportes?.length, error);
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
          if (!r.lat || !r.lng) return;
          const tipo: 'perdida' | 'encontrada' = r.tipo_id === perdidaId ? 'perdida' : 'encontrada';
          items.push({ id: String(r.id), lat: r.lat, lng: r.lng, tipo, titulo: r.titulo, fotoUrl: fotoMap.get(String(r.id)) || null });
        });
        console.log('Marcadores:', items.length);
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

    const channel = supabase
      .channel('reportes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reportes' }, () => {
        load();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
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
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
          <Text style={styles.legendText}>Perdidas</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#22c55e' }]} />
          <Text style={styles.legendText}>Encontradas</Text>
        </View>
      </View>
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
  legend: { position: 'absolute', bottom: 10, left: 10, backgroundColor: 'rgba(255,255,255,0.95)', padding: 8, borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginVertical: 2 },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: 6 },
  legendText: { fontSize: 12, color: '#333', fontWeight: '500' },
});
