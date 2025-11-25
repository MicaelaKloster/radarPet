import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { supabase } from '@/lib/supabase';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Switch, View, Text } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function PrivacySettings() {
  const { isDark } = useTheme();
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
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: isDark ? '#fff' : '#000' }}>Correo</Text>
      <View style={styles.row}>
        <Text style={{ color: isDark ? '#fff' : '#000' }}>Mostrar correo en perfil</Text>
        <Switch value={mostrarCorreo} onValueChange={handleToggle} />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 16 },
});