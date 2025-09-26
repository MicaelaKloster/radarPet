import { createClient } from "@supabase/supabase-js";
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from "react-native";

// Completar la sesión de WebBrowser cuando sea necesario
WebBrowser.maybeCompleteAuthSession();

// Configuración de Supabase
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Validar variables de entorno
if (!SUPABASE_URL) {
  throw new Error(
    "EXPO_PUBLIC_SUPABASE_URL no está definido en las variables de entorno"
  );
}

if (!SUPABASE_ANON_KEY) {
  throw new Error(
    "EXPO_PUBLIC_SUPABASE_ANON_KEY no está definido en las variables de entorno"
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === "web",
  },
});

// Configurar el manejo de enlaces profundos para móviles
if (Platform.OS !== "web") {
  const handleDeepLink = (url: string) => {
    // Extraer los parámetros de la URL
    if (url.includes('#access_token=')) {
      const params = new URLSearchParams(url.split('#')[1]);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      
      if (accessToken && refreshToken) {
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
      }
    }
  };

  // Configurar el listener de enlaces profundos
  const setupDeepLinkListener = () => {
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });
    
    return subscription;
  };

  // Manejar URL inicial si la app se abrió desde un enlace profundo
  Linking.getInitialURL().then((url) => {
    if (url) {
      handleDeepLink(url);
    }
  });

  // Configurar el listener
  setupDeepLinkListener();
}

// Funciones de autenticación

const getRedirectTo = () => {
  if (Platform.OS === "web") {
    return typeof window !== "undefined" ? window.location.origin + '/auth/callback' : "";
  }
  
  // Para móviles - usar IP local para desarrollo más estable
  if (__DEV__) {
    // Tu IP local específica - más estable que las URLs dinámicas de Expo
    const redirectUri = 'exp://192.168.144.89:8081/--/auth/callback';
    console.log('Redirect URI para desarrollo:', redirectUri);
    return redirectUri;
  }
  
  // Para producción (app compilada)
  return 'radarpet://auth/callback';
};

export const loginWithGoogle = async () => {
  try {
    if (Platform.OS === "web") {
      // Para web, usar el método estándar
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getRedirectTo(),
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Error en signInWithOAuth (web):', error);
        throw error;
      }

      return { data, error: null };
    } else {
      // Para móviles, usar WebBrowser para abrir la URL de autenticación
      const redirectTo = getRedirectTo();
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Error generando URL de OAuth:', error);
        throw error;
      }

      if (data.url) {
        // Abrir el navegador con la URL de autenticación
        const result = await WebBrowser.openAuthSessionAsync(
          data.url, 
          redirectTo
        );

        if (result.type === 'success' && result.url) {
          // Manejar la URL de retorno
          const returnUrl = result.url;
          
          // Extraer tokens de la URL de retorno
          if (returnUrl.includes('#access_token=') || returnUrl.includes('?access_token=')) {
            const url = new URL(returnUrl);
            const fragment = url.hash || url.search;
            const params = new URLSearchParams(fragment.replace('#', '').replace('?', ''));
            
            const access_token = params.get('access_token');
            const refresh_token = params.get('refresh_token');
            
            if (access_token && refresh_token) {
              const { error: sessionError } = await supabase.auth.setSession({
                access_token,
                refresh_token,
              });
              
              if (sessionError) {
                throw sessionError;
              }
              
              return { data: { user: null, session: null }, error: null };
            }
          }
        }

        if (result.type === 'cancel') {
          return { data: null, error: new Error('Autenticación cancelada por el usuario') };
        }
      }

      return { data: null, error: new Error('No se pudo obtener la URL de autenticación') };
    }
  } catch (error) {
    console.error('Error en loginWithGoogle:', error);
    return { data: null, error };
  }
};

// Alias para registro con Google (misma funcionalidad)
export const registerWithGoogle = loginWithGoogle;

export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
