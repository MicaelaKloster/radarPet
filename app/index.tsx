import { supabase } from '@/lib/supabase';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Entry() {
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(!!data.session?.user);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const hasUser = !!session?.user;
      setLoggedIn(hasUser);
      if (!hasUser) {
        setLoading(false);
      }
    });

    return () => { sub.subscription.unsubscribe(); };
  }, []);

  if (loading) {
    return (
      <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!loggedIn) return <Redirect href="/(auth)/login" />;
  return <Redirect href="/(tabs)" />;
}
