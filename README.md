## Pantallas de la Aplicación RadarPet 🐾

RadarPet es una aplicación móvil desarrollada con React Native y Expo que permite a los usuarios reportar mascotas perdidas y encontradas, facilitando su reencuentro a través de un sistema de mapas interactivo y reportes geolocalizados.

### Descripción de Pantallas Creadas

#### 🔐 Pantallas de Autenticación
- **Login (`/app/(auth)/login.tsx`)**: Pantalla de inicio de sesión con validación de email y contraseña, integración con Google OAuth y navegación a registro.
- **Registro (`/app/(auth)/register.tsx`)**: Pantalla de registro de nuevos usuarios con validación de formularios y creación de perfil.

#### 🏠 Pantalla Principal
- **Inicio (`/app/(tabs)/index.tsx`)**: Pantalla principal que muestra:
  - Mapa interactivo con reportes de mascotas
  - Acciones rápidas para reportar mascotas perdidas o encontradas
  - Navegación al mapa completo
  - Interfaz intuitiva con el branding de RadarPet

#### 🗺️ Pantallas de Mapas
- **Mapa Completo (`/app/mapa-completo.tsx`)**: Vista de mapa a pantalla completa con todos los reportes de mascotas perdidas y encontradas geolocalizados.

#### 📝 Pantallas de Reportes
- **Reportes de Mascotas Perdidas (`/app/reportes/reportes-perdidas.tsx`)**: Formulario completo para reportar mascotas perdidas que incluye:
  - Información detallada de la mascota (nombre, especie, raza, tamaño, sexo, color)
  - Subida de fotografías obligatoria
  - Selección de ubicación mediante mapa interactivo
  - Descripción de señas particulares
  - Fecha y hora de la pérdida
- **Reportes de Mascotas Encontradas (`/app/reportes/reporte-encontradas.tsx`)**: Formulario para reportar mascotas encontradas con funcionalidades similares.

#### 📞 Pantallas de Teléfonos Útiles
- **Teléfonos útiles (`/app/(tabs)/telefonos-utiles.tsx`)**: Pantalla que muestra servicios de emergencia y asistencia cercanos a la ubicación del usuario, facilitando el contacto inmediato en situaciones de urgencia relacionadas con mascotas, que incluye:
  - Geolocalización Automática
  - Visualización de Servicios Disponibles (Policía, Bomberos, Refugios y Veterinarias)
  - Sistema de Filtros para ver los servicios por categoría
  - Acciones Rápidas: Botón "Llamar": Inicia llamada telefónica directa, Botón "Cómo llegar": Abre navegación GPS (Google Maps/Apple Maps), Información de distancia y dirección visible
  - Tecnologías Utilizadas: API de OpenStreetMap (Overpass): Obtención de datos geoespaciales en tiempo real, Expo Location: Geolocalización del dispositivo y Linking API: Integración con teléfono y mapas nativos

#### 👤 Pantallas de Perfil
- **Perfil Principal (`/app/(tabs)/perfil.tsx`)**: Dashboard del usuario que muestra:
  - Información personal del usuario
  - Estadísticas de reportes (perdidas, encontradas, reuniones)
  - Gestión de mascotas registradas
  - Historial de actividad
  - Opciones de configuración
  - Opción para cerrar sesión

#### ⚙️ Pantallas de Configuración del Perfil
- **Encabezado del Perfil (`/app/perfil/encabezado.tsx`)**: Componente para mostrar y editar información básica del usuario.
- **Mis Mascotas (`/app/perfil/mis-mascotas.tsx`)**: Gestión de las mascotas registradas por el usuario.
- **Notificaciones (`/app/perfil/notificaciones.tsx`)**: Configuración de preferencias de notificaciones.
- **Ubicación (`/app/perfil/ubicacion.tsx`)**: Gestión de configuraciones de ubicación.
- **Privacidad (`/app/perfil/privacidad.tsx`)**: Configuraciones de privacidad y seguridad.
- **Soporte (`/app/perfil/soporte.tsx`)**: Información de ayuda y contacto.

#### 🔄 Pantallas de Navegación
- **Explorar (`/app/(tabs)/explore.tsx`)**: Pantalla de exploración adicional para funcionalidades extendidas.

### Características Técnicas Implementadas

- **Autenticación**: Sistema completo con Supabase Auth incluyendo OAuth con Google
- **Geolocalización**: Integración con mapas interactivos y GPS del dispositivo
- **Subida de Imágenes**: Sistema de carga y optimización de fotografías, como así también el uso de la cámara para sacar una foto
- **Base de Datos**: Gestión completa de datos con Supabase
- **Navegación**: Implementación de tabs y stack navigation con Expo Router
- **UI/UX**: Interfaz moderna y responsiva con componentes reutilizables
- **Validaciones**: Sistema robusto de validación de formularios
- **Estados de Carga**: Indicadores visuales para mejorar la experiencia del usuario
- **Notificaciones Locales**: Notificaciones luego de crear un reporte (perdidas/encontradas) y actualización de perfil
- **Llamadas a APIs**: Overpass API

### Capturas de Pantalla



La aplicación está diseñada para ser intuitiva y accesible, permitiendo a los usuarios reportar y buscar mascotas perdidas de manera eficiente mediante una interfaz moderna y funcional.
