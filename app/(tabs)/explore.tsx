import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useAppFonts } from '@/hooks/useFonts';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/Theme';

interface Reporte {
  id: string;
  titulo: string;
  descripcion: string;
  creado_en: string;
  recompensa: number | null;
  direccion_referencia: string | null;
  mascota: {
    nombre: string;
    especie: {
      nombre: string;
    };
    raza: string | null;
    color: string | null;
    foto_principal_url: string | null;
  } | null;
  reportero: {
    nombre: string;
    telefono: string | null;
  };
  fotos_reportes: {
    ruta_storage: string;
  }[];
}

const ReportesMascotasPerdidas = () => {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filtroActivo, setFiltroActivo] = useState<'perdidas' | 'encontradas'>('perdidas');
  
  const fontsLoaded = useAppFonts();
  
  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  useEffect(() => {
    cargarReportes();
  }, [filtroActivo]);

  const cargarReportes = async () => {
    try {
      setLoading(true);
      
      // Obtener el tipo de reporte según el filtro activo
      const { data: tipoReporte } = await supabase
        .from('tipos_reportes')
        .select('id')
        .eq('nombre', filtroActivo === 'perdidas' ? 'perdida' : 'encontrada')
        .eq('estado', 'AC')
        .single();

      if (!tipoReporte) {
        console.log('No se encontró el tipo de reporte');
        setReportes([]);
        return;
      }

      const { data, error } = await supabase
        .from('reportes')
        .select(`
          id,
          titulo,
          descripcion,
          creado_en,
          recompensa,
          direccion_referencia,
          mascota:mascota_id (
            nombre,
            raza,
            color,
            foto_principal_url,
            especie:especie_id (
              nombre
            )
          ),
          reportero:reportero_id (
            nombre,
            telefono
          ),
          fotos_reportes (
            ruta_storage
          )
        `)
        .eq('tipo_id', tipoReporte.id)
        .eq('estado', 'AC')
        .order('creado_en', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error cargando reportes:', error);
        Alert.alert('Error', 'No se pudieron cargar los reportes');
        return;
      }

      setReportes(data || []);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarReportes();
  };

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Hoy';
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return `${diffDays} días`;
    } else {
      return date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      });
    }
  };

  const obtenerImagenMascota = (reporte: Reporte): string | null => {
    // Priorizar foto principal de la mascota
    if (reporte.mascota?.foto_principal_url) {
      return reporte.mascota.foto_principal_url;
    }
    
    // Si no hay foto principal, usar la primera foto del reporte
    if (reporte.fotos_reportes && reporte.fotos_reportes.length > 0) {
      return reporte.fotos_reportes[0].ruta_storage;
    }
    
    return null;
  };

  const reportesFiltrados = reportes.filter(reporte => {
    if (!searchText) return true;
    
    const searchLower = searchText.toLowerCase();
    const nombreMascota = reporte.mascota?.nombre?.toLowerCase() || '';
    const titulo = reporte.titulo.toLowerCase();
    const descripcion = reporte.descripcion?.toLowerCase() || '';
    const raza = reporte.mascota?.raza?.toLowerCase() || '';
    
    return nombreMascota.includes(searchLower) ||
           titulo.includes(searchLower) ||
           descripcion.includes(searchLower) ||
           raza.includes(searchLower);
  });

  const handleContactar = (reporte: Reporte) => {
    const telefono = reporte.reportero.telefono;
    if (telefono) {
      Alert.alert(
        'Contactar',
        `¿Deseas contactar a ${reporte.reportero.nombre}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Llamar', 
            onPress: () => {
              // Aquí podrías abrir el marcador telefónico
              Alert.alert('Teléfono', telefono);
            }
          }
        ]
      );
    } else {
      Alert.alert('Sin contacto', 'No hay información de contacto disponible');
    }
  };

  const renderReporte = (reporte: Reporte) => {
    const imagenUrl = obtenerImagenMascota(reporte);
    
    return (
      <View key={reporte.id} style={styles.reporteCard}>
        <View style={styles.reporteHeader}>
          <View style={styles.mascotaImagenContainer}>
            {imagenUrl ? (
              <Image
                source={{ uri: imagenUrl }}
                style={styles.mascotaImagen}
                onError={() => console.log('Error cargando imagen')}
              />
            ) : (
              <View style={[styles.mascotaImagen, styles.placeholderImagen]}>
                <Ionicons name="paw" size={24} color={Colors.textTertiary} />
              </View>
            )}
          </View>
          
          <View style={styles.reporteInfo}>
            <Text style={styles.reporteTitulo}>
              {reporte.titulo}
            </Text>
            
            {reporte.mascota && (
              <Text style={styles.mascotaInfo}>
                {reporte.mascota.nombre} • {reporte.mascota.especie.nombre}
                {reporte.mascota.raza && ` • ${reporte.mascota.raza}`}
              </Text>
            )}
            
            <Text style={styles.reporteDescripcion} numberOfLines={2}>
              {reporte.descripcion}
            </Text>
            
            {reporte.direccion_referencia && (
              <Text style={styles.ubicacion} numberOfLines={1}>
                {reporte.direccion_referencia}
              </Text>
            )}
            
            {reporte.recompensa && reporte.recompensa > 0 && (
              <Text style={styles.recompensa}>
                Recompensa: ${reporte.recompensa.toLocaleString('es-AR')}
              </Text>
            )}
          </View>
          
          <View style={styles.reporteAcciones}>
            <Text style={styles.fechaReporte}>
              {formatearFecha(reporte.creado_en)}
            </Text>
            
            <TouchableOpacity
              style={styles.contactarBtn}
              onPress={() => handleContactar(reporte)}
            >
              <Ionicons name="call" size={16} color="#fff" />
              <Text style={styles.contactarBtnText}>Contactar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>RadarPet</Text>
        <TouchableOpacity style={styles.profileButton}>
          <Ionicons name="person-circle" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Filtros */}
      <View style={styles.filtros}>
        <TouchableOpacity
          style={[
            styles.filtroBtn,
            filtroActivo === 'perdidas' && styles.filtroBtnActivo
          ]}
          onPress={() => setFiltroActivo('perdidas')}
        >
          <Text style={[
            styles.filtroBtnText,
            filtroActivo === 'perdidas' && styles.filtroBtnTextActivo
          ]}>
            Mascotas Perdidas
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filtroBtn,
            filtroActivo === 'encontradas' && styles.filtroBtnActivo
          ]}
          onPress={() => setFiltroActivo('encontradas')}
        >
          <Text style={[
            styles.filtroBtnText,
            filtroActivo === 'encontradas' && styles.filtroBtnTextActivo
          ]}>
            Mascotas Encontradas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Título de sección */}
      <Text style={styles.seccionTitulo}>
        Reportes de {filtroActivo === 'perdidas' ? 'Mascotas Perdidas' : 'Mascotas Encontradas'}
      </Text>

      {/* Buscador */}
      <View style={styles.buscadorContainer}>
        <Ionicons name="search" size={20} color={Colors.textTertiary} style={styles.buscadorIcon} />
        <TextInput
          style={styles.buscador}
          placeholder="Buscar... Mascota Perdida"
          placeholderTextColor={Colors.textTertiary}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Lista de reportes */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando reportes...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.reportesList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
            />
          }
        >
          {reportesFiltrados.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="sad-outline" size={64} color={Colors.gray400} />
              <Text style={styles.emptyText}>
                {searchText ? 'No se encontraron reportes' : 'No hay reportes disponibles'}
              </Text>
            </View>
          ) : (
            reportesFiltrados.map(renderReporte)
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerTitle: {
    ...Typography.styles.appTitle,
    fontSize: Typography.fontSize['2xl'],
  },
  profileButton: {
    padding: Spacing.xs,
  },
  filtros: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
    gap: Spacing.sm,
  },
  filtroBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.button * 3,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
  },
  filtroBtnActivo: {
    backgroundColor: Colors.primary,
  },
  filtroBtnText: {
    ...Typography.styles.bodySmall,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textLight,
  },
  filtroBtnTextActivo: {
    color: Colors.textLight,
  },
  seccionTitulo: {
    ...Typography.styles.h3,
    color: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    textAlign: 'center',
  },
  buscadorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.button * 3,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  buscadorIcon: {
    marginRight: Spacing.sm,
    color: Colors.textTertiary,
  },
  buscador: {
    flex: 1,
    paddingVertical: 12,
    ...Typography.styles.body,
    color: Colors.text,
  },
  reportesList: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  reporteCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    ...Shadows.card,
  },
  reporteHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  mascotaImagenContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
  },
  mascotaImagen: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  placeholderImagen: {
    backgroundColor: Colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reporteInfo: {
    flex: 1,
    gap: 4,
  },
  reporteTitulo: {
    ...Typography.styles.h4,
    fontFamily: Typography.fontFamily.semiBold,
  },
  mascotaInfo: {
    ...Typography.styles.bodySmall,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
  },
  reporteDescripcion: {
    ...Typography.styles.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  ubicacion: {
    ...Typography.styles.caption,
    color: Colors.textTertiary,
  },
  recompensa: {
    ...Typography.styles.caption,
    color: Colors.warning,
    fontFamily: Typography.fontFamily.semiBold,
  },
  reporteAcciones: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  fechaReporte: {
    ...Typography.styles.caption,
    color: Colors.textTertiary,
  },
  contactarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    gap: 4,
  },
  contactarBtnText: {
    ...Typography.styles.caption,
    color: Colors.textLight,
    fontFamily: Typography.fontFamily.semiBold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  loadingText: {
    ...Typography.styles.body,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
    gap: Spacing.md,
  },
  emptyText: {
    ...Typography.styles.body,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
});

export default ReportesMascotasPerdidas;