import { EmailIcon, GoogleIcon, LockIcon } from '@/components/Icons';
import { loginWithGoogle, supabase } from '@/lib/supabase';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
      <Image
        source={require('@/Iconos/Logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>RadarPet</Text>
      <View style={styles.inputContainer}>
        <EmailIcon width={20} height={20} color="#666" />
        <TextInput 
          style={styles.inputWithIcon} 
          placeholder="Email" 
          autoCapitalize="none" 
          keyboardType="email-address" 
          value={email} 
          onChangeText={setEmail} 
        />
      </View>
      <View style={styles.inputContainer}>
        <LockIcon width={20} height={20} color="#666" />
        <TextInput 
          style={styles.inputWithIcon} 
          placeholder="Contraseña" 
          secureTextEntry 
          value={password} 
          onChangeText={setPassword} 
        />
      </View>
      <TouchableOpacity style={styles.buttonPrimary} onPress={handleLogin} disabled={loading}>
        <EmailIcon width={20} height={20} color="#fff" />
        <Text style={styles.buttonText}>Ingresar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.oauthGoogle} onPress={loginGoogle} disabled={loading}>
        <GoogleIcon width={20} height={20} />
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
  logo: { width: 100, height: 100, alignSelf: 'center', marginBottom: 20 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 32, textAlign: 'center', color: '#2563eb' },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 8, 
    paddingHorizontal: 12, 
    marginBottom: 16,
    height: 50
  },
  inputWithIcon: { flex: 1, marginLeft: 10, fontSize: 16 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16, marginLeft: 8 },
  link: { marginTop: 16, color: '#2563eb', textAlign: 'center' },
  oauthGoogle: { 
    backgroundColor: '#ea4335', 
    padding: 16, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  buttonPrimary: { 
    backgroundColor: '#2563eb', 
    padding: 16, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  input: { height: 50, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, paddingHorizontal: 16, marginBottom: 16 },
});
