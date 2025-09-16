import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React, { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

export default function LocationSettings() {
  const [compartirUbicacion, setCompartirUbicacion] = useState(true);
  const [ubicacionPrecisa, setUbicacionPrecisa] = useState(false);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle">Ubicación</ThemedText>
      <View style={styles.row}>
        <ThemedText>Compartir mi ubicación</ThemedText>
        <Switch value={compartirUbicacion} onValueChange={setCompartirUbicacion} />
      </View>
      <View style={styles.row}>
        <ThemedText>Usar ubicación precisa</ThemedText>
        <Switch value={ubicacionPrecisa} onValueChange={setUbicacionPrecisa} />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 16 },
});