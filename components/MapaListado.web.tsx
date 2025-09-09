import 'leaflet/dist/leaflet.css';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
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
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const leafletRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);

  const initialCenter = useMemo(() => ({ lat: -31.4201, lng: -64.1888 }), []);

  useEffect(() => {
    let isCancelled = false;
    (async () => {
      try {
        const L = (await import('leaflet')) as typeof import('leaflet');
        if (!mapDivRef.current) return;

        // Crear mapa
        const map = L.map(mapDivRef.current).setView([initialCenter.lat, initialCenter.lng], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        const layerGroup = L.layerGroup().addTo(map);
        leafletRef.current = { map, L, layerGroup };

        // Cargar datos
        setLoading(true);
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
        const fotoMap = new Map<string, string | null>();
        const BUCKET = 'reportes-fotos';
        (fotos as any[])?.forEach((f) => {
          if (!fotoMap.has(String(f.reporte_id))) {
            const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(f.ruta_storage);
            fotoMap.set(String(f.reporte_id), pub?.publicUrl ?? null);
          }
        });

        const items: ReportMarker[] = [];
        (reportes as any[])?.forEach((r) => {
          const p = parseWKTPoint(r.ubicacion);
          if (!p) return;
          const tipo: 'perdida' | 'encontrada' = r.tipo_id === perdidaId ? 'perdida' : 'encontrada';
          items.push({
            id: String(r.id),
            lat: p.lat,
            lng: p.lng,
            tipo,
            titulo: r.titulo,
            fotoUrl: fotoMap.get(String(r.id)) || null,
          });
        });

        if (isCancelled) return;

        // Renderizar marcadores personalizados con miniaturas
        layerGroup.clearLayers();
        const bounds: any[] = [];
        items.forEach((m) => {
          const borderColor = m.tipo === 'perdida' ? '#ef4444' : '#22c55e';
          const thumbHtml = m.fotoUrl
            ? `<div style="width:44px;height:44px;border-radius:22px;overflow:hidden;border:3px solid ${borderColor};background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.2)"><img src="${m.fotoUrl}" style="width:100%;height:100%;object-fit:cover"/></div>`
            : `<div style="width:44px;height:44px;border-radius:22px;overflow:hidden;border:3px solid ${borderColor};background:#fff"></div>`;
          const icon = L.divIcon({ html: thumbHtml, iconSize: [44, 44], className: '' });
          const marker = L.marker([m.lat, m.lng], { icon }).addTo(layerGroup);
          if (m.titulo) marker.bindPopup(m.titulo);
          bounds.push([m.lat, m.lng]);
        });

        if (bounds.length > 0) {
          const latLngBounds = L.latLngBounds(bounds as any);
          map.fitBounds(latLngBounds, { padding: [50, 50] });
        }
      } catch (e) {
        console.warn('[MapaListado.web] Error cargando marcadores:', e);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    })();

    return () => {
      isCancelled = true;
      try {
        if (leafletRef.current?.map) leafletRef.current.map.remove();
      } catch {}
    };
  }, [initialCenter]);

  const containerStyle = height ? { height } : { flex: 1 as const };

  return (
    <View style={[styles.container, containerStyle]}>
      <div
        ref={mapDivRef}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 15,
          overflow: 'hidden',
          background: '#F5F5F5',
        }}
      />
      {loading && (
        <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(255,255,255,0.9)', padding: 8, borderRadius: 8 }}>
          <span style={{ color: '#4ECDC4', fontWeight: 600 }}>Cargando…</span>
        </div>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', position: 'relative' },
});
