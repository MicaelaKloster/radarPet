import { supabase } from './supabase';
import * as Location from 'expo-location';

function calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function parseWKTPoint(wkt?: string | null): { lat: number; lng: number } | null {
  if (!wkt) return null;
  const m = wkt.match(/POINT\s*\(\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s*\)/i);
  if (!m) return null;
  const lon = parseFloat(m[1]);
  const lat = parseFloat(m[2]);
  if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
  return { lat, lng: lon };
}

export async function suscribirseAReportes() {
  let userLocation: { latitude: number; longitude: number } | null = null;

  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status === 'granted') {
      const location = await Location.getCurrentPositionAsync({});
      userLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    }
  } catch (error) {
    console.log('Error obteniendo ubicación:', error);
  }

  const channel = supabase
    .channel('reportes-nuevos')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'reportes',
      },
      async (payload) => {
        const nuevoReporte = payload.new as any;

        const { data: tipo } = await supabase
          .from('tipos_reportes')
          .select('nombre')
          .eq('id', nuevoReporte.tipo_id)
          .single();

        const tipoTexto = tipo?.nombre === 'perdida' ? 'perdida' : 'encontrada';

        if (userLocation) {
          const coords = parseWKTPoint(nuevoReporte.ubicacion);
          if (coords) {
            const distancia = calcularDistancia(
              userLocation.latitude,
              userLocation.longitude,
              coords.lat,
              coords.lng
            );

            if (distancia < 50) {
              console.log(`Mascota ${tipoTexto} cerca: ${distancia.toFixed(1)} km`);
            }
          }
        }
      }
    )
    .subscribe();

  return channel;
}
