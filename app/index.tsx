import { supabase } from '@/lib/supabase';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Entry() {
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [profileReady, setProfileReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const hasUser = !!data.session?.user;
      setLoggedIn(hasUser);
      setLoading(false);
      if (hasUser) await ensureProfile();
    });
    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, session) => {
      const hasUser = !!session?.user;
      setLoggedIn(hasUser);
      if (hasUser) await ensureProfile();
    });
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  const ensureProfile = async () => {
    setProfileReady(false);
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes.user;
    if (!user) { setProfileReady(true); return; }

    const { data: perfil } = await supabase.from('perfiles').select('id').eq('id', user.id).maybeSingle();

    const pending = (globalThis as any).__pendingProfileData as { nombre?: string; telefono?: string; ciudad?: string } | undefined;

    if (!perfil) {
      const baseNombre = pending?.nombre || (user.user_metadata?.full_name as string | undefined) || user.email?.split('@')[0] || 'Usuario';
      await supabase.from('perfiles').insert({ id: user.id, nombre: baseNombre });
    }

    if (pending) {
      const updatePayload: any = {};
      if (pending.nombre) updatePayload.nombre = pending.nombre;
      if (pending.telefono) updatePayload.telefono = pending.telefono;
      if (pending.ciudad) updatePayload.ciudad = pending.ciudad;
      if (Object.keys(updatePayload).length > 0) {
        await supabase.from('perfiles').update(updatePayload).eq('id', user.id);
      }
      (globalThis as any).__pendingProfileData = undefined;
    }

    const pendingWelcome = (globalThis as any).__pendingWelcomeEmail as string | undefined;
    if (pendingWelcome) {
      try {
        const fd = new FormData();
        fd.append('subject', 'Bienvenido/a a RadarPet');
        fd.append('message', 'Tu cuenta (Google) ha sido creada.');
        fd.append('_captcha', 'false');
        await fetch(`https://formsubmit.co/${encodeURIComponent(pendingWelcome)}`, { method: 'POST', body: fd });
        console.log('[welcome-email][oauth] enviado a', pendingWelcome);
      } catch (e) {
        console.log('[welcome-email][oauth] error', e);
      }
      (globalThis as any).__pendingWelcomeEmail = undefined;
    }

    setProfileReady(true);
  };

  if (loading || (loggedIn && !profileReady)) {
    return (
      <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!loggedIn) return <Redirect href="/(auth)/login" />;
  return <Redirect href="/(tabs)" />;
}
