import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React, { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

export default function NotificationsSettings() {
  const [recibirNotificaciones, setRecibirNotificaciones] = useState(true);
  const [soloMisReportes, setSoloMisReportes] = useState(true);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle">Notificaciones</ThemedText>
      <View style={styles.row}>
        <ThemedText>Recibir notificaciones</ThemedText>
        <Switch value={recibirNotificaciones} onValueChange={setRecibirNotificaciones} />
      </View>
      <View style={styles.row}>
        <ThemedText>Solo mis reportes</ThemedText>
        <Switch value={soloMisReportes} onValueChange={setSoloMisReportes} />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 16 },
});