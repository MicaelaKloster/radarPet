import React, { useEffect, useState } from "react";
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
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from 'expo-file-system';
import { Image } from 'expo-image'; // Mejor rendimiento para imágenes
import * as ImageManipulator from 'expo-image-manipulator'; // Para redimensionar imágenes
import { supabase } from "@/lib/supabase";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";

// 2. Helper para manejo de errores
const handleError = (error: any, context: string = '') => {
  console.error(`Error en ${context}:`, error);
  const errorMessage = error?.message || 'Ocurrió un error inesperado';
  Alert.alert("Error", `Error al ${context}: ${errorMessage}`);
  return error;
};

//3. Helper para validar tipos de archivo de imagen
const validarTipoImagen = (uri: string): boolean => {
  const extension = uri.split('.').pop()?.toLowerCase();
  const tiposPermitidos = ['jpg', 'jpeg', 'png', 'webp'];
  return tiposPermitidos.includes(extension || '');
};

// // 4. Helper para validar y parsear fechas
// const validarFecha = (fechaString: string): string | null => {
//   if (!fechaString.trim()) return null;
  
//   try {
//     // Intentar parsear diferentes formatos comunes
//     const fecha = new Date(fechaString);
//     if (isNaN(fecha.getTime())) {
//       throw new Error('Fecha inválida');
//     }
    
//     // No permitir fechas futuras
//     if (fecha > new Date()) {
//       throw new Error('No se permiten fechas futuras');
//     }
    
//     return fecha.toISOString();
//   } catch {
//     throw new Error('Formato de fecha inválido. Usa YYYY-MM-DD HH:MM o similar');
//   }
// };

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

