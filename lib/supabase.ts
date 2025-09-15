import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

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
  // Para mobile, puedes personalizar la URL de redirección
  return "radarpet://auth/callback";
};

export const loginWithGoogle = async () => {
  return signInWithProvider("google");
};

export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
