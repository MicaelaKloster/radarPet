import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { supabase } from "@/lib/supabase";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Modal,
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
};

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
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [mascotaEditando, setMascotaEditando] = useState<Mascota | null>(null);
  const [agregando, setAgregando] = useState(false);
  const [editando, setEditando] = useState(false);
  const [eliminando, setEliminando] = useState<string | null>(null);

  const agregarMascota = async () => {
    const nombreLimpio = nuevoNombre.trim();

    if (!nombreLimpio) {
      Alert.alert("Error", "Debes ingresar un nombre para la mascota");
      return;
    }

    if (nombreLimpio.length < 2 || nombreLimpio.length > 50) {
      Alert.alert("Error", "El nombre debe tener entre 2 y 50 caracteres");
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
            especie_id: 1,
          },
        ])
        .select();

      if (error) {
        console.error("Error agregando mascota:", error);
        Alert.alert(
          "Error",
          "No se pudo agregar la mascota. Intenta nuevamente."
        );
        return;
      }

      if (!data || data.length === 0) {
        Alert.alert("Error", "No se pudo crear la mascota");
        return;
      }

      await recargarMascotas();
      setNuevoNombre("");
      setModalVisible(false);
      Alert.alert("¡Éxito!", "Mascota agregada correctamente");
    } catch (err: any) {
      console.error("Error inesperado agregando mascota:", err);
      Alert.alert("Error", "Ocurrió un error inesperado");
    } finally {
      setAgregando(false);
    }
  };

  const abrirModalEditar = (mascota: Mascota) => {
    setMascotaEditando(mascota);
    setNuevoNombre(mascota.nombre);
    setModalEditVisible(true);
  };

  const editarMascota = async () => {
    if (!mascotaEditando) return;

    const nombreLimpio = nuevoNombre.trim();

    if (!nombreLimpio) {
      Alert.alert("Error", "Debes ingresar un nombre para la mascota");
      return;
    }

    if (nombreLimpio.length < 2 || nombreLimpio.length > 50) {
      Alert.alert("Error", "El nombre debe tener entre 2 y 50 caracteres");
      return;
    }

    setEditando(true);

    try {
      const { error } = await supabase
        .from("mascotas")
        .update({ nombre: nombreLimpio })
        .eq("id", mascotaEditando.id);

      if (error) {
        console.error("Error editando mascota:", error);
        Alert.alert(
          "Error",
          "No se pudo editar la mascota. Intenta nuevamente."
        );
        return;
      }

      await recargarMascotas();
      setNuevoNombre("");
      setModalEditVisible(false);
      setMascotaEditando(null);
      Alert.alert("¡Éxito!", "Mascota actualizada correctamente");
    } catch (err: any) {
      console.error("Error inesperado editando mascota:", err);
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
              const { data, error } = await supabase
                .from("mascotas")
                .update({ estado: "BA" })
                .eq("id", mascota.id)
                .select()
                .maybeSingle();

              console.log("RESULTADO UPDATE:", { data, error });

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
            Registra tus mascotas para crear reportes más rápido
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
                <ThemedText style={styles.nombreMascota}>{m.nombre}</ThemedText>
              </View>

              <View style={styles.accionesMascota}>
                <TouchableOpacity
                  accessibilityLabel={`Editar ${m.nombre}`}
                  accessibilityRole="button"
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
                  accessibilityLabel={`Eliminar ${m.nombre}`}
                  accessibilityRole="button"
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
        accessibilityLabel="Agregar mascota"
        accessibilityRole="button"
        style={styles.botonAgregar}
        onPress={() => setModalVisible(true)}
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
            <TextInput
              placeholder="Nombre de la mascota"
              value={nuevoNombre}
              onChangeText={setNuevoNombre}
              style={styles.input}
              maxLength={50}
              autoFocus
            />
            <TouchableOpacity
              style={[styles.botonAgregar, agregando && { opacity: 0.5 }]}
              onPress={agregarMascota}
              disabled={agregando}
            >
              <ThemedText style={styles.textoBotonAgregar}>
                {agregando ? "Agregando..." : "Agregar"}
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                setNuevoNombre("");
              }}
              disabled={agregando}
            >
              <ThemedText style={styles.textoCancelar}>Cancelar</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Editar */}
      <Modal visible={modalEditVisible} transparent animationType="slide">
        <View style={styles.overlayModal}>
          <View style={styles.contenidoModal}>
            <ThemedText type="subtitle">Editar Mascota</ThemedText>
            <TextInput
              placeholder="Nombre de la mascota"
              value={nuevoNombre}
              onChangeText={setNuevoNombre}
              style={styles.input}
              maxLength={50}
              autoFocus
            />
            <TouchableOpacity
              style={[styles.botonAgregar, editando && { opacity: 0.5 }]}
              onPress={editarMascota}
              disabled={editando}
            >
              <ThemedText style={styles.textoBotonAgregar}>
                {editando ? "Guardando..." : "Guardar"}
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setModalEditVisible(false);
                setNuevoNombre("");
                setMascotaEditando(null);
              }}
              disabled={editando}
            >
              <ThemedText style={styles.textoCancelar}>Cancelar</ThemedText>
            </TouchableOpacity>
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
  nombreMascota: { fontSize: 16, fontWeight: "600", flex: 1 },
  accionesMascota: {
    flexDirection: "row",
    alignItems: "center",
  },
  botonAccion: {
    padding: 8,
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
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    fontSize: 16,
  },
  textoCancelar: {
    color: "#FF6B6B",
    marginTop: 10,
    textAlign: "center",
  },
  accionIcono: {
    width: 22,
    height: 22,
    tintColor: "#333",
  },
});
