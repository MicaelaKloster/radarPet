import 'leaflet/dist/leaflet.css';
import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

export type Coord = { lat: number; lng: number };

type Props = {
  value?: Coord | null;
  onChange: (c: Coord) => void;
  height?: number;
  initialCenter?: Coord;
};

export default function MiniMapaSelector({ value, onChange, height = 200, initialCenter }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletRef = useRef<any>(null);

  useEffect(() => {
    let map: any;
    let marker: any;
    (async () => {
      const L = (await import('leaflet')) as typeof import('leaflet');
      if (!mapRef.current) return;
      const center = value ?? initialCenter ?? { lat: -31.4201, lng: -64.1888 };
      map = L.map(mapRef.current).setView([center.lat, center.lng], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      if (value) {
        marker = L.circleMarker([value.lat, value.lng], {
          radius: 8,
          color: '#2dd4bf',
          fillColor: '#2dd4bf',
          fillOpacity: 0.9,
          weight: 2,
        }).addTo(map);
      }

      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        onChange({ lat, lng });
        if (marker) {
          marker.setLatLng([lat, lng]);
        } else {
          marker = L.circleMarker([lat, lng], {
            radius: 8,
            color: '#2dd4bf',
            fillColor: '#2dd4bf',
            fillOpacity: 0.9,
            weight: 2,
          }).addTo(map);
        }
      });

      leafletRef.current = { map, marker, L };
    })();

    return () => {
      try {
        if (leafletRef.current?.map) leafletRef.current.map.remove();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const inst = leafletRef.current;
    if (inst?.map && value) {
      // Centrar y hacer zoom al cambiar el valor (incluye "mi ubicación")
      inst.map.flyTo([value.lat, value.lng], Math.max(inst.map.getZoom(), 16));
      if (inst.marker) inst.marker.setLatLng([value.lat, value.lng]);
      else if (inst.L) {
        inst.marker = inst.L.circleMarker([value.lat, value.lng], {
          radius: 8,
          color: '#2dd4bf',
          fillColor: '#2dd4bf',
          fillOpacity: 0.9,
          weight: 2,
        }).addTo(inst.map);
      }
    }
  }, [value]);

  const h = height || 0;
  return (
    <View style={[styles.container, { height: h }]}>      
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid #e5e7eb',
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
});
