# Configuración Supabase

1. Crear proyecto en Supabase.
2. Copiar la URL del proyecto y la anon public key.
3. Crear un archivo `.env` en la raíz con:
```
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
4. En tu panel SQL de Supabase correr el script de tablas provisto.
5. Activar Email auth (Settings > Auth > Providers).
6. (Opcional) Desactivar confirmación de email en Development si quieres login inmediato.

## Notas
- Nunca uses la cadena `postgresql://` en el cliente, sólo la URL http y la anon key.
- La tabla `perfiles` se llena al registrarse. Si quieres forzar que se cree sólo tras email confirmado, mueve la inserción a un edge function o trigger.
