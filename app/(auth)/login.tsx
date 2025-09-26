import { EmailIcon, GoogleIcon, LockIcon } from '@/components/Icons';
import { loginWithGoogle, supabase } from '@/lib/supabase';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: screenHeight } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = { email: '', password: '' };
    
    if (!email) {
      newErrors.email = 'El email es requerido';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Formato de email inválido';
    }
    
    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) Alert.alert('Error', error.message); else router.replace('/(tabs)');
  };

  const loginGoogle = async () => {
    setLoading(true);
    try {
      const { error } = await loginWithGoogle();
      if (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        Alert.alert('Error', errorMessage);
      } else {
        router.replace('/(tabs)');
      }
    } catch (err) {
      console.error('Error en loginGoogle:', err);
      Alert.alert('Error', 'Error al iniciar sesión con Google');
    }
    setLoading(false);
  };

  // Función temporal para debug - mostrar URL de redirección
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Image
            source={require('@/Iconos/Logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>RadarPet</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <EmailIcon width={20} height={20} color="#666" />
            <TextInput 
              style={styles.inputWithIcon} 
              placeholder="Email" 
              autoCapitalize="none" 
              keyboardType="email-address" 
              value={email} 
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors({...errors, email: ''});
              }}
            />
          </View>
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          
          <View style={styles.inputContainer}>
            <LockIcon width={20} height={20} color="#666" />
            <TextInput 
              style={styles.inputWithIcon} 
              placeholder="Contraseña" 
              secureTextEntry 
              value={password} 
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors({...errors, password: ''});
              }}
            />
          </View>
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: screenHeight > 700 ? 60 : 30,
    paddingBottom: 30,
  },
  logo: {
    width: screenHeight > 700 ? 120 : 100,
    height: screenHeight > 700 ? 120 : 100,
    marginBottom: 20,
  },
  title: {
    fontSize: screenHeight > 700 ? 32 : 28,
    fontWeight: 'bold',
    color: '#2CBDAA',
    textAlign: 'center',
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    minHeight: screenHeight > 700 ? 'auto' : screenHeight * 0.6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: Platform.OS === 'ios' ? 50 : 55,
  },
  inputWithIcon: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    paddingVertical: Platform.OS === 'android' ? 15 : 0,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    marginTop: -12,
    marginBottom: 8,
    marginLeft: 4,
  },
  buttonPrimary: {
    backgroundColor: '#2CBDAA',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 50,
  },
  oauthGoogle: {
    backgroundColor: '#249A8A',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 50,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  link: {
    marginTop: 16,
    color: '#2CBDAA',
    textAlign: 'center',
    fontSize: 16,
    paddingVertical: 10,
  },
});
