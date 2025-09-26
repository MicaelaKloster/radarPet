
import { supabase } from '@/lib/supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Verificar si hay tokens en los parámetros de la URL
        const { access_token, refresh_token } = params;
        
        if (access_token && refresh_token) {
          // Establecer la sesión con los tokens recibidos
          const { error } = await supabase.auth.setSession({
            access_token: access_token as string,
            refresh_token: refresh_token as string,
          });

          if (error) {
            console.error('Error estableciendo sesión:', error);
            router.replace('/(auth)/login');
            return;
          }
        }

        // Verificar si hay una sesión activa
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error obteniendo sesión:', sessionError);
          router.replace('/(auth)/login');
          return;
        }
        
        if (session) {
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)/login');
        }
      } catch (error) {
        console.error('Error en callback de autenticación:', error);
        router.replace('/(auth)/login');
      }
    };

    handleAuthCallback();
  }, [params, router]);

  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: '#fff'
    }}>
      <ActivityIndicator size="large" color="#2CBDAA" />
      <Text style={{ 
        marginTop: 20, 
        fontSize: 16, 
        color: '#666',
        textAlign: 'center'
      }}>
        Completando autenticación...
      </Text>
    </View>
  );
}