export default function ReportLostScreen() {
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

  // 10. Cargar catálogos (optimizado con Promise.allSettled para mejor manejo de errores)
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

   // 11. Función para obtener la ubicación
const validarUbicacionIngresada = async () => {
  try {
    setLoading((prev) => ({ ...prev, obteniendoUbicacion: true }));

    if (!formData.ultimaUbicacion.trim()) {
      Alert.alert("Error", "Por favor, ingresa una dirección.");
      return;
    }

    const resultados = await Location.geocodeAsync(formData.ultimaUbicacion.trim());

    if (resultados.length === 0) {
      Alert.alert("Ubicación no válida. Por favor, verifica que sea correcta.");
      return;
    }

    const coords = resultados[0];
    setUbicacionActual({
      latitude: coords.latitude,
      longitude: coords.longitude,
    });

    Alert.alert("Ubicación válida", "La dirección ingresada es válida.");
  } catch (error) {
    handleError(error, "validar la ubicación");
  } finally {
    setLoading((prev) => ({ ...prev, obteniendoUbicacion: false }));
  }
};

  // const solicitarMiUbicacion = async () => {
  //   try {
  //     setLoading(prev => ({ ...prev, obteniendoUbicacion: true }));

  //     const { status } = await Location.requestForegroundPermissionsAsync();
  //     if (status !== "granted") {
  //       Alert.alert("Permiso denegado", "Podés escribir la dirección manualmente.");
  //       return;
  //     }

  //     const pos = await Location.getCurrentPositionAsync({
  //       accuracy: Location.Accuracy.Balanced,
  //       timeout: 15000, // Timeout de 15 segundos
  //       maximumAge: 10000, // Usar ubicación cached si tiene menos de 10s
  //     });
      
  //     const coords = {
  //       latitude: pos.coords.latitude,
  //       longitude: pos.coords.longitude,
  //     };
      
  //     setUbicacionActual(coords);

  //     // Obtener dirección legible
  //     try {
  //       const [rev] = await Location.reverseGeocodeAsync(coords);
  //       if (rev) {
  //         const dir = [
  //           rev.street,
  //           rev.streetNumber,
  //           rev.city
  //         ].filter(Boolean).join(", ");
          
  //         if (dir) {
  //           setFormData(prev => ({ ...prev, ultimaUbicacion: dir }));
  //         }
  //       }
  //     } catch (geocodeError) {
  //       console.warn("No se pudo obtener la dirección:", geocodeError);
  //     }
  //   } catch (error) {
  //     handleError(error, "obtener la ubicación");
  //   } finally {
  //     setLoading(prev => ({ ...prev, obteniendoUbicacion: false }));
  //   }
  // };
// 12. Función mejorada para manejar la selección de imágenes
const elegirFoto = async () => {
  try {
    // Pedir permisos
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permiso requerido", "Necesitamos acceso a tus fotos.");
      return;
    }

    // Seleccionar imagen
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];

    // Validar tipo de archivo
    if (!validarTipoImagen(asset.uri)) {
      Alert.alert("Archivo no válido", "Por favor selecciona una imagen válida (JPG, PNG, WebP)");
      return;
    }

    // Validar tamaño (límite: 10MB)
    // const fileInfo = await FileSystem.getInfoAsync(asset.uri);
    // const sizeInMB = (fileInfo.size || 0) / (1024 * 1024);
    //   if (sizeInMB > 10) {
    //   Alert.alert("Archivo muy grande", "La imagen debe ser menor a 10MB");
    //   return;
    // }

    // Redimensionar imagen para optimización
    const manipResult = await ImageManipulator.manipulateAsync(
      asset.uri,
      [{ resize: { width: 1200 } }], // Redimensionar a un ancho máximo de 1200px
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );

    setFoto({
      ...asset,
      uri: manipResult.uri,
      width: manipResult.width,
      height: manipResult.height,
    });
  } catch (error) {
    handleError(error, "seleccionar la imagen");
  }
};

 // 13. Función corregida para subir la foto
 const subirFotoSiExiste = async (reporteId: string): Promise<boolean> => {
  if (!foto) return true; // No hay foto para subir, pero no es un error

  try {
    setLoading(prev => ({ ...prev, subiendoFoto: true }));

    // Validar que el archivo existe
    const fileInfo = await FileSystem.getInfoAsync(foto.uri);
    if (!fileInfo.exists) {
      throw new Error("El archivo de imagen no existe");
    }

    const ext = foto.uri.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `reportes/${reporteId}/${Date.now()}.${ext}`;

    // fetch para obtener el arrayBuffer directamente
    const response = await fetch(foto.uri);
    const arrayBuffer = await response.arrayBuffer();

    // Subir a Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("reportes-fotos")
      .upload(path, arrayBuffer, {
        contentType: `image/${ext}`,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Guardar metadatos en la base de datos
    const { error: dbError } = await supabase.from("fotos_reportes").insert({
      reporte_id: reporteId,
      ruta_storage: path,
      ancho: foto.width,
      alto: foto.height,
      estado: "AC",
    });

    if (dbError) throw dbError;

    return true;
  } catch (error) {
    handleError(error, "subir la foto");
    return false;
  } finally {
    setLoading(prev => ({ ...prev, subiendoFoto: false }));
  }
};
// 14. Función para validar el formulario
const validar = (): string[] => {
  const errores: string[] = [];
  
  // Validaciones básicas
  if (!formData.nombre.trim()) {
    errores.push("El nombre de la mascota es obligatorio.");
  } else if (formData.nombre.trim().length < 2) {
    errores.push("El nombre debe tener al menos 2 caracteres.");
  }
  
  if (!formData.especieId) {
    errores.push("Debés seleccionar el tipo de mascota.");
  }
  
  if (!formData.ultimaUbicacion.trim()) {
    errores.push("Ingresá una dirección o punto de referencia.");
  }
  
  // Validación de recompensa
  if (formData.recompensa.trim()) {
    const n = Number(formData.recompensa);
    if (Number.isNaN(n) || n < 0) {
      errores.push("La recompensa debe ser un número ≥ 0.");
    } else if (n > 999999) {
      errores.push("La recompensa no puede ser mayor a $999,999.");
    }
  }
  
  // // Validación de fecha
  // if (formData.fechaHoraPerdida.trim()) {
  //   try {
  //     validarFecha(formData.fechaHoraPerdida);
  //   } catch (error: any) {
  //     errores.push(error.message);
  //   }
  // }
  
  return errores;
};

  // 15. Función para publicar el reporte
  const publicar = async () => {
    // Validar primero
    const errores = validar();
    if (errores.length) {
      Alert.alert("Revisá estos campos", errores.join("\n"));
      return;
    }

    // Confirmar antes de publicar
    const confirmar = await new Promise<boolean>((resolve) => {
      Alert.alert(
        "¿Publicar el reporte?",
        "Podés revisarlo una vez más o publicar ahora.",
        [
          { text: "Revisar", style: "cancel", onPress: () => resolve(false) },
          { text: "Publicar ahora", style: "default", onPress: () => resolve(true) },
        ]
      );
    });

    if (!confirmar) return;

    try {
      setLoading(prev => ({ ...prev, publicando: true }));

      // Verificar autenticación
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert("Autenticación", "Iniciá sesión para publicar.");
        return;
      }

      // 1. Crear la mascota
      const mascotaData = {
        duenio_id: user.id,
        nombre: formData.nombre.trim(),
        especie_id: formData.especieId,
        raza: formData.raza.trim() || null,
        tamanio_id: formData.tamanioId,
        sexo_id: formData.sexoId,
        color: formData.color.trim() || null,
        senias_particulares: formData.seniasParticulares.trim() || null,
        estado: "AC",
      };

      const { data: nuevaMascota, error: mascotaError } = await supabase
        .from("mascotas")
        .insert(mascotaData)
        .select("id")
        .single();

      if (mascotaError || !nuevaMascota?.id) {
        throw new Error(mascotaError?.message || "No se pudo registrar la mascota");
      }

      // 2. Obtener IDs necesarios para el reporte (optimizado)
      const [tipoRes, estadoRes] = await Promise.all([
        supabase
          .from("tipos_reportes")
          .select("id")
          .eq("nombre", "perdida")
          .eq("estado", "AC")
          .single(),
        supabase
          .from("estados_reportes")
          .select("id")
          .eq("nombre", "abierto")
          .eq("estado", "AC")
          .single(),
      ]);

      if (tipoRes.error || estadoRes.error || !tipoRes.data?.id || !estadoRes.data?.id) {
        throw new Error("Faltan catálogos: tipo 'perdida' y/o estado 'abierto'.");
      }

      // 3. Obtener coordenadas mejorado
      let coords = ubicacionActual;
      if (!coords && formData.ultimaUbicacion.trim()) {
        try {
          const geocoded = await Location.geocodeAsync(formData.ultimaUbicacion.trim());
          if (geocoded.length > 0) {
            coords = {
              latitude: geocoded[0].latitude,
              longitude: geocoded[0].longitude,
            };
          }
        } catch (geocodeError) {
          console.warn("Error en geocoding:", geocodeError);
        }
      }

      if (!coords) {
        throw new Error("No se pudo determinar la ubicación. Por favor, intentá con una dirección más específica o usá el botón 'Mi ubicación'.");
      }

      // 4. Validar coordenadas
      if (Math.abs(coords.latitude) > 90 || Math.abs(coords.longitude) > 180) {
        throw new Error("Coordenadas inválidas. Revisá la ubicación ingresada.");
      }

      // 5. Preparar datos del reporte
      const recompensaNum = formData.recompensa.trim() ? Number(formData.recompensa) : null;
      const fechaPerdida = formData.fechaHoraPerdida.trim() 
        ? validarFecha(formData.fechaHoraPerdida) 
        : new Date().toISOString();

       const ubicacionWKT = `POINT(${coords.longitude} ${coords.latitude})`; 

      const reporteData = {
        tipo_id: tipoRes.data.id,
        estado_id: estadoRes.data.id,
        mascota_id: nuevaMascota.id,
        reportero_id: user.id,
        titulo: `${formData.nombre.trim()} - Mascota Perdida`,
        descripcion: formData.seniasParticulares.trim() || `Mascota ${formData.nombre.trim()} reportada como perdida`,
        recompensa: recompensaNum,
        visto_por_ultima_vez: fechaPerdida,
        ubicacion: ubicacionWKT,  
        descripcion_ubicacion: formData.descripcionUbicacion.trim() || null,
        direccion_referencia: formData.ultimaUbicacion.trim(),
        estado: "AC",
      };

      // 6. Crear el reporte
      const { data: nuevoReporte, error: reporteError } = await supabase
        .from("reportes")
        .insert(reporteData)
        .select("id")
        .single();

      if (reporteError || !nuevoReporte?.id) {
        throw new Error(reporteError?.message || "No se pudo crear el reporte");
      }

      // 7. Crear seguimiento automático
      await supabase.from("seguimientos").insert({
        usuario_id: user.id,
        reporte_id: nuevoReporte.id,
        estado: "AC",
      });

      // 8. Subir foto si existe
      if (foto) {
        const fotoSubida = await subirFotoSiExiste(nuevoReporte.id);
        if (!fotoSubida) {
          console.warn("No se pudo subir la foto, pero el reporte se creó correctamente");
        }
      }

     // Éxito
     Alert.alert(
      "¡Reporte creado!", 
      "Hemos registrado tu reporte!",
      [{ text: "OK", onPress: () => {
        // Limpiar formulario
        setFormData({
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
          recompensa: "",
        });
        setFoto(null);
        setUbicacionActual(null);
      }}]
    );

  } catch (error) {
    handleError(error, "publicar el reporte");
  } finally {
    setLoading(prev => ({ ...prev, publicando: false }));
  }
};
 // 16. Estado de carga combinado
 const estaCargando = loading.catalogos || loading.publicando || loading.subiendoFoto || loading.obteniendoUbicacion;

 // 17. Mostrar carga si se están cargando los catálogos
 if (loading.catalogos) {
   return (
     <ThemedView style={styles.container}>
       <View style={styles.loadingContainer}>
         <ActivityIndicator size="large" color="#FF6B6B" />
         <ThemedText style={styles.loadingText}>Cargando formulario...</ThemedText>
       </View>
     </ThemedView>
   );
 }

 // 18. Renderizado del componente 
 return (
  <ThemedView style={styles.container}>
    <ThemedView style={styles.header}>
      <IconSymbol size={40} name="exclamationmark.triangle.fill" color="#FF6B6B" />
      <ThemedText type="title" style={styles.title}>
        Reportar Mascota Perdida
      </ThemedText>
      {/* <ThemedText style={styles.subtitle}>
        Compartí todos los detalles para ayudar a que tu mascota vuelva a casa
      </ThemedText> */}
    </ThemedView>

    <ScrollView
      style={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Sección: Mascota */}
      <View style={styles.formSection}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Información:
        </ThemedText>

        {/* Nombre */}
        <View style={styles.formField}>
          <ThemedText style={styles.fieldLabel}>Nombre *</ThemedText>
          <TextInput
            style={[
              styles.textInput, 
              !formData.nombre.trim() && styles.textInputError
            ]}
            placeholder="Ej: Luna, Max..."
            value={formData.nombre}
            onChangeText={(texto) => 
              setFormData(prev => ({ ...prev, nombre: texto }))
            }
            editable={!loading.publicando}
            maxLength={50} // Límite de caracteres
          />
        </View>

        {/* Selectores de catálogos */}
        <Selector
          titulo="Tipo de mascota"
          opciones={catalogos.especies}
          valorSeleccionado={formData.especieId}
          onSeleccionar={(especieId) => 
            setFormData(prev => ({ ...prev, especieId }))
          }
          obligatorio={true}
        />

        <Selector
          titulo="Tamaño"
          opciones={catalogos.tamanios}
          valorSeleccionado={formData.tamanioId}
          onSeleccionar={(tamanioId) => 
            setFormData(prev => ({ ...prev, tamanioId }))
          }
        />

        <Selector
          titulo="Sexo"
          opciones={catalogos.sexos}
          valorSeleccionado={formData.sexoId}
          onSeleccionar={(sexoId) => 
            setFormData(prev => ({ ...prev, sexoId }))
          }
        />

        {/* Resto de campos del formulario */}
        <View style={styles.formField}>
          <ThemedText style={styles.fieldLabel}>Raza</ThemedText>
          <TextInput
            style={styles.textInput}
            placeholder="Ej: Labrador / Siamés / Mestizo"
            value={formData.raza}
            onChangeText={(texto) => 
              setFormData(prev => ({ ...prev, raza: texto }))
            }
            editable={!loading.publicando}
            maxLength={100}
          />
        </View>

        <View style={styles.formField}>
          <ThemedText style={styles.fieldLabel}>Color principal</ThemedText>
          <TextInput
            style={styles.textInput}
            placeholder="Ej: Negro con blanco"
            value={formData.color}
            onChangeText={(t) => 
              setFormData(prev => ({ ...prev, color: t }))
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
            placeholder="Collar, cicatrices, marcas distintivas..."
            value={formData.seniasParticulares}
            onChangeText={(t) => 
              setFormData(prev => ({ ...prev, seniasParticulares: t }))
            }
            editable={!loading.publicando}
            maxLength={500}
          />
        </View>
      </View>

      {/* Sección: Ubicación y Fecha */}
      <View style={styles.formSection}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Ubicación y Fecha
        </ThemedText>

        {/* Ubicación */}
        <View style={styles.formField}>
          <View style={styles.ubicacionHeader}>
            <ThemedText style={styles.fieldLabel}>
              Ubicación donde se perdió:
            </ThemedText>
            {/* <TouchableOpacity
              style={styles.ubicacionButton}
              //onPress={solicitarMiUbicacion}
              onPress={validarUbicacionIngresada}
              disabled={loading.obteniendoUbicacion || loading.publicando}
            >
              {loading.obteniendoUbicacion ? (
                <ActivityIndicator size="small" color="#FF6B6B" />
              ) : (
                //<IconSymbol size={16} name="location.fill" color="#FF6B6B" />
                <IconSymbol size={16} name="checkmark.circle.fill" color="#FF6B6B" />
              )}
              <ThemedText style={styles.ubicacionButtonText}>
                {loading.obteniendoUbicacion ? "Validando..." : "Mi ubicación"}
              </ThemedText>
            </TouchableOpacity> */}
          </View>
          <TextInput
            style={[
              styles.textInput, 
              !formData.ultimaUbicacion.trim() && styles.textInputError
            ]}
            placeholder="Ej: Bv. San Juan 500, Córdoba"
            value={formData.ultimaUbicacion}
            onChangeText={(t) => 
              setFormData(prev => ({ ...prev, ultimaUbicacion: t }))
            }
            editable={!loading.publicando}
            maxLength={200}
          />
          <TouchableOpacity
            style={styles.ubicacionButton}
            onPress={validarUbicacionIngresada}
            disabled={loading.obteniendoUbicacion || loading.publicando}
          >
              {loading.obteniendoUbicacion ? (
              <ActivityIndicator size="small" color="#FF6B6B" />
            ) : (
              <ThemedText style={styles.ubicacionButtonText}>Validar ubicación</ThemedText>
            )}
          </TouchableOpacity>
        </View>

        {/* Descripción de la ubicación */}
        <View style={styles.formField}>
          <ThemedText style={styles.fieldLabel}>
            Descripción de la ubicación (opcional)
          </ThemedText>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            multiline
            numberOfLines={3}
            placeholder="Ej: Frente al supermercado, cerca del parque central..."
            value={formData.descripcionUbicacion}
            onChangeText={(t) => 
              setFormData(prev => ({ ...prev, descripcionUbicacion: t }))
            }
            editable={!loading.publicando}
            maxLength={300}
          />
        </View>

        {/* Fecha/hora de pérdida */}
        <View style={styles.formField}>
          <ThemedText style={styles.fieldLabel}>
            Fecha/hora aproximada (opcional)
          </ThemedText>
          <TextInput
            style={styles.textInput}
            placeholder="Ej: 2024-12-15 16:00 o 15/12/2024"
            value={formData.fechaHoraPerdida}
            onChangeText={(t) => 
              setFormData(prev => ({ ...prev, fechaHoraPerdida: t }))
            }
            editable={!loading.publicando}
          />
          <ThemedText style={styles.helpText}>
            Formatos: YYYY-MM-DD HH:MM, DD/MM/YYYY, etc.
          </ThemedText>
        </View>

        {/* Campo de recompensa mejorado */}
        <View style={styles.formField}>
          <ThemedText style={styles.fieldLabel}>
            Recompensa (opcional)
          </ThemedText>
          <TextInput
            style={styles.textInput}
            placeholder="Ej: 5000"
            value={formData.recompensa}
            onChangeText={(t) => 
              setFormData(prev => ({ ...prev, recompensa: t.replace(/[^0-9]/g, '') }))
            }
            editable={!loading.publicando}
            keyboardType="numeric"
            maxLength={7}
          />
          <ThemedText style={styles.helpText}>
            Monto en pesos argentinos (máximo $999,999)
          </ThemedText>
        </View>
      </View>

      {/* Sección: Fotografía */}
      <View style={styles.formSection}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Fotografía
        </ThemedText>

        {foto ? (
          <View style={styles.photoPreview}>
            <Image
              source={{ uri: foto.uri }}
              style={styles.photoImage}
              contentFit="cover"
              transition={200}
            />
            <View style={styles.photoButtonsRow}>
              <TouchableOpacity 
                style={styles.secondaryButton} 
                onPress={elegirFoto}
                disabled={loading.publicando}
              >
                <ThemedText style={styles.secondaryButtonText}>
                  Cambiar foto
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.secondaryButton, styles.dangerOutline]}
                onPress={() => setFoto(null)}
                disabled={loading.publicando}
              >
                <ThemedText 
                  style={[styles.secondaryButtonText, styles.dangerOutlineText]}
                >
                  Quitar foto
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.photoPlaceholder} 
            onPress={elegirFoto}
            disabled={loading.publicando}
          >
            <IconSymbol size={50} name="camera.fill" color="#999" />
            <ThemedText style={styles.photoText}>
              Agregar foto de la mascota
            </ThemedText>
            <ThemedText style={styles.photoSubtext}>
              Una foto reciente ayuda muchísimo (máx. 10MB)
            </ThemedText>
          </TouchableOpacity>
        )}

        {loading.subiendoFoto && (
          <View style={styles.uploadingIndicator}>
            <ActivityIndicator size="small" color="#FF6B6B" />
            <ThemedText style={styles.uploadingText}>
              Subiendo foto...
            </ThemedText>
          </View>
        )}
      </View>

      {/* Botón de enviar */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.submitButton, 
            (estaCargando || !formData.nombre.trim() || !formData.especieId || !formData.ultimaUbicacion.trim()) && 
              styles.submitButtonDisabled
          ]}
          onPress={publicar}
          disabled={estaCargando || !formData.nombre.trim() || !formData.especieId || !formData.ultimaUbicacion.trim()}
        >
          {loading.publicando ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <ThemedText style={styles.submitButtonText}>
              Publicar Reporte
            </ThemedText>
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
placeholder = "Seleccionar...",
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
      <ThemedText style={styles.fieldLabel}>
        {titulo} {obligatorio && "*"}
      </ThemedText>
      <View style={styles.selectorEmpty}>
        <ThemedText style={styles.selectorEmptyText}>
          {placeholder}
        </ThemedText>
      </View>
    </View>
  );
}

