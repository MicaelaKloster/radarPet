import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// Para desarrollo local, necesitas obtener la clave real de Supabase
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://goxopvfsbdyyxysxirhc.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase Config:', {
  url: SUPABASE_URL,
  hasKey: !!SUPABASE_ANON_KEY
});

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Variables Supabase faltantes. Verifica tu archivo .env');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true, // restaurado para conservar la sesión y permitir upload inmediato
    detectSessionInUrl: true,
  },
});

// Helper genérico (se mantiene por compatibilidad)
export const signInWithProvider = async (provider: 'google') => {
  return loginWithGoogle();
};

// Obtener redirect dinámico recomendado
const getRedirectTo = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    // Volver a la raíz (siteURL debe coincidir o estar en Additional Redirect URLs)
    return window.location.origin;
  }
  // Para nativo usar el scheme configurado en app.json
  return 'radarpet://';
};

export const loginWithGoogle = async () => {
  const redirectTo = getRedirectTo();
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: false,
    },
  });
};
