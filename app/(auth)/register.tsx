import { EmailIcon, EyeIcon, EyeOffIcon, GoogleIcon, LockIcon, MapIcon, PhoneIcon, UserIcon } from '@/components/Icons';
import { registerWithGoogle, supabase } from '@/lib/supabase';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { decode as base64ToArrayBuffer } from 'base64-arraybuffer';
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
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(null);
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
        ciudad: ciudad.trim(),
        avatar_url: uploadedAvatarUrl 
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

  const elegirImagen = async () => {
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

    const file = result.assets[0];
    setAvatarUri(file.uri);

    setLoading(true);
    try {
      const extension = file.uri.split('.').pop();
      const fileName = `${Date.now()}.${extension}`;
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

      const { error } = await supabase.storage
        .from('fotos-perfil')
        .upload(filePath, uploadData, {
          contentType: file.mimeType || 'image/jpeg',
        });

      if (error) {
        Alert.alert('Error', 'No se pudo subir la imagen: ' + error.message);
        setLoading(false);
        return;
      }

      const { data } = supabase.storage.from('fotos-perfil').getPublicUrl(filePath);
      setUploadedAvatarUrl(data.publicUrl);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo subir la imagen');
    }
    setLoading(false);
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
    
    try {
      setLoading(true);
      const { error } = await registerWithGoogle();
      if (error) {
        setLoading(false);
        if (error.message !== 'Cancelado') {
          Alert.alert('Error', error.message);
        }
        return;
      }
      setLoading(false);
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 100);
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
          <Text style={styles.title}>Regístrate</Text>
        </View>

        <View style={styles.form}>
          <TouchableOpacity onPress={elegirImagen} style={styles.avatarContainer}>
            <View style={styles.avatarWrapper}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatar} resizeMode="cover" />
              ) : (
                <Text style={styles.avatarPlaceholder}>+</Text>
              )}
            </View>
            <Text style={styles.avatarText}>Seleccionar foto de perfil</Text>
          </TouchableOpacity>

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
          
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.buttonPrimary} onPress={registerEmail} disabled={loading}>
              <EmailIcon width={20} height={20} color="#fff" />
              <Text style={styles.buttonText}>Crear cuenta (Email)</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.oauthGoogle} onPress={registerGoogle} disabled={loading}>
              <GoogleIcon width={20} height={20} />
              <Text style={styles.buttonTextGoogle}>Registrarme con Google</Text>
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
    color: '#fff',
    textAlign: 'center',
  },
  form: {
    flex: 1,
    paddingTop: 10,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#012531',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    fontSize: 40,
    color: '#012531',
    fontWeight: 'bold',
  },
  avatarText: {
    color: '#fff',
    marginTop: 8,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
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