return (
  <View style={styles.formField}>
    <ThemedText style={styles.fieldLabel}>
      {titulo} {obligatorio && "*"}
    </ThemedText>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.selectorContainer}
    >
      {opciones.map((op) => (
        <TouchableOpacity
          key={op.id}
          style={[
            styles.selectorOption,
            valorSeleccionado === op.id && styles.selectorOptionSelected,
          ]}
          onPress={() => onSeleccionar(op.id)}
        >
          <ThemedText
            style={[
              styles.selectorOptionText,
              valorSeleccionado === op.id && styles.selectorOptionTextSelected,
            ]}
          >
            {op.nombre}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);
}

// Estilos actualizados con nuevos estilos para helpText
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingTop: Platform.OS === "ios" ? 60 : 40 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  loadingText: { 
    marginTop: 10, 
    fontSize: 16, 
    opacity: 0.7 
  },
  header: { 
    alignItems: "center", 
    paddingHorizontal: 20, 
    paddingBottom: 20 
  },
  title: { 
    fontSize: 24, 
    fontWeight: "bold", 
    color: "#FF6B6B", 
    marginTop: 10, 
    textAlign: "center" 
  },
  subtitle: { 
    fontSize: 14, 
    marginTop: 10, 
    opacity: 0.7, 
    textAlign: "center", 
    paddingHorizontal: 10 
  },
  content: { 
    flex: 1, 
    paddingHorizontal: 20 
  },
  formSection: { 
    marginBottom: 25 
  },
  sectionTitle: { 
    marginBottom: 15, 
    color: "#333", 
    fontWeight: "600" 
  },
  formField: { 
    marginBottom: 15 
  },
  fieldLabel: { 
    fontSize: 16, 
    fontWeight: "600", 
    marginBottom: 8 
  },
  textInput: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    fontSize: 16,
    color: "#000",
  },
  textInputError: { 
    borderColor: "#FF6B6B", 
    borderWidth: 2 
  },
  textArea: { 
    minHeight: 80, 
    textAlignVertical: "top" 
  },

  helpText: {
    fontSize: 12,
    color: "#6C757D",
    marginTop: 5,
    fontStyle: "italic",
  },
  ubicacionHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: 8 
  },
  ubicacionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5F5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#FF6B6B",
  },
  ubicacionButtonText: { 
    color: "#FF6B6B", 
    fontSize: 12, 
    marginLeft: 5, 
    fontWeight: "500" 
  },
  selectorContainer: { 
    paddingVertical: 5 
  },
  selectorOption: {
    backgroundColor: "#F8F9FA",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  selectorOptionSelected: { 
    backgroundColor: "#FF6B6B", 
    borderColor: "#FF6B6B" 
  },
  selectorOptionText: { 
    fontSize: 14, 
    color: "#6C757D" 
  },
  selectorOptionTextSelected: { 
    color: "white", 
    fontWeight: "600" 
  },
  selectorEmpty: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  selectorEmptyText: { 
    color: "#6C757D", 
    fontSize: 14, 
    fontStyle: "italic" 
  },
  photoPlaceholder: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 40,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E9ECEF",
    borderStyle: "dashed",
  },
  photoPreview: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  photoImage: {
    width: "100%",
    height: 200,
  },
  photoText: { 
    fontSize: 16, 
    fontWeight: "600", 
    marginTop: 10 
  },
  photoSubtext: { 
    fontSize: 12, 
    opacity: 0.6, 
    textAlign: "center", 
    marginTop: 5 
  },
  photoButtonsRow: { 
    flexDirection: "row", 
    justifyContent: "center", 
    padding: 10,
    gap: 10,
  },
  uploadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  uploadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  secondaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    backgroundColor: "#fff",
    flex: 1,
    alignItems: 'center',
  },
  secondaryButtonText: { 
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  dangerOutline: { 
    borderColor: "#FF6B6B" 
  },
  dangerOutlineText: { 
    color: "#FF6B6B", 
    fontWeight: "600" 
  },
  buttonContainer: { 
    paddingVertical: 20,
    paddingBottom: 40,
  },
  submitButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
  },
  submitButtonDisabled: { 
    backgroundColor: "#CCC", 
    opacity: 0.6 
  },
  submitButtonText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "bold" 
  },
});
