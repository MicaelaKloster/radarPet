import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { supabase } from '@/lib/supabase';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

export default function PrivacySettings() {
  const [mostrarCorreo, setMostrarCorreo] = useState(false);

  useEffect(() => {
    cargarPreferencia();
  }, []);

  const cargarPreferencia = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('perfiles')
        .select('mostrar_correo')
        .eq('id', user.id)
        .single();

      if (data) {
        setMostrarCorreo(data.mostrar_correo || false);
      }
    } catch (error) {
      console.log('Error cargando preferencia:', error);
    }
  };

  const handleToggle = async (value: boolean) => {
    setMostrarCorreo(value);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('perfiles')
        .update({ mostrar_correo: value })
        .eq('id', user.id);
    } catch (error) {
      console.log('Error guardando preferencia:', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle">Correo</ThemedText>
      <View style={styles.row}>
        <ThemedText>Mostrar correo en perfil</ThemedText>
        <Switch value={mostrarCorreo} onValueChange={handleToggle} />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 16 },
});