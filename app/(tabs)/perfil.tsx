import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import Encabezado from '../perfil/encabezado';
import MisMascotas from '../perfil/mis-mascotas';

type Mascota = {
  id: string;
  nombre: string;
  fotoPrincipalUrl: string | null;
  especieId: number | null;
};

export default function ProfileScreen() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [nombre, setNombre] = useState<string>('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [loggingOut, setLoggingOut] = useState(false);

  const [stats, setStats] = useState({
    perdidas: 0,
    encontradas: 0,
    reuniones: 0,
    loading: true,
  });

  const [activity, setActivity] = useState<{
    loading: boolean;
    items: {
      id: string;
      at?: string | null;
      type: 'reporte' | 'seguimiento' | 'mascota';
      title: string;
      subtitle?: string;
    }[];
  }>({ loading: true, items: [] });

  const router = useRouter();

  const recargarMascotas = async () => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from('mascotas')
        .select('id, nombre, foto_principal_url, especie_id')
        .eq('estado', 'AC')
        .eq('duenio_id', userId);

      if (error) throw error;

      const mascotasFormateadas: Mascota[] = (data || []).map((m) => ({
        id: m.id,
        nombre: m.nombre,
        fotoPrincipalUrl: m.foto_principal_url,
        especieId: m.especie_id,
      }));

      setMascotas(mascotasFormateadas);
    } catch (error) {
      console.error('Error recargando mascotas:', error);
    }
  };

  useEffect(() => {
    const loadCounts = async (userId: string) => {
      try {
        setStats((prev) => ({ ...prev, loading: true }));

        const [tipoPerdidaRes, tipoEncontradaRes, estadosCierre] =
          await Promise.all([
            supabase
              .from('tipos_reportes')
              .select('id')
              .eq('nombre', 'perdida')
              .eq('estado', 'AC')
              .maybeSingle(),
            supabase
              .from('tipos_reportes')
              .select('id')
              .eq('nombre', 'encontrada')
              .eq('estado', 'AC')
              .maybeSingle(),
            supabase
              .from('estados_reportes')
              .select('id,nombre')
              .in('nombre', ['cerrado', 'resuelto', 'reunido'])
              .eq('estado', 'AC'),
          ]);

        const tipoPerdidaId = (tipoPerdidaRes.data as any)?.id || null;
        const tipoEncontradaId = (tipoEncontradaRes.data as any)?.id || null;
        const estadosCierreIds =
          (estadosCierre.data as any[])?.map((r) => r.id) || [];

        const [perdidasCntRes, encontradasCntRes, reunionesCntRes] =
          await Promise.all([
            tipoPerdidaId
              ? supabase
                  .from('reportes')
                  .select('id', { count: 'exact', head: true })
                  .eq('estado', 'AC')
                  .eq('reportero_id', userId)
                  .eq('tipo_id', tipoPerdidaId)
              : Promise.resolve({ count: 0 } as any),
            tipoEncontradaId
              ? supabase
                  .from('reportes')
                  .select('id', { count: 'exact', head: true })
                  .eq('estado', 'AC')
                  .eq('reportero_id', userId)
                  .eq('tipo_id', tipoEncontradaId)
              : Promise.resolve({ count: 0 } as any),
            estadosCierreIds.length
              ? supabase
                  .from('reportes')
                  .select('id', { count: 'exact', head: true })
                  .eq('estado', 'AC')
                  .eq('reportero_id', userId)
                  .in('estado_id', estadosCierreIds)
              : Promise.resolve({ count: 0 } as any),
          ]);

        setStats({
          perdidas: (perdidasCntRes as any)?.count ?? 0,
          encontradas: (encontradasCntRes as any)?.count ?? 0,
          reuniones: (reunionesCntRes as any)?.count ?? 0,
          loading: false,
        });
      } catch (e) {
        console.warn('[Perfil] Error cargando contadores:', e);
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };

    const loadActivity = async (userId: string) => {
      try {
        setActivity((prev) => ({ ...prev, loading: true }));

        const repTry1 = await supabase
          .from('reportes')
          .select('id,titulo,created_at')
          .eq('estado', 'AC')
          .eq('reportero_id', userId)
          .order('created_at', { ascending: false })
          .limit(20);

        const rep = repTry1.error
          ? await supabase
              .from('reportes')
              .select('id,titulo')
              .eq('estado', 'AC')
              .eq('reportero_id', userId)
              .order('id', { ascending: false })
              .limit(20)
          : repTry1;

        const segTry1 = await supabase
          .from('seguimientos')
          .select('id,reporte_id,created_at')
          .eq('estado', 'AC')
          .eq('usuario_id', userId)
          .order('created_at', { ascending: false })
          .limit(20);

        const seg = segTry1.error
          ? await supabase
              .from('seguimientos')
              .select('id,reporte_id')
              .eq('estado', 'AC')
              .eq('usuario_id', userId)
              .order('id', { ascending: false })
              .limit(20)
          : segTry1;

        const masTry1 = await supabase
          .from('mascotas')
          .select('id,nombre,created_at')
          .eq('estado', 'AC')
          .eq('duenio_id', userId)
          .order('created_at', { ascending: false })
          .limit(20);

        const mas = masTry1.error
          ? await supabase
              .from('mascotas')
              .select('id,nombre')
              .eq('estado', 'AC')
              .eq('duenio_id', userId)
              .order('id', { ascending: false })
              .limit(20)
          : masTry1;

        const items: {
          id: string;
          at?: string | null;
          type: 'reporte' | 'seguimiento' | 'mascota';
          title: string;
          subtitle?: string;
        }[] = [];

        (rep.data as any[])?.forEach((r) =>
          items.push({
            id: `rep-${r.id}`,
            at: r.created_at ?? null,
            type: 'reporte',
            title: r.titulo || 'Reporte creado',
            subtitle: `Reporte #${r.id}`,
          })
        );

        (seg.data as any[])?.forEach((s) =>
          items.push({
            id: `seg-${s.id}`,
            at: s.created_at ?? null,
            type: 'seguimiento',
            title: 'Comenzaste a seguir un reporte',
            subtitle: `Reporte #${s.reporte_id}`,
          })
        );

        (mas.data as any[])?.forEach((m) =>
          items.push({
            id: `mas-${m.id}`,
            at: m.created_at ?? null,
            type: 'mascota',
            title: 'Registraste una mascota',
            subtitle: m.nombre ? String(m.nombre) : undefined,
          })
        );

        items.sort(
          (a, b) =>
            new Date(b.at || 0).getTime() - new Date(a.at || 0).getTime()
        );

        setActivity({ loading: false, items: items.slice(0, 20) });
      } catch (e) {
        console.warn('[Perfil] Error cargando actividad:', e);
        setActivity({ loading: false, items: [] });
      }
    };

    const loadUserData = async (user: any) => {
      try {
        const { data: perfil } = await supabase
          .from('perfiles')
          .select('nombre, avatar_url')
          .eq('id', user.id)
          .maybeSingle();

        if (perfil) {
          setNombre(perfil.nombre || '');
          setAvatarUri(perfil.avatar_url || null);
        }
      } catch (error) {
        console.error('Error cargando datos del perfil:', error);
      }
    };

    const load = async () => {
      const sessRes: any = await supabase.auth.getSession();
      let user = sessRes?.data?.session?.user ?? null;

      if (!user) {
        const { data: u } = await supabase.auth.getUser();
        user = u?.user ?? null;
      }

      setUserEmail(user?.email ?? null);
      setUserId(user?.id ?? null);

      if (user) {
        await loadUserData(user);
        await Promise.all([
          loadCounts(user.id),
          loadActivity(user.id),
          recargarMascotas(),
        ]);
      } else {
        setStats({ perdidas: 0, encontradas: 0, reuniones: 0, loading: false });
        setActivity({ loading: false, items: [] });
        setMascotas([]);
      }
    };

    load();
  }, []);

  const handleAvatarChange = (newUrl: string) => {
    setAvatarUri(newUrl);
  };

  const logout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace('/(auth)/login');
    } catch (error: any) {
      Alert.alert('Error', error.message);
      setLoggingOut(false);
    }
  };

  const formatDate = (iso?: string | null) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return iso || '';
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Encabezado
        nombre={nombre}
        email={userEmail}
        avatarUri={avatarUri}
        userId={userId}
        onAvatarChange={handleAvatarChange}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Mis Reportes
          </ThemedText>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <IconSymbol
                size={24}
                name="exclamationmark.triangle.fill"
                color="#FF6B6B"
              />
              <ThemedText style={styles.statNumber}>
                {stats.loading ? '...' : String(stats.perdidas)}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Perdidas</ThemedText>
            </View>
            <View style={styles.statItem}>
              <IconSymbol
                size={24}
                name="checkmark.circle.fill"
                color="#4ECDC4"
              />
              <ThemedText style={styles.statNumber}>
                {stats.loading ? '...' : String(stats.encontradas)}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Encontradas</ThemedText>
            </View>
            <View style={styles.statItem}>
              <IconSymbol size={24} name="heart.fill" color="#FF9F43" />
              <ThemedText style={styles.statNumber}>
                {stats.loading ? '...' : String(stats.reuniones)}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Reuniones</ThemedText>
            </View>
          </View>
        </View>

        {userId && (
          <MisMascotas
            mascotas={mascotas}
            setMascotas={setMascotas}
            userId={userId}
            recargarMascotas={recargarMascotas}
          />
        )}

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Historial de Actividad
          </ThemedText>
          {activity.loading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="small" />
              <ThemedText style={[styles.emptySubtext, { marginTop: 10 }]}>
                Cargando actividad...
              </ThemedText>
            </View>
          ) : activity.items.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol size={50} name="clock.fill" color="#999" />
              <ThemedText style={styles.emptyText}>Sin actividad reciente</ThemedText>
              <ThemedText style={styles.emptySubtext}>
                Aquí verás tus reportes y otras interacciones
              </ThemedText>
            </View>
          ) : (
            <View
              style={{ backgroundColor: '#F8F9FA', borderRadius: 12, padding: 10 }}
            >
              {activity.items.map((item) => (
                <View key={item.id} style={styles.activityItem}>
                  <IconSymbol
                    size={18}
                    name={
                      item.type === 'reporte'
                        ? 'doc.plaintext'
                        : item.type === 'mascota'
                        ? 'pawprint.fill'
                        : 'bell.fill'
                    }
                    color={
                      item.type === 'reporte'
                        ? '#4ECDC4'
                        : item.type === 'mascota'
                        ? '#2E86AB'
                        : '#999'
                    }
                  />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <ThemedText style={styles.activityTitle}>
                      {item.title}
                    </ThemedText>
                    {!!item.subtitle && (
                      <ThemedText style={styles.activitySubtitle}>
                        {item.subtitle}
                      </ThemedText>
                    )}
                  </View>
                  {!!item.at && (
                    <ThemedText style={styles.activityDate}>
                      {formatDate(item.at)}
                    </ThemedText>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Configuración
        </ThemedText>

        <View style={styles.menuItem}>
          <TouchableOpacity
            style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}
            onPress={() => router.push('/perfil/notificaciones')}
          >
            <IconSymbol size={20} name="bell.fill" color="#666" />
            <ThemedText style={styles.menuText}>Notificaciones</ThemedText>
            <IconSymbol size={16} name="chevron.right" color="#999" />
          </TouchableOpacity>
        </View>

        <View style={styles.menuItem}>
          <TouchableOpacity
            style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}
            onPress={() => router.push('/perfil/ubicacion')}
          >
            <IconSymbol size={20} name="location.fill" color="#666" />
            <ThemedText style={styles.menuText}>Ubicación</ThemedText>
            <IconSymbol size={16} name="chevron.right" color="#999" />
          </TouchableOpacity>
        </View>

        <View style={styles.menuItem}>
          <TouchableOpacity
            style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}
            onPress={() => router.push('/perfil/privacidad')}
          >
            <IconSymbol size={20} name="envelope.fill" color="#666" />
            <ThemedText style={styles.menuText}>Correo</ThemedText>
            <IconSymbol size={16} name="chevron.right" color="#999" />
          </TouchableOpacity>
        </View>

        <View style={styles.menuItem}>
          <TouchableOpacity
            style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}
            onPress={() => router.push('/perfil/soporte')}
          >
            <IconSymbol size={20} name="questionmark.circle.fill" color="#666" />
            <ThemedText style={styles.menuText}>Ayuda y Soporte</ThemedText>
            <IconSymbol size={16} name="chevron.right" color="#999" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={[styles.menuItem, styles.logoutItem]}>
            <TouchableOpacity
              style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}
              onPress={logout}
              disabled={loggingOut}
            >
              <IconSymbol
                size={20}
                name="rectangle.portrait.and.arrow.right.fill"
                color={loggingOut ? '#ccc' : '#FF6B6B'}
              />
              <ThemedText
                style={[styles.menuText, styles.logoutText]}
              >
                {loggingOut ? 'Cerrando...' : 'Cerrar Sesión'}
              </ThemedText>
              {loggingOut && <ActivityIndicator size="small" />}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  content: { flex: 1, paddingHorizontal: 20 },
  section: { marginTop: 25 },
  sectionTitle: { marginBottom: 15, color: '#333' },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
  },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: 'bold', marginTop: 8, marginBottom: 4 },
  statLabel: { fontSize: 12, opacity: 0.6 },

  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  emptyText: { fontSize: 16, fontWeight: '600', marginTop: 15 },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  menuText: { flex: 1, fontSize: 16, marginLeft: 15 },
  logoutItem: { backgroundColor: '#FFF5F5', borderWidth: 1, borderColor: '#FFE5E5' },
  logoutText: { color: '#FF6B6B' },

  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF1',
  },
  activityTitle: { fontSize: 14, fontWeight: '600' },
  activitySubtitle: { fontSize: 12, opacity: 0.7 },
  activityDate: { fontSize: 10, opacity: 0.6, marginLeft: 8 },
})