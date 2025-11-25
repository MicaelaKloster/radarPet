import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { Alert, Linking, Platform, StyleSheet, Switch, View, Text } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function LocationSettings() {
  const { isDark } = useTheme();
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
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: isDark ? '#fff' : '#000' }}>Ubicación</Text>
      <View style={styles.row}>
        <Text style={{ color: isDark ? '#fff' : '#000' }}>Compartir mi ubicación</Text>
        <Switch value={compartirUbicacion} onValueChange={setCompartirUbicacion} />
      </View>
      <View style={styles.row}>
        <Text style={{ color: isDark ? '#fff' : '#000' }}>Usar ubicación precisa</Text>
        <Switch value={ubicacionPrecisa} onValueChange={handleUbicacionPrecisa} />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 16 },
});