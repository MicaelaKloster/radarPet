import MiniMapaSelector, { Coord } from "@/components/MiniMapaSelector";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { supabase } from "@/lib/supabase";
import { decode as base64ToArrayBuffer } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import { Image } from 'expo-image'; // Mejor rendimiento para imágenes
import * as ImageManipulator from 'expo-image-manipulator'; // Para redimensionar imágenes
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";


// Helper para timeout de promesas (evita quedarse colgado sin feedback)
async function withTimeout<T = any>(promise: PromiseLike<T>, ms: number, label: string): Promise<T> {
  let timeoutId: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`Timeout (${label}) después de ${ms}ms`)), ms);
  });
  try {
    const result = await Promise.race([promise as any, timeoutPromise]);
    return result as T;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Parsear coordenadas desde texto "lat, lng"
function parseCoordenadas(texto: string): LatLng | null {
  if (!texto) return null;
  const s = texto.trim().replace(/\s+/g, '');
  const m = s.match(/^(-?\d{1,3}(?:\.\d+)?),(-?\d{1,3}(?:\.\d+)?)$/);
  if (!m) return null;
  const lat = parseFloat(m[1]);
  const lng = parseFloat(m[2]);
  if (isNaN(lat) || isNaN(lng)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { latitude: lat, longitude: lng };
}

const IMAGE_MEDIA_TYPES = 'images';

// 2. Helper para manejo de errores
const handleError = (error: any, context: string = '') => {
  console.error(`Error en ${context}:`, error);
  const errorMessage = error?.message || 'Ocurrió un error inesperado';
  if (Platform.OS === 'web') {
    (globalThis as any).alert?.(`Error al ${context}: ${errorMessage}`);
  } else {
    Alert.alert("Error", `Error al ${context}: ${errorMessage}`);
  }
  return error;
};

//3. Validación relajada: el picker ya limita a imágenes; aceptamos cualquier formato de imagen
const validarTipoImagen = (_uri: string): boolean => true;

// 4. Helper para validar y parsear fechas
function validarFecha(fechaString: string): string {
  const s = fechaString?.trim();
  if (!s) return new Date().toISOString();

  // Intentar parseo directo (ISO u otros reconocidos por Date)
  let parsed: Date | null = new Date(s);
  if (isNaN(parsed.getTime())) {
    parsed = null;
  }

  // Intentar formato DD/MM/YYYY [HH:MM]
  if (!parsed) {
    const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?$/);
    if (m) {
      const [, dd, mm, yyyy, hh = '0', min = '0'] = m;
      parsed = new Date(
        parseInt(yyyy, 10),
        parseInt(mm, 10) - 1,
        parseInt(dd, 10),
        parseInt(hh, 10),
        parseInt(min, 10)
      );
    }
  }

  if (!parsed || isNaN(parsed.getTime())) {
    throw new Error('Formato de fecha inválido. Usa YYYY-MM-DD HH:MM o DD/MM/YYYY');
  }

  if (parsed > new Date()) {
    throw new Error('No se permiten fechas futuras');
  }

  return parsed.toISOString();
}

// 5. Tipos
type Catalogo = { id: number; nombre: string };
type LatLng = { latitude: number; longitude: number };
type FormData = {
  nombre: string;
  especieId: number | null;
  raza: string;
  tamanioId: number | null;
  sexoId: number | null;
  color: string;
  seniasParticulares: string;
  ubicacion: string;
  ultimaUbicacion: string;
  fechaHoraPerdida: string;
  descripcionUbicacion: string;
  recompensa: string;
};

export default function ReportesPerdidasScreen() {
  // 6. Estado unificado de carga
  const [loading, setLoading] = useState({
    catalogos: true,
    ubicacion: false,
    publicando: false,
    subiendoFoto: false,
    imagen: false, // ver como funciona sino borrarlo
    obteniendoUbicacion: false,
  });

  // 7. Estado del formulario
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    especieId: null,
    raza: "",
    tamanioId: null,
    sexoId: null,
    color: "",
    seniasParticulares: "",
    ultimaUbicacion: "",
    fechaHoraPerdida: "",
    descripcionUbicacion: "",
    ubicacion:  "",
    recompensa: "",
  });
  // 8. Estados para catálogos
  const [catalogos, setCatalogos] = useState({
    especies: [] as Catalogo[],
    tamanios: [] as Catalogo[],
    sexos: [] as Catalogo[],
  });

  // 9. Ubicación e imagen
  const [ubicacionActual, setUbicacionActual] = useState<LatLng | null>(null);
  const [foto, setFoto] = useState<ImagePicker.ImagePickerAsset | null>(null);

  // Derivado: coordenadas del formulario como objeto para el mapa
  const coordsForMap: Coord | null = useMemo(() => {
    const p = parseCoordenadas(formData.ultimaUbicacion);
    return p ? { lat: p.latitude, lng: p.longitude } : null;
  }, [formData.ultimaUbicacion]);



  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const promesas = [
          supabase.from("especies_mascotas").select("id,nombre").eq("estado", "AC").order("nombre"),
          supabase.from("tamanios_mascotas").select("id,nombre").eq("estado", "AC").order("id"),
          supabase.from("sexos_mascotas").select("id,nombre").eq("estado", "AC").order("id"),
        ];

        const resultados = await Promise.allSettled(promesas);
        
        // Verificar si alguna falló
        const errores = resultados
          .filter(result => result.status === 'rejected')
          .map(result => result.reason);
        
        if (errores.length > 0) {
          throw new Error(`Error cargando catálogos: ${errores[0]?.message}`);
        }

        // Extraer datos exitosos
        const [especiesRes, tamaniosRes, sexosRes] = resultados.map(
          result => result.status === 'fulfilled' ? result.value : { data: [] }
        );

        setCatalogos({
          especies: especiesRes.data ?? [],
          tamanios: tamaniosRes.data ?? [],
          sexos: sexosRes.data ?? [],
        });
      } catch (error) {
        handleError(error, "cargar catálogos");
      } finally {
        setLoading(prev => ({ ...prev, catalogos: false }));
      }
    };

    cargarCatalogos();
  }, []);

   // 11. Función para obtener la ubicación (usar GPS)
