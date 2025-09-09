import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';

export type Coord = { lat: number; lng: number };

export default function MiniMapaSelector({
  value,
  onChange,
  height = 200,
  initialCenter,
}: {
  value?: Coord | null;
  onChange: (c: Coord) => void;
  height?: number;
  initialCenter?: Coord;
}) {
  const center = useMemo(
    () => value ?? initialCenter ?? { lat: -31.4201, lng: -64.1888 },
    [value, initialCenter]
  );

  const mapRef = useRef<MapView | null>(null);

  // Hacer zoom/centrar cuando cambia value (incluye "mi ubicación")
  useEffect(() => {
    if (value && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: value.lat,
          longitude: value.lng,
          latitudeDelta: 0.006,
          longitudeDelta: 0.006,
        },
        300
      );
    }
  }, [value]);

  return (
    <View style={[styles.container, { height }]}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: center.lat,
          longitude: center.lng,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        onPress={(e: any) => {
          const { latitude, longitude } = e.nativeEvent.coordinate;
          onChange({ lat: latitude, lng: longitude });
        }}
      >
        {/* Capa de teselas de OpenStreetMap (sin API keys) */}
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
          zIndex={0}
        />
        {value && (
          <Marker
            coordinate={{ latitude: value.lat, longitude: value.lng }}
            title="Ubicación seleccionada"
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', borderRadius: 12, overflow: 'hidden' },
});
