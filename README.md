# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Pantallas de la Aplicación RadarPet

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
- **Reportes de Mascotas Perdidas (`/app/(tabs)/reportes-perdidas.tsx`)**: Formulario completo para reportar mascotas perdidas que incluye:
  - Información detallada de la mascota (nombre, especie, raza, tamaño, sexo, color)
  - Subida de fotografías obligatoria
  - Selección de ubicación mediante mapa interactivo
  - Descripción de señas particulares
  - Fecha y hora de la pérdida
- **Reportes de Mascotas Encontradas (`/app/(tabs)/reporte-encontradas.tsx`)**: Formulario para reportar mascotas encontradas con funcionalidades similares.

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
- **Subida de Imágenes**: Sistema de carga y optimización de fotografías
- **Base de Datos**: Gestión completa de datos con Supabase
- **Navegación**: Implementación de tabs y stack navigation con Expo Router
- **UI/UX**: Interfaz moderna y responsiva con componentes reutilizables
- **Validaciones**: Sistema robusto de validación de formularios
- **Estados de Carga**: Indicadores visuales para mejorar la experiencia del usuario

### Capturas de Pantalla



La aplicación está diseñada para ser intuitiva y accesible, permitiendo a los usuarios reportar y buscar mascotas perdidas de manera eficiente mediante una interfaz moderna y funcional.
