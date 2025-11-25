import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
} from 'react-native';
import * as Location from 'expo-location';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/contexts/ThemeContext';
import { Image } from 'expo-image';
import pin_bomberos from '@/Iconos/pin_bomberos.png';
import pin_policia from '@/Iconos/pin_policia.png';
import pin_refugios from '@/Iconos/pin_refugio.png';
import pin_veterinarias from '@/Iconos/pin_veterinaria.png';

export type ServiceContact = {
  id: string;
  tipo: 'bomberos' | 'policia' | 'refugio' | 'veterinaria';
  nombre: string;
  direccion?: string;
  telefono?: string;
  distancia?: number; // en metros
  lat: number;
  lng: number;
};

// Función para obtener servicios desde Overpass API
async function fetchNearbyServices(
  lat: number,
  lng: number,
  radiusKm: number = 10
): Promise<ServiceContact[]> {
  const radius = radiusKm * 1000;
  
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="fire_station"](around:${radius},${lat},${lng});
      way["amenity"="fire_station"](around:${radius},${lat},${lng});
      node["amenity"="police"](around:${radius},${lat},${lng});
      way["amenity"="police"](around:${radius},${lat},${lng});
      node["amenity"="animal_shelter"](around:${radius},${lat},${lng});
      way["amenity"="animal_shelter"](around:${radius},${lat},${lng});
      node["amenity"="veterinary"](around:${radius},${lat},${lng});
      way["amenity"="veterinary"](around:${radius},${lat},${lng});
    );
    out body center;
  `;

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
    });

    if (!response.ok) throw new Error('Error en Overpass API');

    const data = await response.json();
    const services: ServiceContact[] = [];

    data.elements?.forEach((element: any) => {
      // Para ways, usar el centro
      const elementLat = element.lat || element.center?.lat;
      const elementLon = element.lon || element.center?.lon;
      
      if (!elementLat || !elementLon) return;

      let tipo: ServiceContact['tipo'] | null = null;
      
      switch (element.tags?.amenity) {
        case 'fire_station':
          tipo = 'bomberos';
          break;
        case 'police':
          tipo = 'policia';
          break;
        case 'animal_shelter':
          tipo = 'refugio';
          break;
        case 'veterinary':
          tipo = 'veterinaria';
          break;
      }

      if (tipo) {
        // Calcular distancia
        const distancia = calculateDistance(lat, lng, elementLat, elementLon);

        services.push({
          id: `service-${element.id}`,
          tipo,
          nombre: element.tags?.name || getTipoLabel(tipo),
          direccion: buildAddress(element.tags),
          telefono: element.tags?.phone || element.tags?.['contact:phone'],
          distancia,
          lat: elementLat,
          lng: elementLon,
        });
      }
    });

    // Ordenar por distancia
    return services.sort((a, b) => (a.distancia || 0) - (b.distancia || 0));
  } catch (error) {
    console.error('Error obteniendo servicios:', error);
    throw error;
  }
}

// Calcular distancia usando fórmula de Haversine
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Construir dirección desde tags
function buildAddress(tags: any): string {
  const parts = [];
  if (tags?.['addr:street']) parts.push(tags['addr:street']);
  if (tags?.['addr:housenumber']) parts.push(tags['addr:housenumber']);
  if (tags?.['addr:city']) parts.push(tags['addr:city']);
  return parts.join(', ') || undefined;
}

// Obtener etiqueta por tipo
function getTipoLabel(tipo: ServiceContact['tipo']): string {
  const labels = {
    bomberos: 'Bomberos',
    policia: 'Policía',
    refugio: 'Refugio de Animales',
    veterinaria: 'Veterinaria',
  };
  return labels[tipo];
}

// Obtener ícono por tipo
function getIconSource(tipo: ServiceContact['tipo']) {
  const icons = {
    bomberos: pin_bomberos,
    policia: pin_policia,
    refugio: pin_refugios,
    veterinaria: pin_veterinarias,
  };
  return icons[tipo];
}

// Obtener color por tipo
function getTypeColor(tipo: ServiceContact['tipo']): string {
  const colors = {
    bomberos: '#ffde59',
    policia: '#045279',
    refugio: '#ff751f',
    veterinaria: '#79cb43',
  };
  return colors[tipo];
}

// Formatear distancia
function formatDistance(meters?: number): string {
  if (!meters) return '';
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

export default function TelefonosUtiles() {
  const { isDark } = useTheme();
  const [services, setServices] = useState<ServiceContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<ServiceContact['tipo'] | 'todos'>('todos');

  const loadServices = async () => {
    try {
      setLoading(true);
      
      // Solicitar permisos de ubicación
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permiso requerido',
          'Se necesita acceso a la ubicación para mostrar servicios cercanos.'
        );
        return;
      }

      // Obtener ubicación
      const location = await Location.getCurrentPositionAsync({});
      const coords = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };
      setUserLocation(coords);

      // Cargar servicios
      const data = await fetchNearbyServices(coords.lat, coords.lng, 10);
      setServices(data);
    } catch (error) {
      console.error('Error cargando servicios:', error);
      Alert.alert('Error', 'No se pudieron cargar los servicios cercanos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadServices();
    setRefreshing(false);
  };

  const handleCall = (service: ServiceContact) => {
    if (!service.telefono) {
      Alert.alert(
        'Teléfono no disponible',
        'Este establecimiento no tiene un número de teléfono registrado.'
      );
      return;
    }

    const phoneNumber = service.telefono.replace(/\s/g, '');
    const url = Platform.OS === 'ios' ? `telprompt:${phoneNumber}` : `tel:${phoneNumber}`;

    Alert.alert(
      'Llamar',
      `¿Deseas llamar a ${service.nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Llamar',
          onPress: () => {
            Linking.openURL(url).catch(() => {
              Alert.alert('Error', 'No se pudo realizar la llamada.');
            });
          },
        },
      ]
    );
  };

  const handleOpenMap = (service: ServiceContact) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${service.lat},${service.lng}`,
      android: `geo:0,0?q=${service.lat},${service.lng}(${encodeURIComponent(service.nombre)})`,
    });

    if (url) {
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'No se pudo abrir el mapa.');
      });
    }
  };

  const filteredServices = services.filter(
    (s) => selectedFilter === 'todos' || s.tipo === selectedFilter
  );

  const filters: Array<{ key: ServiceContact['tipo'] | 'todos'; label: string }> = [
    { key: 'todos', label: 'Todos' },
    { key: 'veterinaria', label: 'Veterinarias' },
    { key: 'refugio', label: 'Refugios' },
    { key: 'policia', label: 'Policía' },
    { key: 'bomberos', label: 'Bomberos' },
  ];

  const renderItem = ({ item }: { item: ServiceContact }) => (
    <View style={[styles.card, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
      <View style={styles.cardHeader}>
        <Image source={getIconSource(item.tipo)} style={styles.cardIcon} />
        <View style={styles.cardInfo}>
          <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#1F2937' }]}>
            {item.nombre}
          </Text>
          <Text style={[styles.cardType, { color: getTypeColor(item.tipo) }]}>
            {getTipoLabel(item.tipo)}
          </Text>
          {item.direccion && (
            <Text style={[styles.cardAddress, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              📍 {item.direccion}
            </Text>
          )}
          {item.distancia && (
            <Text style={[styles.cardDistance, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              📏 {formatDistance(item.distancia)}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.cardActions}>
        {item.telefono ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.callButton]}
            onPress={() => handleCall(item)}
          >
            <IconSymbol name="phone.fill" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Llamar</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.actionButton, styles.disabledButton]}>
            <IconSymbol name="phone.slash.fill" size={20} color="#9CA3AF" />
            <Text style={styles.disabledButtonText}>Sin teléfono</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.actionButton, styles.mapButton]}
          onPress={() => handleOpenMap(item)}
        >
          <IconSymbol name="map.fill" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Cómo llegar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2CBDAA" />
          <Text style={[styles.loadingText, { color: isDark ? '#FFFFFF' : '#6B7280' }]}>
            Buscando servicios cercanos...
          </Text>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Teléfonos Útiles</ThemedText>
        <ThemedText style={styles.subtitle}>
          Servicios cercanos a tu ubicación
        </ThemedText>
      </View>

      {/* Filtros */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filters}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedFilter === item.key && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(item.key)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedFilter === item.key && styles.filterButtonTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Lista de servicios */}
      <FlatList
        data={filteredServices}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2CBDAA']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconSymbol name="exclamationmark.triangle" size={64} color="#9CA3AF" />
            <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              No se encontraron servicios cercanos
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadServices}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#2CBDAA',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  cardIcon: {
    width: 48,
    height: 48,
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardType: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardAddress: {
    fontSize: 13,
    marginBottom: 2,
  },
  cardDistance: {
    fontSize: 13,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  callButton: {
    backgroundColor: '#10B981',
  },
  mapButton: {
    backgroundColor: '#3B82F6',
  },
  disabledButton: {
    backgroundColor: '#E5E7EB',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButtonText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#2CBDAA',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});