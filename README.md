# Dale Viaje — Supabase sin Node

Esta versión es completamente estática: no requiere `server.js`, SQLite, Express, `npm install` ni `node server.js`.

## Conectar Supabase

1. Crea o abre tu proyecto en Supabase.
2. En **SQL Editor**, ejecuta por completo el archivo `supabase/schema.sql`.
3. En **Project Settings > API**, copia la **Project URL** y la **Publishable key** (también puede llamarse `anon key`).
4. Abre `supabase-config.js` y reemplaza los dos textos de ejemplo.
5. En **Authentication > URL Configuration**, agrega la dirección donde publicarás la página, por ejemplo `https://tuusuario.github.io/dale-viaje/`.

La clave que se pega en `supabase-config.js` es pública y puede ir a GitHub. No uses ni publiques nunca la clave `service_role`.

## Publicar

Sube el contenido de esta carpeta a GitHub y publícalo con GitHub Pages, Netlify o Vercel como sitio estático. No subas ningún servidor: este proyecto ya no tiene backend Node.

## Funciones migradas

- Registro, inicio y cierre de sesión: Supabase Auth.
- Perfil y avatar: tabla `profiles` y bucket `avatars`.
- Publicar imágenes: tabla `gallery` y bucket `gallery`.
- Me gusta y guardados: tablas `gallery_likes` y `gallery_saves`.

El script SQL habilita RLS: cada persona puede modificar únicamente sus propios perfiles, imágenes, reacciones y guardados.
