import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { supabase } from '@/lib/supabase';
import { decode as base64ToArrayBuffer } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

type Props = {
  nombre: string; 
  email: string | null; 
  avatarUri: string | null; 
  userId?: string | null; 
  onAvatarChange?: (url: string) => void; 
};

export default function Encabezado ({ nombre, email, avatarUri, userId, onAvatarChange }: Props) {
  const [subiendo, setSubiendo] = useState(false); 

  const elegirYSubirImagen = async () => {
    if (!userId) return; 

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Se necesita permiso para acceder a la galería.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images' as any, 
      allowsEditing: true, 
      aspect: [1, 1], 
      quality: 0.7, 
    });
    if (result.canceled) return;

    setSubiendo(true);
    try {
      const file = result.assets[0];
      const extension = file.uri.split('.').pop();
      const fileName = `${userId}.${extension}`;
      const filePath = `fotos-perfil/${fileName}`;

      let uploadData: any;
      if (Platform.OS === 'web') {
        const resp = await fetch(file.uri);
        uploadData = await resp.blob();
      } else {
        const base64 = await FileSystem.readAsStringAsync(file.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        uploadData = base64ToArrayBuffer(base64);
      }

      let { error } = await supabase.storage
        .from('fotos-perfil')
        .upload(filePath, uploadData, {
          upsert: true, 
          contentType: file.mimeType || 'image/jpeg',
        });

      if (error) {
        Alert.alert('Error', 'No se pudo subir la imagen: ' + error.message);
        setSubiendo(false);
        return;
      }

      const { data } = supabase.storage.from('fotos-perfil').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      const { error: updateError } = await supabase
        .from('perfiles')
        .upsert({ 
          id: userId, 
          avatar_url: publicUrl,
          nombre: nombre || 'Usuario' 
        });

      if (updateError) {
        console.error('Error actualizando perfil:', updateError);
        Alert.alert('Advertencia', 'Imagen subida pero no se pudo actualizar el perfil');
      }

      if (onAvatarChange) onAvatarChange(publicUrl + '?t=' + Date.now()); 
      Alert.alert('¡Listo!', 'Tu foto de perfil fue actualizada.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo subir la imagen');
    }
    setSubiendo(false);
  };

  return (
    <ThemedView style={styles.contenedor}>
      <TouchableOpacity onPress={elegirYSubirImagen} disabled={subiendo}>
        <View style={styles.avatarWrapper}>
          {avatarUri ? (
            <Image
              source={{ uri: avatarUri }}
              style={styles.avatar}
              resizeMode="cover"
              onError={() => console.log('Error cargando avatar:', avatarUri)}
            />
          ) : (
            <IconSymbol size={60} name="person.fill" color="#2E86AB" />
          )}
          {subiendo && (
            <View style={styles.overlayCargando}>
              <ActivityIndicator color="#2E86AB" size="large" />
            </View>
          )}
        </View>
      </TouchableOpacity>
      <ThemedText type="title" style={styles.nombre}>
        {nombre || 'Usuario'}
      </ThemedText>
      {email && <ThemedText style={styles.email}>{email}</ThemedText>}
      <ThemedText style={{ fontSize: 12, opacity: 0.5, marginTop: 4 }}>
        Toca la imagen para cambiar tu foto de perfil
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  overlayCargando: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nombre: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  email: {
    fontSize: 14,
    opacity: 0.6,
  },
});