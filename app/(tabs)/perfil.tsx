import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { supabase } from '@/lib/supabase';

export default function ProfileScreen() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [nombre, setNombre] = useState<string>('');
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const { data: u } = await supabase.auth.getUser();
      const user = u.user;
      setUserEmail(user?.email ?? null);
      if (user) {
        const { data: perfil } = await supabase.from('perfiles').select('nombre').eq('id', user.id).maybeSingle();
        if (perfil?.nombre) setNombre(perfil.nombre);
      }
    };
    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  const logout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    if (error) { setLoggingOut(false); Alert.alert('Error al cerrar sesión', error.message); return; }
    const after = await supabase.auth.getSession();
    if (after.data.session) {
      try {
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          Object.keys(localStorage).forEach(k => { if (k.startsWith('sb-')) localStorage.removeItem(k); });
        }
      } catch {}
    }
    (globalThis as any).__pendingProfileData = undefined;
    router.replace('/(auth)/login');
    setLoggingOut(false);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <View style={styles.avatarContainer}>
          <IconSymbol size={60} name='person.fill' color='#2E86AB' />
        </View>
        <ThemedText type='title' style={styles.userName}>{nombre || 'Usuario'}</ThemedText>
        <ThemedText style={styles.userEmail}>{userEmail || ''}</ThemedText>
      </ThemedView>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <ThemedText type='subtitle' style={styles.sectionTitle}>Mis Reportes</ThemedText>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <IconSymbol size={24} name='exclamationmark.triangle.fill' color='#FF6B6B' />
              <ThemedText style={styles.statNumber}>0</ThemedText>
              <ThemedText style={styles.statLabel}>Perdidas</ThemedText>
            </View>
            <View style={styles.statItem}>
              <IconSymbol size={24} name='checkmark.circle.fill' color='#4ECDC4' />
              <ThemedText style={styles.statNumber}>0</ThemedText>
              <ThemedText style={styles.statLabel}>Encontradas</ThemedText>
            </View>
            <View style={styles.statItem}>
              <IconSymbol size={24} name='heart.fill' color='#FF9F43' />
              <ThemedText style={styles.statNumber}>0</ThemedText>
              <ThemedText style={styles.statLabel}>Reuniones</ThemedText>
            </View>
          </View>
        </View>
        <View style={styles.section}>
          <ThemedText type='subtitle' style={styles.sectionTitle}>Mis Mascotas Registradas</ThemedText>
          <View style={styles.emptyState}>
            <IconSymbol size={50} name='pawprint.fill' color='#999' />
            <ThemedText style={styles.emptyText}>No tienes mascotas registradas</ThemedText>
            <ThemedText style={styles.emptySubtext}>Registra tus mascotas para crear reportes más rápido</ThemedText>
            <View style={styles.addButton}><ThemedText style={styles.addButtonText}>+ Agregar Mascota</ThemedText></View>
          </View>
        </View>
        <View style={styles.section}>
          <ThemedText type='subtitle' style={styles.sectionTitle}>Historial de Actividad</ThemedText>
          <View style={styles.emptyState}>
            <IconSymbol size={50} name='clock.fill' color='#999' />
            <ThemedText style={styles.emptyText}>Sin actividad reciente</ThemedText>
            <ThemedText style={styles.emptySubtext}>Aquí verás tus reportes y otras interacciones</ThemedText>
          </View>
        </View>
        <View style={styles.section}>
          <ThemedText type='subtitle' style={styles.sectionTitle}>Configuración</ThemedText>
          <View style={styles.menuItem}>
            <IconSymbol size={20} name='bell.fill' color='#666' />
            <ThemedText style={styles.menuText}>Notificaciones</ThemedText>
            <IconSymbol size={16} name='chevron.right' color='#999' />
          </View>
          <View style={styles.menuItem}>
            <IconSymbol size={20} name='location.fill' color='#666' />
            <ThemedText style={styles.menuText}>Ubicación</ThemedText>
            <IconSymbol size={16} name='chevron.right' color='#999' />
          </View>
          <View style={styles.menuItem}>
            <IconSymbol size={20} name='shield.fill' color='#666' />
            <ThemedText style={styles.menuText}>Privacidad</ThemedText>
            <IconSymbol size={16} name='chevron.right' color='#999' />
          </View>
          <View style={styles.menuItem}>
            <IconSymbol size={20} name='questionmark.circle.fill' color='#666' />
            <ThemedText style={styles.menuText}>Ayuda y Soporte</ThemedText>
            <IconSymbol size={16} name='chevron.right' color='#999' />
          </View>
        </View>
        <View style={styles.section}>
          <View style={[styles.menuItem, styles.logoutItem]}>
            <TouchableOpacity style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }} onPress={logout} disabled={loggingOut}>
              <IconSymbol size={20} name='rectangle.portrait.and.arrow.right.fill' color={loggingOut ? '#ccc' : '#FF6B6B'} />
              <ThemedText style={[styles.menuText, styles.logoutText]}>{loggingOut ? 'Cerrando...' : 'Cerrar Sesión'}</ThemedText>
              {loggingOut && <ActivityIndicator size='small' />}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  header: { alignItems: 'center', paddingHorizontal: 20, paddingBottom: 30, borderBottomWidth: 1, borderBottomColor: '#E9ECEF' },
  avatarContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F8F9FA', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  userName: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  userEmail: { fontSize: 14, opacity: 0.6 },
  content: { flex: 1, paddingHorizontal: 20 },
  section: { marginTop: 25 },
  sectionTitle: { marginBottom: 15, color: '#333' },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#F8F9FA', borderRadius: 12, padding: 20 },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: 'bold', marginTop: 8, marginBottom: 4 },
  statLabel: { fontSize: 12, opacity: 0.6 },
  emptyState: { alignItems: 'center', padding: 40, backgroundColor: '#F8F9FA', borderRadius: 12 },
  emptyText: { fontSize: 16, fontWeight: '600', marginTop: 15 },
  emptySubtext: { fontSize: 14, opacity: 0.6, textAlign: 'center', marginTop: 8, marginBottom: 20 },
  addButton: { backgroundColor: '#2E86AB', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  addButtonText: { color: 'white', fontSize: 14, fontWeight: '600' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 15, backgroundColor: '#F8F9FA', borderRadius: 8, marginBottom: 8 },
  menuText: { flex: 1, fontSize: 16, marginLeft: 15 },
  logoutItem: { backgroundColor: '#FFF5F5', borderWidth: 1, borderColor: '#FFE5E5' },
  logoutText: { color: '#FF6B6B' },
});
