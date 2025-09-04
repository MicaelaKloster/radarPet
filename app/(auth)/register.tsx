import { loginWithGoogle, supabase } from '@/lib/supabase';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Pantalla de Registro simplificada (sin avatar)
export default function RegisterScreen() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [loading, setLoading] = useState(false);

  const sendWelcomeEmail = async (to: string) => {
    try {
      const formData = new FormData();
      formData.append('subject', 'Bienvenido/a a RadarPet');
      formData.append('message', 'Tu cuenta ha sido creada. Gracias por registrarte.');
      formData.append('_next', 'https://radarpet.app/thanks'); // URL de gracias (ajusta si quieres)
      formData.append('_captcha', 'false');
      await fetch(`https://formsubmit.co/${encodeURIComponent(to)}`, { method: 'POST', body: formData });
      console.log('[welcome-email] enviado a', to);
    } catch (e) {
      console.log('[welcome-email] error', e);
    }
  };

  const registerEmail = async () => {
    if (!nombre || !email || !password || !telefono || !ciudad) return Alert.alert('Completa todos los campos');
    setLoading(true);
    console.log('[register] signUp start');
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) { setLoading(false); console.log('[register] signUp error', error); return Alert.alert('Error', error.message); }
    const user = data.user;
    if (user) {
      const { error: perfErr } = await supabase.from('perfiles').upsert({ id: user.id, nombre, telefono, ciudad });
      if (perfErr) console.log('[register] perfil error', perfErr);
    }
    setLoading(false);
    if (data.session && user?.email) {
      void sendWelcomeEmail(user.email as string);
      Alert.alert('Registro', 'Cuenta creada');
      router.replace('/(tabs)');
    } else {
      Alert.alert('Registro', 'Revisa tu email para confirmar.');
      router.replace('/(auth)/login');
    }
  };

  const registerGoogle = async () => {
    if (!nombre || !telefono || !ciudad) return Alert.alert('Completa nombre, teléfono y ciudad');
    if (email) (globalThis as any).__pendingWelcomeEmail = email;
    (globalThis as any).__pendingProfileData = { nombre, telefono, ciudad };
    setLoading(true);
    const { error } = await loginWithGoogle();
    setLoading(false);
    if (error) Alert.alert('Error', error.message);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Regístrate</Text>
      <TextInput style={styles.input} placeholder="Nombre" value={nombre} onChangeText={setNombre} />
      <TextInput style={styles.input} placeholder="Teléfono" keyboardType="phone-pad" value={telefono} onChangeText={setTelefono} />
      <TextInput style={styles.input} placeholder="Ciudad" value={ciudad} onChangeText={setCiudad} />
      <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Contraseña" secureTextEntry value={password} onChangeText={setPassword} />
      <TouchableOpacity style={styles.buttonPrimary} onPress={registerEmail} disabled={loading}>
        <Text style={styles.buttonText}>Crear cuenta (Email)</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.oauthGoogle} onPress={registerGoogle} disabled={loading}>
        <Text style={styles.buttonText}>Registrarme con Google</Text>
      </TouchableOpacity>
      <Link href="/(auth)/login" asChild>
        <TouchableOpacity>
          <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
        </TouchableOpacity>
      </Link>
      {loading && <ActivityIndicator style={{ marginTop: 16 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  link: { marginTop: 16, color: '#2563eb', textAlign: 'center' },
  buttonPrimary: { backgroundColor: '#16a34a', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  oauthGoogle: { backgroundColor: '#ea4335', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
});