const solicitarMiUbicacion = async () => {
  try {
    setLoading(prev => ({ ...prev, obteniendoUbicacion: true }));

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'No se puede obtener tu ubicación sin permisos.');
      return;
    }

    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
    setUbicacionActual(coords);

    // actualizar el campo de texto aunque no se muestre, para mantener la misma lógica downstream
    setFormData(prev => ({ ...prev, ultimaUbicacion: `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}` }));
  } catch (error) {
    handleError(error, 'obtener la ubicación actual');
  } finally {
    setLoading(prev => ({ ...prev, obteniendoUbicacion: false }));
  }
};

// 12. Función mejorada para manejar la selección de imágenes
const elegirFoto = async () => {
  try {
    console.log('[Reportes Perdidas] pedir permiso fotos...');
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permiso requerido", "Necesitamos acceso a tus fotos.");
      return;
    }

    console.log('[Reportes Perdidas] abrir galería...');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: IMAGE_MEDIA_TYPES as any,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (result.canceled || !result.assets?.[0]) {
      console.log('[Reportes Perdidas] selección cancelada');
      return;
    }

    const asset = result.assets[0];
    console.log('[Reportes Perdidas] asset seleccionado:', { uri: asset.uri, width: asset.width, height: asset.height, fileSize: (asset as any)?.fileSize, mimeType: (asset as any)?.mimeType });

    // Validación relajada
    if (!validarTipoImagen(asset.uri)) {
      console.warn('[Reportes Perdidas] validación de imagen falló, pero se permite por configuración');
    }

    // Redimensionar imagen para optimización
    console.log('[Reportes Perdidas] procesar imagen...');
    const manipResult = await ImageManipulator.manipulateAsync(
      asset.uri,
      [{ resize: { width: 1200 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );

    setFoto({
      ...asset,
      uri: manipResult.uri,
      width: manipResult.width,
      height: manipResult.height,
    });
    console.log('[Reportes Perdidas] foto seleccionada:', { uri: manipResult.uri, w: manipResult.width, h: manipResult.height });
  } catch (error) {
    handleError(error, "seleccionar la imagen");
  }
};

// 13. Función corregida para subir la foto
const subirFotoSiExiste = async (reporteId: string): Promise<boolean> => {
  if (!foto) return true; // No hay foto para subir, pero no es un error

  try {
    setLoading(prev => ({ ...prev, subiendoFoto: true }));

    const BUCKET = 'reportes-fotos';
    const extRaw = (foto.uri.split('.').pop() || '').toLowerCase();
    const ext = (extRaw || 'jpg').replace('jpeg', 'jpg');
    const path = `reportes/${reporteId}/${Date.now()}.${ext}`;
    console.log('[Reportes Perdidas] preparar subida:', { reporteId, extRaw, ext, path, plataforma: Platform.OS });

    if (Platform.OS === 'web') {
      // En web leer como Blob y subir directamente
      console.log('[Reportes Perdidas] leyendo blob desde uri...');
      const resp = await fetch(foto.uri);
      if (!resp.ok) throw new Error('No se pudo leer la imagen');
      const blob = await resp.blob();
      const contentType = blob.type || `image/${ext === 'jpg' ? 'jpeg' : ext}`;
      console.log('[Reportes Perdidas] subiendo a storage (web)...', { contentType, size: blob.size });
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, blob, { contentType, upsert: true });
      if (uploadError) throw uploadError;
    } else {
      console.log('[Reportes Perdidas] leyendo base64 (nativo)...');
      const base64 = await FileSystem.readAsStringAsync(foto.uri, { encoding: FileSystem.EncodingType.Base64 });
      const arrayBuffer = base64ToArrayBuffer(base64);
      console.log('[Reportes Perdidas] subiendo a storage (nativo)...');
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, arrayBuffer, { contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`, upsert: true });
      if (uploadError) throw uploadError;
    }

    // Registrar en DB y loguear URL pública
    console.log('[Reportes Perdidas] insert en fotos_reportes...');
    const { error: dbError } = await supabase.from('fotos_reportes').insert({
      reporte_id: reporteId,
      ruta_storage: path,
      ancho: foto.width,
      alto: foto.height,
      estado: 'AC',
    });
    if (dbError) throw dbError;

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
    console.log('[Reportes Perdidas] Foto subida en:', path, 'URL:', pub?.publicUrl);
    return true;
  } catch (error) {
    handleError(error, 'subir la foto');
    return false;
  } finally {
    setLoading(prev => ({ ...prev, subiendoFoto: false }));
  }
};

// 14. Validación de formulario (incluye foto obligatoria)
const validar = (): string[] => {
  const errores: string[] = [];
  if (!formData.especieId) errores.push('Seleccioná el tipo de mascota.');
  if (!foto) errores.push('Agregá una foto de la mascota.');
  return errores;
};

// 15. Publicar reporte de PERDIDAS
const publicar = async () => {
  console.log('[Reportes Perdidas] publicar() start', { formData, tieneFoto: !!foto });
  const errores = validar();
  if (errores.length) {
    console.log('[Reportes Perdidas] validar() errores:', errores);
    if (Platform.OS === 'web') (globalThis as any).alert?.(errores.join('\n')); else Alert.alert('Revisá estos campos', errores.join('\n'));
    return;
  }

  try {
    setLoading(prev => ({ ...prev, publicando: true }));

    console.log('[Reportes Perdidas] auth.getSession');
    const { data: { session }, error: sessionError } = await withTimeout((supabase.auth.getSession() as any), 7000, 'auth.getSession');
    if (sessionError) console.warn('[Reportes Perdidas] getSession error:', sessionError);
    let user = session?.user || null;
    if (!user) {
      console.log('[Reportes Perdidas] auth.getUser fallback');
      const res: any = await withTimeout((supabase.auth.getUser() as any), 30000, 'auth.getUser');
      user = res?.data?.user ?? null;
    }
    if (!user) throw new Error('No estás autenticado. Iniciá sesión e intentá nuevamente.');
    console.log('[Reportes Perdidas] user:', user.id);

    console.log('[Reportes Perdidas] insertar mascota');
    const mascotaData = {
      duenio_id: user.id,
      nombre: formData.nombre.trim() || 'Desconocido',
      especie_id: formData.especieId,
      raza: formData.raza.trim() || null,
      tamanio_id: formData.tamanioId,
      sexo_id: formData.sexoId,
      color: formData.color.trim() || null,
      senias_particulares: formData.seniasParticulares.trim() || null,
      estado: 'AC',
    };
    const { data: nuevaMascota, error: mascotaError } = await withTimeout(
      (supabase.from('mascotas').insert(mascotaData).select('id').single() as any),
      20000,
      'insert mascotas'
    );
    if (mascotaError || !nuevaMascota?.id) throw new Error(mascotaError?.message || 'No se pudo registrar la mascota');
    console.log('[Reportes Perdidas] mascota creada:', nuevaMascota.id);

    console.log('[Reportes Perdidas] catálogos');
    const [tipoRes, estadoRes] = await Promise.all([
      withTimeout((supabase.from('tipos_reportes').select('id').eq('nombre', 'perdida').eq('estado', 'AC').maybeSingle() as any), 15000, 'tipos_reportes'),
      withTimeout((supabase.from('estados_reportes').select('id').eq('nombre', 'abierto').eq('estado', 'AC').maybeSingle() as any), 15000, 'estados_reportes'),
    ]);
    if (!tipoRes?.data?.id || !estadoRes?.data?.id) throw new Error('Faltan catálogos requeridos');

    console.log('[Reportes Perdidas] ubicación');
    // Prioridad: texto -> ubicación actual -> error
    let coords: LatLng | null = null;
    const parsed = parseCoordenadas(formData.ultimaUbicacion);
    if (parsed) {
      coords = parsed;
      console.log('[Reportes Perdidas] usando coordenadas ingresadas:', coords);
    } else if (ubicacionActual) {
      coords = ubicacionActual;
      console.log('[Reportes Perdidas] usando ubicacionActual:', coords);
    } else {
      const { status } = await withTimeout(Location.requestForegroundPermissionsAsync(), 10000, 'permiso ubicación');
      if (status !== 'granted') throw new Error('Permiso de ubicación denegado');
      const pos = await withTimeout(Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }), 15000, 'getCurrentPositionAsync');
      coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      console.log('[Reportes Perdidas] usando ubicación del GPS:', coords);
    }
    if (!coords) throw new Error('No se pudo determinar la ubicación');
    const ubicacionWKT = `POINT(${coords.longitude} ${coords.latitude})`;

    console.log('[Reportes Perdidas] insertar reporte');
    const { data: nuevoReporte, error: reporteError } = await withTimeout(
      (supabase
         .from('reportes')
         .insert({
           tipo_id: tipoRes.data.id,
           estado_id: estadoRes.data.id,
           mascota_id: nuevaMascota.id,
           reportero_id: user.id,
           titulo: `${formData.nombre.trim() || 'Mascota'} - Perdida`,
           descripcion: formData.seniasParticulares.trim() || `Mascota perdida reportada por usuario`,
           visto_por_ultima_vez: formData.fechaHoraPerdida.trim() ? validarFecha(formData.fechaHoraPerdida) : new Date().toISOString(),
           ubicacion: ubicacionWKT,
           descripcion_ubicacion: formData.descripcionUbicacion.trim() || null,
           direccion_referencia: formData.ultimaUbicacion.trim(),
           estado: 'AC',
         })
        .select('id')
        .single() as any),
       20000,
       'insert reportes'
     );
    if (reporteError || !nuevoReporte?.id) throw new Error(reporteError?.message || 'No se pudo crear el reporte');
    console.log('[Reportes Perdidas] reporte creado:', nuevoReporte.id);

    console.log('[Reportes Perdidas] seguimiento');
    await withTimeout(
      (supabase.from('seguimientos').insert({ usuario_id: user.id, reporte_id: nuevoReporte.id, estado: 'AC' }) as any),
       10000,
       'insert seguimientos'
     );

    console.log('[Reportes Perdidas] estado foto antes de subir:', !!foto, foto?.uri);
    const ok = await withTimeout(subirFotoSiExiste(nuevoReporte.id), 30000, 'subir foto');
    console.log('[Reportes Perdidas] foto subida:', ok);



    if (Platform.OS === 'web') (globalThis as any).alert?.('¡Reporte publicado!'); else Alert.alert('¡Gracias!', 'Tu reporte de mascota perdida fue publicado.');

    // Reset
    setFormData({
      nombre: '', especieId: null, raza: '', tamanioId: null, sexoId: null, color: '', seniasParticulares: '', ultimaUbicacion: '', fechaHoraPerdida: '', descripcionUbicacion: '', ubicacion: '', recompensa: ''
    });
    setFoto(null);
    setUbicacionActual(null);
  } catch (e) {
    handleError(e, 'publicar el reporte');
  } finally {
    setLoading(prev => ({ ...prev, publicando: false }));
  }
};

const estaCargando = loading.catalogos || loading.publicando || loading.subiendoFoto || loading.obteniendoUbicacion;

if (loading.catalogos) {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ECDC4" />
        <ThemedText style={styles.loadingText}>Cargando formulario...</ThemedText>
      </View>
    </ThemedView>
  );
}

return (
  <ThemedView style={styles.container}>
    <ThemedView style={styles.header}>
      <IconSymbol size={40} name="exclamationmark.circle.fill" color="#4ECDC4" />
      <ThemedText type="title" style={styles.title}>Reportar Mascota Perdida</ThemedText>
    </ThemedView>

    <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={styles.formSection}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Descripción</ThemedText>

        <View style={styles.formField}>
          <ThemedText style={styles.fieldLabel}>Nombre</ThemedText>
          <TextInput
            style={styles.textInput}
            placeholder="Ej: Luna"
            value={formData.nombre}
            onChangeText={(t) => setFormData((p) => ({ ...p, nombre: t }))
            }
            editable={!loading.publicando}
            maxLength={50}
          />
        </View>

        <Selector
          titulo="Tipo de mascota"
          opciones={catalogos.especies}
          valorSeleccionado={formData.especieId}
          onSeleccionar={(especieId) => setFormData((p) => ({ ...p, especieId }))
          }
          obligatorio
        />

        <Selector
          titulo="Tamaño"
          opciones={catalogos.tamanios}
          valorSeleccionado={formData.tamanioId}
          onSeleccionar={(tamanioId) => setFormData((p) => ({ ...p, tamanioId }))
          }
        />

        <Selector
          titulo="Sexo"
          opciones={catalogos.sexos}
          valorSeleccionado={formData.sexoId}
          onSeleccionar={(sexoId) => setFormData((p) => ({ ...p, sexoId }))
          }
        />

        <View style={styles.formField}>
          <ThemedText style={styles.fieldLabel}>Color principal</ThemedText>
          <TextInput
            style={styles.textInput}
            placeholder="Ej: Marrón con blanco"
            value={formData.color}
            onChangeText={(t) => setFormData((p) => ({ ...p, color: t }))
            }
            editable={!loading.publicando}
            maxLength={100}
          />
        </View>

        <View style={styles.formField}>
          <ThemedText style={styles.fieldLabel}>Señas particulares</ThemedText>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            multiline
            numberOfLines={4}
            placeholder="Collar, placa, heridas, cicatrices..."
            value={formData.seniasParticulares}
            onChangeText={(t) => setFormData((p) => ({ ...p, seniasParticulares: t }))
            }
            editable={!loading.publicando}
            maxLength={500}
          />
        </View>
      </View>

      <View style={styles.formSection}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Ubicación y Fecha</ThemedText>

        <View style={styles.formField}>
          <ThemedText style={styles.fieldLabel}>Seleccioná la ubicación en el mapa</ThemedText>
          <MiniMapaSelector
            value={coordsForMap}
            onChange={(c) => setFormData(p => ({ ...p, ultimaUbicacion: `${c.lat.toFixed(5)}, ${c.lng.toFixed(5)}` }))}
            height={300}
            initialCenter={coordsForMap ?? (ubicacionActual ? { lat: ubicacionActual.latitude, lng: ubicacionActual.longitude } : undefined)}
          />
          <ThemedText style={styles.uploadingText}>Tocá el mapa para establecer latitud y longitud.</ThemedText>
          <TouchableOpacity style={styles.ubicacionButton} onPress={solicitarMiUbicacion} disabled={loading.publicando || loading.obteniendoUbicacion}>
            <ThemedText style={styles.ubicacionButtonText}>{loading.obteniendoUbicacion ? 'Obteniendo ubicación...' : 'Usar mi ubicación actual'}</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.formField}>
          <ThemedText style={styles.fieldLabel}>Descripción de la ubicación (opcional)</ThemedText>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            multiline
            numberOfLines={3}
            placeholder="Ej: Cerca del parque central, en la plaza..."
            value={formData.descripcionUbicacion}
            onChangeText={(t) => setFormData((p) => ({ ...p, descripcionUbicacion: t }))
            }
            editable={!loading.publicando}
            maxLength={300}
          />
        </View>

        <View style={styles.formField}>
          <ThemedText style={styles.fieldLabel}>Fecha/hora de la pérdida (opcional)</ThemedText>
          <TextInput
            style={styles.textInput}
            placeholder="Ej: 2025-08-08 15:00 o 08/08/2025"
            value={formData.fechaHoraPerdida}
            onChangeText={(t) => setFormData((p) => ({ ...p, fechaHoraPerdida: t }))
            }
            editable={!loading.publicando}
          />
        </View>
      </View>

      <View style={styles.formSection}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Fotografía (obligatoria)</ThemedText>
        {foto ? (
          <View style={styles.photoPreview}>
            <Image source={{ uri: foto.uri }} style={styles.photoImage} contentFit="cover" transition={200} />
            <View style={styles.photoButtonsRow}>
              <TouchableOpacity style={styles.secondaryButton} onPress={elegirFoto} disabled={loading.publicando}>
                <ThemedText style={styles.secondaryButtonText}>Cambiar foto</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.secondaryButton, styles.dangerOutline]} onPress={() => setFoto(null)} disabled={loading.publicando}>
                <ThemedText style={[styles.secondaryButtonText, styles.dangerOutlineText]}>Quitar foto</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.photoPlaceholder} onPress={elegirFoto} disabled={loading.publicando}>
            <IconSymbol size={50} name="camera.fill" color="#999" />
            <ThemedText style={styles.photoText}>Agregar foto de la mascota (obligatorio)</ThemedText>
            <ThemedText style={styles.photoSubtext}>Ayuda a identificar a la mascota</ThemedText>
          </TouchableOpacity>
        )}

        {loading.subiendoFoto && (
          <View style={styles.uploadingIndicator}>
            <ActivityIndicator size="small" color="#4ECDC4" />
            <ThemedText style={styles.uploadingText}>Subiendo foto...</ThemedText>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.submitButton, (estaCargando || !formData.especieId || !foto) && styles.submitButtonDisabled]}
          onPress={() => {
            console.log('[Reportes Perdidas] Botón Publicar presionado', { estaCargando, especieId: formData.especieId, tieneFoto: !!foto });
            publicar();
          }}
          disabled={estaCargando || !formData.especieId || !foto}
        >
          {loading.publicando ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <ThemedText style={styles.submitButtonText}>Publicar Perdida</ThemedText>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  </ThemedView>
);
}

function Selector({
  titulo,
  opciones,
  valorSeleccionado,
  onSeleccionar,
  placeholder = 'Seleccionar...',
  obligatorio = false,
}: {
  titulo: string;
  opciones: { id: number; nombre: string }[];
  valorSeleccionado: number | null;
  onSeleccionar: (id: number) => void;
  placeholder?: string;
  obligatorio?: boolean;
}) {
  if (opciones.length === 0) {
    return (
      <View style={styles.formField}>
        <ThemedText style={styles.fieldLabel}>{titulo} {obligatorio && '*'}</ThemedText>
        <View style={styles.selectorEmpty}>
          <ThemedText style={styles.selectorEmptyText}>{placeholder}</ThemedText>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.formField}>
      <ThemedText style={styles.fieldLabel}>{titulo} {obligatorio && '*'}</ThemedText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorContainer}>
        {opciones.map(op => (
          <TouchableOpacity key={op.id} style={[styles.selectorOption, valorSeleccionado === op.id && styles.selectorOptionSelected]} onPress={() => onSeleccionar(op.id)}>
            <ThemedText style={[styles.selectorOptionText, valorSeleccionado === op.id && styles.selectorOptionTextSelected]}>{op.nombre}</ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: Platform.OS === 'ios' ? 60 : 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, opacity: 0.7 },
  header: { alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#4ECDC4', marginTop: 10, textAlign: 'center' },
  content: { flex: 1, paddingHorizontal: 20 },
  formSection: { marginBottom: 25 },
  sectionTitle: { marginBottom: 15, color: '#333', fontWeight: '600' },
  formField: { marginBottom: 15 },
  fieldLabel: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  textInput: { backgroundColor: '#F8F9FA', borderRadius: 8, padding: 15, borderWidth: 1, borderColor: '#E9ECEF', fontSize: 16, color: '#000' },
  textInputError: { borderColor: '#4ECDC4', borderWidth: 2 },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  selectorContainer: { paddingVertical: 5 },
  selectorOption: { backgroundColor: '#F8F9FA', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, marginRight: 10, borderWidth: 1, borderColor: '#E9ECEF' },
  selectorOptionSelected: { backgroundColor: '#4ECDC4', borderColor: '#4ECDC4' },
  selectorOptionText: { fontSize: 14, color: '#6C757D' },
  selectorOptionTextSelected: { color: 'white', fontWeight: '600' },
  selectorEmpty: { backgroundColor: '#F8F9FA', borderRadius: 8, padding: 15, borderWidth: 1, borderColor: '#E9ECEF' },
  selectorEmptyText: { color: '#6C757D', fontSize: 14, fontStyle: 'italic' },
  photoPlaceholder: { backgroundColor: '#F8F9FA', borderRadius: 12, padding: 40, alignItems: 'center', borderWidth: 2, borderColor: '#E9ECEF', borderStyle: 'dashed' },
  photoPreview: { backgroundColor: '#F8F9FA', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#E9ECEF' },
  photoImage: { width: '100%', height: 200 },
  photoText: { fontSize: 16, fontWeight: '600', marginTop: 10 },
  photoSubtext: { fontSize: 12, opacity: 0.6, textAlign: 'center', marginTop: 5 },
  photoButtonsRow: { flexDirection: 'row', justifyContent: 'center', padding: 10, gap: 10 },
  uploadingIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  uploadingText: { marginLeft: 8, fontSize: 14, color: '#666' },
  secondaryButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E9ECEF', backgroundColor: '#fff', flex: 1, alignItems: 'center' },
  secondaryButtonText: { fontSize: 14, color: '#333', fontWeight: '500' },
  dangerOutline: { borderColor: '#4ECDC4' },
  dangerOutlineText: { color: '#4ECDC4', fontWeight: '600' },
  ubicacionButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFFFFD', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, borderWidth: 1, borderColor: '#4ECDC4', marginTop: 8 },
  ubicacionButtonText: { color: '#4ECDC4', fontSize: 12, marginLeft: 5, fontWeight: '500' },
  buttonContainer: { paddingVertical: 20, paddingBottom: 40 },
  submitButton: { backgroundColor: '#4ECDC4', borderRadius: 12, padding: 18, alignItems: 'center' },
  submitButtonDisabled: { backgroundColor: '#CCC', opacity: 0.6 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
