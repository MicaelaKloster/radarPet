import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React, { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

export default function PrivacySettings() {
  const [mostrarGmail, setMostrarGmail] = useState(false);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle">Privacidad</ThemedText>
      <View style={styles.row}>
        <ThemedText>Mostrar mi Gmail en el perfil</ThemedText>
        <Switch value={mostrarGmail} onValueChange={setMostrarGmail} />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 16 },
});