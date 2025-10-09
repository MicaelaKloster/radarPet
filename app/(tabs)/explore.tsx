// Importaciones de constantes de diseño (colores, espaciados, tipografía, etc.)
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/Theme';
// Hook personalizado para cargar fuentes
import { useAppFonts } from '@/hooks/useFonts';
// Cliente de Supabase para conexión con la base de datos
import { supabase } from '@/lib/supabase';
// Librería de iconos de Expo
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,  // Spinner de carga
  Alert,              // Alertas nativas
  Image,              // Componente para mostrar imágenes
  RefreshControl,     // Control de pull-to-refresh
  ScrollView,         // Vista desplazable
  StyleSheet,         // Estilos
  Text,               // Texto
  TextInput,          // Campo de texto
  TouchableOpacity,   // Botón táctil
  View,               // Contenedor
} from 'react-native';
// SafeAreaView para evitar que el contenido se superponga con notch/status bar
import { SafeAreaView } from 'react-native-safe-area-context';

// ============================================
// INTERFAZ: Define la estructura de un Reporte
// ============================================
interface Reporte {
  id: string;
  titulo: string;
  descripcion: string;
  creado_en: string;                        // Fecha de creación
  recompensa: number | null;                // Recompensa ofrecida (opcional)
  direccion_referencia: string | null;      // Ubicación (opcional)
  mascota: {                                // Datos de la mascota
    nombre: string;
    especie: {
      nombre: string;                       // Ej: "Perro", "Gato"
    };
    raza: string | null;
    color: string | null;
    foto_principal_url: string | null;
  } | null;
  reportero: {                              // Persona que hizo el reporte
    nombre: string;
    telefono: string | null;
  };
  fotos_reportes: {                         // Fotos adicionales del reporte
    ruta_storage: string;
  }[];
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
const ReportesMascotasPerdidas = () => {
  // ========== ESTADOS ==========
  const [reportes, setReportes] = useState<Reporte[]>([]);           // Lista de reportes
  const [loading, setLoading] = useState(true);                       // Estado de carga inicial
  const [refreshing, setRefreshing] = useState(false);                // Estado de refresh
  const [searchText, setSearchText] = useState('');                   // Texto de búsqueda
  const [filtroActivo, setFiltroActivo] = useState<'perdidas' | 'encontradas'>('perdidas'); // Filtro activo
  
  // Cargar fuentes personalizadas
  const fontsLoaded = useAppFonts();
  
  // Si las fuentes no están cargadas, mostrar spinner
  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // ========== EFECTO: Cargar reportes cuando cambia el filtro ==========
  useEffect(() => {
    cargarReportes();
  }, [filtroActivo]);

  // ========== FUNCIÓN: Cargar reportes desde Supabase ==========
  const cargarReportes = async () => {
    try {
      setLoading(true);
      
      // 1. Obtener el ID del tipo de reporte según el filtro activo
      const { data: tipoReporte } = await supabase
        .from('tipos_reportes')
        .select('id')
        .eq('nombre', filtroActivo === 'perdidas' ? 'perdida' : 'encontrada')
        .eq('estado', 'AC')  // Solo activos
        .maybeSingle();      // Devuelve un solo resultado o null

      // Si no se encuentra el tipo de reporte, no hay nada que mostrar
      if (!tipoReporte) {
        console.log('No se encontró el tipo de reporte');
        setReportes([]);
        return;
      }

      // 2. Obtener los reportes con todas sus relaciones (JOIN)
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
        .eq('tipo_id', tipoReporte.id)        // Filtrar por tipo (perdida/encontrada)
        .eq('estado', 'AC')                   // Solo reportes activos
        .order('creado_en', { ascending: false })  // Más recientes primero
        .limit(20);                           // Máximo 20 reportes

      // Manejo de errores
      if (error) {
        console.error('Error cargando reportes:', error);
        Alert.alert('Error', 'No se pudieron cargar los reportes');
        return;
      }

      // Actualizar estado con los reportes obtenidos
      setReportes(data || []);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Ocurrió un error inesperado');
    } finally {
      // Siempre ejecutar al final (éxito o error)
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ========== FUNCIÓN: Manejar el pull-to-refresh ==========
  const onRefresh = async () => {
    setRefreshing(true);
    await cargarReportes();
  };

  // ========== FUNCIÓN: Formatear fecha de forma amigable ==========
  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Mostrar formato relativo para fechas recientes
    if (diffDays === 0) {
      return 'Hoy';
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return `${diffDays} días`;
    } else {
      // Para fechas más antiguas, mostrar fecha completa
      return date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      });
    }
  };

