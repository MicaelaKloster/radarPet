import { loginWithGoogle, supabase } from '@/lib/supabase';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Completa los campos');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) Alert.alert('Error', error.message); else router.replace('/(tabs)');
  };

  const loginGoogle = async () => {
    setLoading(true);
    const { error } = await loginWithGoogle();
    setLoading(false);
    if (error) Alert.alert('Error', error.message);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>RadarPet</Text>
      <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Contraseña" secureTextEntry value={password} onChangeText={setPassword} />
      <TouchableOpacity style={styles.buttonPrimary} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>Ingresar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.oauthGoogle} onPress={loginGoogle} disabled={loading}>
        <Text style={styles.buttonText}>Ingresar con Google</Text>
      </TouchableOpacity>
      <Link href="/(auth)/register" asChild>
        <TouchableOpacity>
          <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
        </TouchableOpacity>
      </Link>
      {loading && <ActivityIndicator style={{ marginTop: 16 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 32, textAlign: 'center' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  link: { marginTop: 16, color: '#2563eb', textAlign: 'center' },
  oauthGoogle: { backgroundColor: '#ea4335', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  buttonPrimary: { backgroundColor: '#2563eb', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  input: { height: 50, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, paddingHorizontal: 16, marginBottom: 16 },
});
