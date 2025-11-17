import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { Alert, Linking, Platform, StyleSheet, Switch, View } from 'react-native';

export default function LocationSettings() {
  const [compartirUbicacion, setCompartirUbicacion] = useState(true);
  const [ubicacionPrecisa, setUbicacionPrecisa] = useState(true);

  useEffect(() => {
    activarGPS();
  }, []);

  const activarGPS = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso de ubicación',
          'Activa el GPS en la configuración del dispositivo',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Abrir configuración', onPress: () => Linking.openSettings() }
          ]
        );
      }
    } catch (error) {
      console.log('Error activando GPS:', error);
    }
  };

  const handleUbicacionPrecisa = async (value: boolean) => {
    if (value) {
      await activarGPS();
    }
    setUbicacionPrecisa(value);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle">Ubicación</ThemedText>
      <View style={styles.row}>
        <ThemedText>Compartir mi ubicación</ThemedText>
        <Switch value={compartirUbicacion} onValueChange={setCompartirUbicacion} />
      </View>
      <View style={styles.row}>
        <ThemedText>Usar ubicación precisa</ThemedText>
        <Switch value={ubicacionPrecisa} onValueChange={handleUbicacionPrecisa} />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 16 },
});