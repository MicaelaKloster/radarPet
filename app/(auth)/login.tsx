import { EmailIcon, GoogleIcon, LockIcon } from '@/components/Icons';
import { loginWithGoogle, supabase } from '@/lib/supabase';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import styled from 'styled-components/native';

const StyledContainer = styled.View`
  flex: 1;
  justify-content: center;
  padding: 24px;
  background-color: #fff;
`;

const StyledTitle = styled.Text`
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 32px;
  text-align: center;
  color: #2CBDAA;
`;

const StyledErrorText = styled.Text`
  color: #dc2626;
  font-size: 14px;
  margin-top: 4px;
  margin-bottom: 8px;
`;

export default function LoginScreen() {
  const router = useRouter();
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
    const { error } = await loginWithGoogle();
    setLoading(false);
    if (error) Alert.alert('Error', error.message);
  };

  return (
    <StyledContainer>
      <Image
        source={require('@/Iconos/Logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <StyledTitle>RadarPet</StyledTitle>
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
      {errors.email ? <StyledErrorText>{errors.email}</StyledErrorText> : null}
      
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
      {errors.password ? <StyledErrorText>{errors.password}</StyledErrorText> : null}
      
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
    </StyledContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  logo: { width: 100, height: 100, alignSelf: 'center', marginBottom: 20 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 32, textAlign: 'center', color: '#2CBDAA' },
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
  link: { marginTop: 16, color: '#2CBDAA', textAlign: 'center' },
  oauthGoogle: { 
    backgroundColor: '#249A8A', 
    padding: 16, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  buttonPrimary: { 
    backgroundColor: '#2CBDAA', 
    padding: 16, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  input: { height: 50, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, paddingHorizontal: 16, marginBottom: 16 },
});
