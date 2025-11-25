import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { supabase } from "@/lib/supabase";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Mascota = {
  id: string;
  nombre: string;
  fotoPrincipalUrl: string | null;
  especieId: number | null;
  raza: string | null;
  tamanioId: number | null;
  sexoId: number | null;
  color: string | null;
  seniasParticulares: string | null;
};

type Catalogo = { id: number; nombre: string };

type Props = {
  mascotas: Mascota[];
  setMascotas: React.Dispatch<React.SetStateAction<Mascota[]>>;
  userId: string;
  recargarMascotas: () => void;
};

export default function MisMascotas({
  mascotas,
  userId,
  recargarMascotas,
}: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalEditVisible, setModalEditVisible] = useState(false);
  const [mascotaEditando, setMascotaEditando] = useState<Mascota | null>(null);
  const [agregando, setAgregando] = useState(false);
  const [editando, setEditando] = useState(false);
  const [eliminando, setEliminando] = useState<string | null>(null);
  const [cargandoCatalogos, setCargandoCatalogos] = useState(true);

  // Catálogos
  const [catalogos, setCatalogos] = useState({
    especies: [] as Catalogo[],
    tamanios: [] as Catalogo[],
    sexos: [] as Catalogo[],
  });

  // Datos del formulario
  const [formData, setFormData] = useState({
    nombre: "",
    especieId: null as number | null,
    raza: "",
    tamanioId: null as number | null,
    sexoId: null as number | null,
    color: "",
    seniasParticulares: "",
  });

  const [foto, setFoto] = useState<string | null>(null);

  // Cargar catálogos al montar el componente
  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const [especies, tamanios, sexos] = await Promise.all([
          supabase
            .from("especies_mascotas")
            .select("id,nombre")
            .eq("estado", "AC")
            .order("nombre"),
          supabase
            .from("tamanios_mascotas")
            .select("id,nombre")
            .eq("estado", "AC")
            .order("id"),
          supabase
            .from("sexos_mascotas")
            .select("id,nombre")
            .eq("estado", "AC")
            .order("id"),
        ]);

        setCatalogos({
          especies: especies.data ?? [],
          tamanios: tamanios.data ?? [],
          sexos: sexos.data ?? [],
        });
      } catch (error) {
        console.error("Error cargando catálogos:", error);
      } finally {
        setCargandoCatalogos(false);
      }
    };

    cargarCatalogos();
  }, []);

  const resetForm = () => {
    setFormData({
      nombre: "",
      especieId: null,
      raza: "",
      tamanioId: null,
      sexoId: null,
      color: "",
      seniasParticulares: "",
    });
    setFoto(null);
  };

  const elegirFoto = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso necesario", "Necesitamos acceso a tu galería");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setFoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error seleccionando foto:", error);
      Alert.alert("Error", "No se pudo cargar la imagen");
    }
  };

  const agregarMascota = async () => {
    const nombreLimpio = formData.nombre.trim();

    if (!nombreLimpio) {
      Alert.alert("Error", "Debes ingresar un nombre para la mascota");
      return;
    }

    if (!formData.especieId) {
      Alert.alert("Error", "Debes seleccionar el tipo de mascota");
      return;
    }

    setAgregando(true);

    try {
      const { data, error } = await supabase
        .from("mascotas")
        .insert([
          {
            nombre: nombreLimpio,
            duenio_id: userId,
            especie_id: formData.especieId,
            raza: formData.raza.trim() || null,
            tamanio_id: formData.tamanioId,
            sexo_id: formData.sexoId,
            color: formData.color.trim() || null,
            senias_particulares: formData.seniasParticulares.trim() || null,
            foto_principal_url: foto || null,
          },
        ])
        .select();

      if (error) {
        console.error("Error agregando mascota:", error);
        Alert.alert("Error", "No se pudo agregar la mascota");
        return;
      }

      await recargarMascotas();
      resetForm();
      setModalVisible(false);
      Alert.alert("¡Éxito!", "Mascota agregada correctamente");
    } catch (err: any) {
      console.error("Error inesperado:", err);
      Alert.alert("Error", "Ocurrió un error inesperado");
    } finally {
      setAgregando(false);
    }
  };

  const abrirModalEditar = (mascota: Mascota) => {
    setMascotaEditando(mascota);
    setFormData({
      nombre: mascota.nombre,
      especieId: mascota.especieId,
      raza: mascota.raza || "",
      tamanioId: mascota.tamanioId,
      sexoId: mascota.sexoId,
      color: mascota.color || "",
      seniasParticulares: mascota.seniasParticulares || "",
    });
    setFoto(mascota.fotoPrincipalUrl);
    setModalEditVisible(true);
  };

  const editarMascota = async () => {
    if (!mascotaEditando) return;

    const nombreLimpio = formData.nombre.trim();

    if (!nombreLimpio) {
      Alert.alert("Error", "Debes ingresar un nombre para la mascota");
      return;
    }

    if (!formData.especieId) {
      Alert.alert("Error", "Debes seleccionar el tipo de mascota");
      return;
    }

    setEditando(true);

    try {
      const { error } = await supabase
        .from("mascotas")
        .update({
          nombre: nombreLimpio,
          especie_id: formData.especieId,
          raza: formData.raza.trim() || null,
          tamanio_id: formData.tamanioId,
          sexo_id: formData.sexoId,
          color: formData.color.trim() || null,
          senias_particulares: formData.seniasParticulares.trim() || null,
          foto_principal_url: foto || null,
        })
        .eq("id", mascotaEditando.id);

      if (error) {
        console.error("Error editando mascota:", error);
        Alert.alert("Error", "No se pudo editar la mascota");
        return;
      }

      await recargarMascotas();
      resetForm();
      setModalEditVisible(false);
      setMascotaEditando(null);
      Alert.alert("¡Éxito!", "Mascota actualizada correctamente");
    } catch (err: any) {
      console.error("Error inesperado:", err);
      Alert.alert("Error", "Ocurrió un error inesperado");
    } finally {
      setEditando(false);
    }
  };

  const eliminarMascota = async (mascota: Mascota) => {
    Alert.alert(
      "Eliminar mascota",
      `¿Estás seguro de eliminar a ${mascota.nombre}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            setEliminando(mascota.id);
            try {
              const { error } = await supabase
                .from("mascotas")
                .update({ estado: "BA" })
                .eq("id", mascota.id);

              if (error) {
                console.error("Error eliminando mascota:", error);
                Alert.alert("Error", "No se pudo eliminar la mascota");
                return;
              }

              await recargarMascotas();
              Alert.alert("¡Eliminada!", `${mascota.nombre} fue eliminada`);
            } catch (err: any) {
              console.error("Error inesperado:", err);
              Alert.alert("Error", "Ocurrió un error inesperado");
            } finally {
              setEliminando(null);
            }
          },
        },
      ]
    );
  };

  const renderFormulario = (esEdicion: boolean) => {
    if (cargandoCatalogos) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#4ECDC4" />
          <ThemedText style={{ marginTop: 10 }}>Cargando...</ThemedText>
        </View>
      );
    }

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Foto */}
        <TouchableOpacity
          style={styles.fotoContainer}
          onPress={elegirFoto}
          disabled={agregando || editando}
        >
          {foto ? (
            <Image source={{ uri: foto }} style={styles.fotoPreview} />
          ) : (
            <View style={styles.fotoPlaceholder}>
              <IconSymbol size={40} name="camera.fill" color="#999" />
              <ThemedText style={styles.fotoText}>Agregar foto</ThemedText>
            </View>
          )}
        </TouchableOpacity>

        {/* Nombre */}
        <ThemedText style={styles.label}>Nombre *</ThemedText>
        <TextInput
          placeholder="Ej: Luna"
          value={formData.nombre}
          onChangeText={(t) => setFormData((p) => ({ ...p, nombre: t }))}
          style={styles.input}
          maxLength={50}
        />

        {/* Tipo de mascota */}
        <ThemedText style={styles.label}>Tipo de mascota *</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {catalogos.especies.map((esp) => (
            <TouchableOpacity
              key={esp.id}
              style={[
                styles.chip,
                formData.especieId === esp.id && styles.chipSelected,
              ]}
              onPress={() => setFormData((p) => ({ ...p, especieId: esp.id }))}
            >
              <ThemedText
                style={[
                  styles.chipText,
                  formData.especieId === esp.id && styles.chipTextSelected,
                ]}
              >
                {esp.nombre}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Raza */}
        <ThemedText style={styles.label}>Raza (opcional)</ThemedText>
        <TextInput
          placeholder="Ej: Labrador"
          value={formData.raza}
          onChangeText={(t) => setFormData((p) => ({ ...p, raza: t }))}
          style={styles.input}
          maxLength={50}
        />

        {/* Tamaño */}
        <ThemedText style={styles.label}>Tamaño</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {catalogos.tamanios.map((tam) => (
            <TouchableOpacity
              key={tam.id}
              style={[
                styles.chip,
                formData.tamanioId === tam.id && styles.chipSelected,
              ]}
              onPress={() => setFormData((p) => ({ ...p, tamanioId: tam.id }))}
            >
              <ThemedText
                style={[
                  styles.chipText,
                  formData.tamanioId === tam.id && styles.chipTextSelected,
                ]}
              >
                {tam.nombre}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sexo */}
        <ThemedText style={styles.label}>Sexo</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {catalogos.sexos.map((sex) => (
            <TouchableOpacity
              key={sex.id}
              style={[
                styles.chip,
                formData.sexoId === sex.id && styles.chipSelected,
              ]}
              onPress={() => setFormData((p) => ({ ...p, sexoId: sex.id }))}
            >
              <ThemedText
                style={[
                  styles.chipText,
                  formData.sexoId === sex.id && styles.chipTextSelected,
                ]}
              >
                {sex.nombre}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Color */}
        <ThemedText style={styles.label}>Color principal</ThemedText>
        <TextInput
          placeholder="Ej: Marrón con blanco"
          value={formData.color}
          onChangeText={(t) => setFormData((p) => ({ ...p, color: t }))}
          style={styles.input}
          maxLength={100}
        />

        {/* Señas particulares */}
        <ThemedText style={styles.label}>Señas particulares</ThemedText>
        <TextInput
          placeholder="Collar, cicatrices, marcas..."
          value={formData.seniasParticulares}
          onChangeText={(t) =>
            setFormData((p) => ({ ...p, seniasParticulares: t }))
          }
          style={[styles.input, styles.textArea]}
          multiline
          numberOfLines={3}
          maxLength={500}
        />

        <TouchableOpacity
          style={[
            styles.botonAgregar,
            (agregando || editando) && { opacity: 0.5 },
          ]}
          onPress={esEdicion ? editarMascota : agregarMascota}
          disabled={agregando || editando}
        >
          <ThemedText style={styles.textoBotonAgregar}>
            {agregando || editando
              ? "Guardando..."
              : esEdicion
              ? "Guardar Cambios"
              : "Agregar Mascota"}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            if (esEdicion) {
              setModalEditVisible(false);
              setMascotaEditando(null);
            } else {
              setModalVisible(false);
            }
            resetForm();
          }}
          disabled={agregando || editando}
        >
          <ThemedText style={styles.textoCancelar}>Cancelar</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  return (
    <View style={styles.seccion}>
      <ThemedText type="subtitle" style={styles.tituloSeccion}>
        Mis Mascotas Registradas
      </ThemedText>

      {mascotas.length === 0 ? (
        <View style={styles.estadoVacio}>
          <IconSymbol size={50} name="pawprint.fill" color="#999" />
          <ThemedText style={styles.textoVacio}>
            No tienes mascotas registradas
          </ThemedText>
          <ThemedText style={styles.subtextoVacio}>
            Registra tus mascotas con todos sus datos para reportar más rápido
          </ThemedText>
        </View>
      ) : (
        <View>
          {mascotas.map((m) => (
            <View key={m.id} style={styles.itemMascota}>
              <View style={styles.infoMascota}>
                {m.fotoPrincipalUrl ? (
                  <Image
                    source={{ uri: m.fotoPrincipalUrl }}
                    style={styles.imagenMascota}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.placeholderMascota}>
                    <IconSymbol size={30} name="pawprint.fill" color="#999" />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.nombreMascota}>
                    {m.nombre}
                  </ThemedText>
                  {m.raza && (
                    <ThemedText style={styles.detallesMascota}>
                      {m.raza}
                    </ThemedText>
                  )}
                </View>
              </View>

              <View style={styles.accionesMascota}>
                <TouchableOpacity
                  style={styles.botonAccion}
                  onPress={() => abrirModalEditar(m)}
                  disabled={eliminando === m.id}
                >
                  <Image
                    source={require("../../assets/editar.png")}
                    style={styles.accionIcono}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.botonAccion, { marginLeft: 8 }]}
                  onPress={() => eliminarMascota(m)}
                  disabled={eliminando === m.id}
                >
                  <Image
                    source={require("../../assets/eliminar.png")}
                    style={[styles.accionIcono, { tintColor: "#FF6B6B" }]}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={styles.botonAgregar}
        onPress={() => {
          resetForm();
          setModalVisible(true);
        }}
      >
        <ThemedText style={styles.textoBotonAgregar}>
          + Agregar Mascota
        </ThemedText>
      </TouchableOpacity>

      {/* Modal Agregar */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.overlayModal}>
          <View style={styles.contenidoModal}>
            <ThemedText type="subtitle">Nueva Mascota</ThemedText>
            {renderFormulario(false)}
          </View>
        </View>
      </Modal>

      {/* Modal Editar */}
      <Modal visible={modalEditVisible} transparent animationType="slide">
        <View style={styles.overlayModal}>
          <View style={styles.contenidoModal}>
            <ThemedText type="subtitle">Editar Mascota</ThemedText>
            {renderFormulario(true)}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  seccion: { marginTop: 25 },
  tituloSeccion: { marginBottom: 15, fontSize: 20, fontWeight: "bold" },
  estadoVacio: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
  },
  textoVacio: { fontSize: 16, fontWeight: "600", marginTop: 15 },
  subtextoVacio: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  itemMascota: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    backgroundColor: "#F8F9FA",
    padding: 10,
    borderRadius: 12,
  },
  infoMascota: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  imagenMascota: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  placeholderMascota: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: "#E9ECEF",
    justifyContent: "center",
    alignItems: "center",
  },
  nombreMascota: { fontSize: 16, fontWeight: "600" },
  detallesMascota: { fontSize: 12, opacity: 0.6, marginTop: 2 },
  accionesMascota: {
    flexDirection: "row",
    alignItems: "center",
  },
  botonAccion: {
    padding: 8,
  },
  accionIcono: {
    width: 22,
    height: 22,
    tintColor: "#333",
  },
  botonAgregar: {
    backgroundColor: "#2E86AB",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 10,
  },
  textoBotonAgregar: { color: "white", fontSize: 14, fontWeight: "600" },
  overlayModal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  contenidoModal: {
    width: "90%",
    maxHeight: "85%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
  },
  textoCancelar: {
    color: "#FF6B6B",
    marginTop: 10,
    textAlign: "center",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  fotoContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  fotoPreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  fotoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E9ECEF",
    borderStyle: "dashed",
  },
  fotoText: {
    fontSize: 12,
    marginTop: 5,
    opacity: 0.6,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E9ECEF",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#F8F9FA",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  chip: {
    backgroundColor: "#F8F9FA",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  chipSelected: {
    backgroundColor: "#2E86AB",
    borderColor: "#2E86AB",
  },
  chipText: {
    fontSize: 14,
    color: "#6C757D",
  },
  chipTextSelected: {
    color: "white",
    fontWeight: "600",
  },
});
