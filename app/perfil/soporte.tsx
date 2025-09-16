import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function SupportSettings() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle">Ayuda y Soporte</ThemedText>
      <ThemedText style={{ marginTop: 20 }}>
        ¿Necesitas ayuda? Escríbenos a:
      </ThemedText>
      <ThemedText style={{ fontWeight: 'bold', marginTop: 10 }}>
        radarpet.soporte@gmail.com
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
});