import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { supabase } from '@/lib/supabase';
import React, { useState } from 'react';
import { Alert, Image, Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

type Mascota = {
  id: string;
  nombre: string;
  fotoPrincipalUrl: string | null;
  especieId: number | null;
};

type Props = {
  mascotas: Mascota[];
  setMascotas: React.Dispatch<React.SetStateAction<Mascota[]>>;
  userId: string;
  recargarMascotas: () => void; 
};

export default function MisMascotas({ mascotas, setMascotas, userId, recargarMascotas }: Props) {
  const [modalVisible, setModalVisible] = useState(false); 
  const [nuevoNombre, setNuevoNombre] = useState(''); 

  const agregarMascota = async () => {
    if (!nuevoNombre.trim()) return;

    try {
      const { data, error } = await supabase
        .from('mascotas')
        .insert([{ 
          nombre: nuevoNombre, 
          duenio_id: userId,
          especie_id: 1 
        }])
        .select();

      if (error) throw error;
      if (!data || data.length === 0) throw new Error('No se pudo crear la mascota');

      await recargarMascotas(); 
      setNuevoNombre('');
      setModalVisible(false);
    } catch (err: any) {
      console.log('Error agregando mascota:', err.message);
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={styles.seccion}>
      <ThemedText type="subtitle" style={styles.tituloSeccion}>
        Mis Mascotas Registradas
      </ThemedText>

      {mascotas.length === 0 ? (
        <View style={styles.estadoVacio}>
          <IconSymbol size={50} name="pawprint.fill" color="#999" />
          <ThemedText style={styles.textoVacio}>No tienes mascotas registradas</ThemedText>
          <ThemedText style={styles.subtextoVacio}>
            Registra tus mascotas para crear reportes más rápido
          </ThemedText>
        </View>
      ) : (
        <View>
          {mascotas.map((m) => (
            <View key={m.id} style={styles.itemMascota}>
              {m.fotoPrincipalUrl ? (
                <Image
                  source={{ uri: m.fotoPrincipalUrl }}
                  style={styles.imagenMascota}
                  resizeMode="cover"
                />
              ) : (
                <IconSymbol size={40} name="pawprint.fill" color="#999" />
              )}
              <ThemedText style={styles.nombreMascota}>{m.nombre}</ThemedText>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.botonAgregar} onPress={() => setModalVisible(true)}>
        <ThemedText style={styles.textoBotonAgregar}>+ Agregar Mascota</ThemedText>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.overlayModal}>
          <View style={styles.contenidoModal}>
            <ThemedText type="subtitle">Nueva Mascota</ThemedText>
            <TextInput
              placeholder="Nombre de la mascota"
              value={nuevoNombre}
              onChangeText={setNuevoNombre}
              style={styles.input}
            />
            <TouchableOpacity style={styles.botonAgregar} onPress={agregarMascota}>
              <ThemedText style={styles.textoBotonAgregar}>Agregar</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <ThemedText style={{ color: '#FF6B6B', marginTop: 10 }}>Cancelar</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  seccion: { marginTop: 25 },
  tituloSeccion: { marginBottom: 15, color: '#333' },
  estadoVacio: { alignItems: 'center', padding: 40, backgroundColor: '#F8F9FA', borderRadius: 12 },
  textoVacio: { fontSize: 16, fontWeight: '600', marginTop: 15 },
  subtextoVacio: { fontSize: 14, opacity: 0.6, textAlign: 'center', marginTop: 8, marginBottom: 20 },
  itemMascota: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 12,
  },
  imagenMascota: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  nombreMascota: { fontSize: 16, fontWeight: '600' },
  botonAgregar: { backgroundColor: '#2E86AB', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, alignSelf: 'flex-start', marginTop: 10 },
  textoBotonAgregar: { color: 'white', fontSize: 14, fontWeight: '600' },
  overlayModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  contenidoModal: { width: '80%', backgroundColor: 'white', padding: 20, borderRadius: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginTop: 10 },
});