  // ========== FUNCIÓN: Obtener URL pública de una imagen en Supabase Storage ==========
  const getStoragePublicUrl = (path?: string | null): string | null => {
    if (!path) return null;
    // Si ya es una URL completa (http/https), devolverla tal cual
    if (/^https?:\/\//i.test(path)) return path;
    
    // Generar URL pública desde Supabase Storage
    const { data } = supabase.storage.from('reportes-fotos').getPublicUrl(path);
    
    if (!data?.publicUrl) {
      console.log("❌ No se pudo generar URL pública para:", path);
      return null;
    }
    console.log("✅ URL pública generada:", data.publicUrl);
    return data?.publicUrl;
  };

  // ========== FUNCIÓN: Obtener imagen de la mascota con sistema de fallback ==========
  const obtenerImagenMascota = (reporte: Reporte): string | null => {
    // 1. PRIORIDAD 1: Foto principal de la mascota
    const principal = getStoragePublicUrl(reporte.mascota?.foto_principal_url || null);
    if (principal) {
      console.log("📸 Usando foto principal:", principal);
      return principal;
    }
    
    // 2. PRIORIDAD 2: Primera foto del reporte
    if (reporte.fotos_reportes && reporte.fotos_reportes.length > 0) {
      const fallback = getStoragePublicUrl(reporte.fotos_reportes[0].ruta_storage);
      console.log("📸 Usando foto de reporte:", fallback);
      return fallback;
    }
    
    // 3. No hay imagen disponible
    console.log("⚠️ Reporte sin imagen:", reporte.id);
    return null;
  };

  // ========== FUNCIÓN: Filtrar reportes según texto de búsqueda ==========
  const reportesFiltrados = reportes.filter(reporte => {
    // Si no hay texto de búsqueda, mostrar todos
    if (!searchText) return true;
    
    // Convertir todo a minúsculas para comparación case-insensitive
    const searchLower = searchText.toLowerCase();
    const nombreMascota = reporte.mascota?.nombre?.toLowerCase() || '';
    const titulo = reporte.titulo.toLowerCase();
    const descripcion = reporte.descripcion?.toLowerCase() || '';
    const raza = reporte.mascota?.raza?.toLowerCase() || '';
    
    // Buscar coincidencias en cualquiera de los campos
    return nombreMascota.includes(searchLower) ||
           titulo.includes(searchLower) ||
           descripcion.includes(searchLower) ||
           raza.includes(searchLower);
  });

  // ========== FUNCIÓN: Manejar botón de contactar ==========
  const handleContactar = (reporte: Reporte) => {
    const telefono = reporte.reportero.telefono;
    
    if (telefono) {
      // Mostrar confirmación antes de contactar
      Alert.alert(
        'Contactar',
        `¿Deseas contactar a ${reporte.reportero.nombre}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Llamar', 
            onPress: () => {
              // TODO: Aquí se podría integrar Linking para abrir el teléfono
              Alert.alert('Teléfono', telefono);
            }
          }
        ]
      );
    } else {
      Alert.alert('Sin contacto', 'No hay información de contacto disponible');
    }
  };

  // ========== FUNCIÓN: Renderizar una tarjeta de reporte ==========
  const renderReporte = (reporte: Reporte) => {
    const imagenUrl = obtenerImagenMascota(reporte);
    
    return (
      <View key={reporte.id} style={styles.reporteCard}>
        <View style={styles.reporteHeader}>
          {/* COLUMNA 1: Imagen de la mascota */}
          <View style={styles.mascotaImagenContainer}>
            {imagenUrl ? (
              <Image
                source={{ uri: imagenUrl }}
                style={styles.mascotaImagen}
                onError={() => console.log('Error cargando imagen')}
              />
            ) : (
              // Placeholder cuando no hay imagen
              <View style={[styles.mascotaImagen, styles.placeholderImagen]}>
                <Ionicons name="paw" size={24} color={Colors.textTertiary} />
              </View>
            )}
          </View>
          
          {/* COLUMNA 2: Información del reporte */}
          <View style={styles.reporteInfo}>
            {/* Título del reporte */}
            <Text style={styles.reporteTitulo}>
              {reporte.titulo}
            </Text>
            
            {/* Datos de la mascota */}
            {reporte.mascota && (
              <Text style={styles.mascotaInfo}>
                {reporte.mascota.nombre} • {reporte.mascota.especie.nombre}
                {reporte.mascota.raza && ` • ${reporte.mascota.raza}`}
              </Text>
            )}
            
            {/* Descripción (máximo 2 líneas) */}
            <Text style={styles.reporteDescripcion} numberOfLines={2}>
              {reporte.descripcion}
            </Text>
            
            {/* Ubicación de referencia */}
            {reporte.direccion_referencia && (
              <Text style={styles.ubicacion} numberOfLines={1}>
                {reporte.direccion_referencia}
              </Text>
            )}
            
            {/* Recompensa (si existe y es mayor a 0) */}
            {reporte.recompensa && reporte.recompensa > 0 && (
              <Text style={styles.recompensa}>
                Recompensa: ${reporte.recompensa.toLocaleString('es-AR')}
              </Text>
            )}
          </View>
          
          {/* COLUMNA 3: Acciones */}
          <View style={styles.reporteAcciones}>
            {/* Fecha formateada */}
            <Text style={styles.fechaReporte}>
              {formatearFecha(reporte.creado_en)}
            </Text>
            
            {/* Botón de contactar */}
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

  // ========== RENDER PRINCIPAL ==========
  return (
    <SafeAreaView style={styles.container}>
      {/* ===== HEADER: Logo y botón de perfil ===== */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>RadarPet</Text>
        <TouchableOpacity style={styles.profileButton}>
          <Ionicons name="person-circle" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* ===== FILTROS: Perdidas / Encontradas ===== */}
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

      {/* ===== TÍTULO DE SECCIÓN ===== */}
      <Text style={styles.seccionTitulo}>
        Reportes de {filtroActivo === 'perdidas' ? 'Mascotas Perdidas' : 'Mascotas Encontradas'}
      </Text>

      {/* ===== BUSCADOR ===== */}
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

      {/* ===== LISTA DE REPORTES ===== */}
      {loading ? (
        // Mostrar spinner mientras carga
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando reportes...</Text>
        </View>
      ) : (
        // Mostrar lista de reportes con pull-to-refresh
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
            // Estado vacío: no hay reportes
            <View style={styles.emptyContainer}>
              <Ionicons name="sad-outline" size={64} color={Colors.gray400} />
              <Text style={styles.emptyText}>
                {searchText ? 'No se encontraron reportes' : 'No hay reportes disponibles'}
              </Text>
            </View>
          ) : (
            // Renderizar cada reporte
            reportesFiltrados.map(renderReporte)
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

// ============================================
// ESTILOS
// ============================================
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