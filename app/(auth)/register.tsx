import { EmailIcon, GoogleIcon, LockIcon, MapIcon, PhoneIcon, UserIcon } from '@/components/Icons';
import { loginWithGoogle, supabase } from '@/lib/supabase';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: screenHeight } = Dimensions.get('window');

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    nombre: '',
    email: '',
    password: '',
    telefono: '',
    ciudad: ''
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 8;
  };

  const validateForm = () => {
    const newErrors = {
      nombre: '',
      email: '',
      password: '',
      telefono: '',
      ciudad: ''
    };
    
    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    }
    
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
    
    if (!telefono) {
      newErrors.telefono = 'El teléfono es requerido';
    } else if (!validatePhone(telefono)) {
      newErrors.telefono = 'Formato de teléfono inválido';
    }
    
    if (!ciudad.trim()) {
      newErrors.ciudad = 'La ciudad es requerida';
    } else if (ciudad.trim().length < 2) {
      newErrors.ciudad = 'La ciudad debe tener al menos 2 caracteres';
    }
    
    setErrors(newErrors);
    return Object.values(newErrors).every(error => !error);
  };

  const sendWelcomeEmail = async (to: string) => {
    try {
      const formData = new FormData();
      formData.append('subject', 'Bienvenido/a a RadarPet');
      formData.append('message', 'Tu cuenta ha sido creada. Gracias por registrarte.');
      formData.append('_next', 'https://radarpet.app/thanks');
      formData.append('_captcha', 'false');
      await fetch(`https://formsubmit.co/${encodeURIComponent(to)}`, { method: 'POST', body: formData });
      console.log('[welcome-email] enviado a', to);
    } catch (e) {
      console.log('[welcome-email] error', e);
    }
  };

  const registerEmail = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    console.log('[register] signUp start');
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) { 
      setLoading(false); 
      console.log('[register] signUp error', error); 
      return Alert.alert('Error', error.message); 
    }
    const user = data.user;
    if (user) {
      const { error: perfErr } = await supabase.from('perfiles').upsert({ 
        id: user.id, 
        nombre: nombre.trim(), 
        telefono, 
        ciudad: ciudad.trim() 
      });
      if (perfErr) console.log('[register] perfil error', perfErr);
    }
    setLoading(false);
    if (data.session && user?.email) {
      void sendWelcomeEmail(user.email as string);
      Alert.alert('Registro', 'Cuenta creada exitosamente');
      router.replace('/(tabs)');
    } else {
      Alert.alert('Registro', 'Revisa tu email para confirmar tu cuenta.');
      router.replace('/(auth)/login');
    }
  };

  const registerGoogle = async () => {
    if (email) (globalThis as any).__pendingWelcomeEmail = email;
    if (nombre || telefono || ciudad) {
      (globalThis as any).__pendingProfileData = { 
        nombre: nombre.trim(), 
        telefono, 
        ciudad: ciudad.trim() 
      };
    }
    
    setLoading(true);
    try {
      const { error } = await loginWithGoogle();
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        router.replace('/(tabs)');
      }
    } catch (err) {
      Alert.alert('Error', 'Error al registrarse con Google');
    }
    setLoading(false);
  };

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
          <Text style={styles.title}>Regístrate</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <UserIcon width={20} height={20} color="#666" />
            <TextInput 
              style={styles.inputWithIcon} 
              placeholder="Nombre completo" 
              value={nombre} 
              onChangeText={(text) => {
                setNombre(text);
                if (errors.nombre) setErrors({...errors, nombre: ''});
              }}
            />
          </View>
          {errors.nombre ? <Text style={styles.errorText}>{errors.nombre}</Text> : null}
          
          <View style={styles.inputContainer}>
            <PhoneIcon width={20} height={20} color="#666" />
            <TextInput 
              style={styles.inputWithIcon} 
              placeholder="Teléfono" 
              keyboardType="phone-pad" 
              value={telefono} 
              onChangeText={(text) => {
                setTelefono(text);
                if (errors.telefono) setErrors({...errors, telefono: ''});
              }}
            />
          </View>
          {errors.telefono ? <Text style={styles.errorText}>{errors.telefono}</Text> : null}
          
          <View style={styles.inputContainer}>
            <MapIcon width={20} height={20} color="#666" />
            <TextInput 
              style={styles.inputWithIcon} 
              placeholder="Ciudad" 
              value={ciudad} 
              onChangeText={(text) => {
                setCiudad(text);
                if (errors.ciudad) setErrors({...errors, ciudad: ''});
              }}
            />
          </View>
          {errors.ciudad ? <Text style={styles.errorText}>{errors.ciudad}</Text> : null}
          
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
              placeholder="Contraseña (mín. 6 caracteres)" 
              secureTextEntry 
              value={password} 
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors({...errors, password: ''});
              }}
            />
          </View>
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.buttonPrimary} onPress={registerEmail} disabled={loading}>
              <EmailIcon width={20} height={20} color="#fff" />
              <Text style={styles.buttonText}>Crear cuenta (Email)</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.oauthGoogle} onPress={registerGoogle} disabled={loading}>
              <GoogleIcon width={20} height={20} />
              <Text style={styles.buttonText}>Registrarme con Google</Text>
            </TouchableOpacity>
            
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
              </TouchableOpacity>
            </Link>
            
            {loading && <ActivityIndicator style={{ marginTop: 16 }} />}
          </View>
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
    paddingTop: screenHeight > 700 ? 40 : 20,
    paddingBottom: 20,
  },
  logo: {
    width: screenHeight > 700 ? 100 : 80,
    height: screenHeight > 700 ? 100 : 80,
    marginBottom: 15,
  },
  title: {
    fontSize: screenHeight > 700 ? 32 : 28,
    fontWeight: 'bold',
    color: '#16a34a',
    textAlign: 'center',
  },
  form: {
    flex: 1,
    paddingTop: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
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
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 4,
  },
  buttonsContainer: {
    marginTop: 20,
    paddingBottom: 20,
  },
  buttonPrimary: {
    backgroundColor: '#16a34a',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 50,
  },
  oauthGoogle: {
    backgroundColor: '#ea4335',
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
    color: '#2563eb',
    textAlign: 'center',
    fontSize: 16,
    paddingVertical: 10,
  },
});
