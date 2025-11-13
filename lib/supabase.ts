import { createClient } from "@supabase/supabase-js";
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession();

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const DEV_IP = process.env.EXPO_PUBLIC_DEV_IP;

if (!SUPABASE_URL) {
  throw new Error("EXPO_PUBLIC_SUPABASE_URL no está definido en las variables de entorno");
}

if (!SUPABASE_ANON_KEY) {
  throw new Error("EXPO_PUBLIC_SUPABASE_ANON_KEY no está definido en las variables de entorno");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === "web",
    storage: Platform.OS === 'web' ? undefined : {
      getItem: async (key: string) => {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        return await AsyncStorage.getItem(key);
      },
      setItem: async (key: string, value: string) => {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.setItem(key, value);
      },
      removeItem: async (key: string) => {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.removeItem(key);
      },
    },
  },
});

if (Platform.OS !== "web") {
  const handleDeepLink = (url: string) => {
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

  const setupDeepLinkListener = () => {
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });
    
    return subscription;
  };

  Linking.getInitialURL().then((url) => {
    if (url) {
      handleDeepLink(url);
    }
  });

  setupDeepLinkListener();
}

const getRedirectTo = () => {
  if (Platform.OS === "web") {
    return typeof window !== "undefined" ? window.location.origin + '/auth/callback' : "";
  }
  
  if (__DEV__) {
    const ip = DEV_IP;
    return `exp://${ip}:8081/--/auth/callback`;
  }
  
  return 'radarpet://auth/callback';
};

export const loginWithGoogle = async () => {
  try {
    const redirectTo = getRedirectTo();
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: Platform.OS !== 'web',
        queryParams: {
          prompt: 'select_account',
        },
      },
    });

    if (error) throw error;

    if (Platform.OS !== 'web' && data?.url) {
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

      if (result.type === 'cancel') {
        throw new Error('Cancelado');
      }

      if (result.type === 'success' && result.url) {
        const hash = result.url.split('#')[1];
        if (hash) {
          const params = new URLSearchParams(hash);
          const access_token = params.get('access_token');
          const refresh_token = params.get('refresh_token');
          
          if (access_token && refresh_token) {
            await supabase.auth.setSession({ access_token, refresh_token });
          }
        }
      }
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const registerWithGoogle = loginWithGoogle;

export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
