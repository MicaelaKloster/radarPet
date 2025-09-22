import { createClient } from "@supabase/supabase-js";
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from "react-native";

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

// Funciones de autenticación

export const signInWithProvider = async (
  provider: "google" | "facebook" | "apple"
) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider,
    options: {
      redirectTo: getRedirectTo(),
    },
  });
  if (error) throw error;
  return data;
};

const getRedirectTo = () => {
  if (Platform.OS === "web") {
    return typeof window !== "undefined" ? window.location.origin : "";
  }
  return AuthSession.makeRedirectUri({ useProxy: true });
};

export const loginWithGoogle = async () => {
  if (Platform.OS === "web") {
    return signInWithProvider("google");
  }

  const redirectUri = AuthSession.makeRedirectUri({
    useProxy: true,
  });

  const authUrl = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUri)}`;

  try {
    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

    if (result.type === 'success' && result.url) {
      const url = new URL(result.url);
      const access_token = url.searchParams.get('access_token');
      const refresh_token = url.searchParams.get('refresh_token');
      
      if (access_token && refresh_token) {
        const { data, error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        return { data, error };
      }
    }

    return { data: null, error: new Error('Autenticación cancelada') };
  } catch (error) {
    return { data: null, error };
  }
};

export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
