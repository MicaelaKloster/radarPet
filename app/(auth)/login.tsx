import { EmailIcon, EyeIcon, EyeOffIcon, GoogleIcon, LockIcon } from '@/components/Icons';
import { loginWithGoogle, supabase } from '@/lib/supabase';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: screenHeight } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        Alert.alert('Error', error.message);
        setLoading(false);
      }
    } catch (err) {
      Alert.alert('Error', 'Error al iniciar sesión');
      setLoading(false);
    }
  };

  const loginGoogle = async () => {
    try {
      setLoading(true);
      const { error } = await loginWithGoogle();
      if (error) {
        if (error.message !== 'Cancelado') {
          Alert.alert('Error', error.message);
        }
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
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
              secureTextEntry={!showPassword}
              value={password} 
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors({...errors, password: ''});
              }}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOffIcon width={20} height={20} color="#666" /> : <EyeIcon width={20} height={20} color="#666" />}
            </TouchableOpacity>
          </View>
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          
          <TouchableOpacity style={styles.buttonPrimary} onPress={handleLogin} disabled={loading}>
            <EmailIcon width={20} height={20} color="#fff" />
            <Text style={styles.buttonText}>Ingresar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.oauthGoogle} onPress={loginGoogle} disabled={loading}>
            <GoogleIcon width={20} height={20} />
            <Text style={styles.buttonTextGoogle}>Ingresar con Google</Text>
          </TouchableOpacity>
          
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
            </TouchableOpacity>
          </Link>
          
          {loading && <ActivityIndicator style={{ marginTop: 16 }} />}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#02aaad',
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
    color: '#fff',
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
    backgroundColor: '#fff',
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
    backgroundColor: '#012531',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 50,
  },
  oauthGoogle: {
    backgroundColor: '#f5f5f5',
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
  buttonTextGoogle: {
    color: '#012531',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  link: {
    marginTop: 16,
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    paddingVertical: 10,
  },
});
