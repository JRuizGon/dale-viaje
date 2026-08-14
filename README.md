# Dale Viaje 🌍

Plataforma web para descubrir rutas turísticas y culturales de Nicaragua ("Rutas Pinoleras"): mapa interactivo, fichas de ciudad, galería de fotos de la comunidad, un catálogo de "Ciudades Creativas" y un asistente virtual (YAPTI).

> Proyecto realizado para **Hackathon 2026 — Ruta 505**.

---

## Índice

1. [Arquitectura](#arquitectura)
2. [Estructura del proyecto](#estructura-del-proyecto)
3. [Dependencias](#dependencias)
4. [Variables de entorno / configuración](#variables-de-entorno--configuración)
5. [Cómo correr el proyecto en local](#cómo-correr-el-proyecto-en-local)
6. [Base de datos](#base-de-datos)
7. ["Endpoints" (superficie de datos usada por el frontend)](#endpoints-superficie-de-datos-usada-por-el-frontend)
8. [Seguridad y buenas prácticas](#seguridad-y-buenas-prácticas)
9. [Control de versiones](#control-de-versiones)
10. [Despliegue a producción](#despliegue-a-producción)

---

## Arquitectura

Dale Viaje es un **sitio estático** (HTML + CSS + JavaScript "vanilla", sin framework ni build step) que habla directamente con **Supabase** (Backend-as-a-Service sobre PostgreSQL) desde el navegador. No hay servidor propio ni API intermedia.

```
┌─────────────────────┐        HTTPS / supabase-js       ┌──────────────────────┐
│   Navegador          │ ───────────────────────────────▶ │      Supabase         │
│  (index.html,        │                                   │  · Auth (usuarios)    │
│   ciudades.html,     │ ◀─────────────────────────────── │  · Postgres (RLS)     │
│   script.js,         │        JSON / Realtime            │  · Storage (fotos)    │
│   style.css)          │                                  └──────────────────────┘
└─────────────────────┘
```

- **index.html** es una *Single Page Application* casera: todas las pantallas viven como bloques `<div class="view" id="view-...">` dentro del mismo documento, y `navigateTo(ruta)` (en `script.js`) alterna cuál está visible. No usa un router real ni cambia la URL del navegador.
- **ciudades.html** es una página aparte con el detalle de cada una de las ciudades del circuito (se abre en una pestaña nueva desde "Ciudades Creativas").
- Toda la lógica de negocio (autenticación, formularios, YAPTI, plan de pago, galería) vive en **script.js**, organizada por secciones comentadas.
- **style.css** es una única hoja de estilos, organizada por secciones con comentarios (no hay preprocesador ni build).

## Estructura del proyecto

```
dale-viaje/
├── index.html              # SPA principal (todas las vistas)
├── ciudades.html            # Ficha detallada de cada ciudad
├── script.js                 # Toda la lógica de la aplicación
├── style.css                  # Todos los estilos
├── supabase-config.js        # URL + clave pública de Supabase (no lleva secretos)
├── supabase/
│   ├── schema.sql                          # Esquema base: profiles, gallery, likes, saves
│   ├── migracion_plan_de_pago.sql          # has_plan, yapti_tokens, locales_negocio
│   ├── migracion_2_historial_yapti.sql     # tabla yapti_historial
│   ├── migracion_3_conversaciones_yapti.sql# conversation_id en yapti_historial
│   └── migracion_4_sitios_creativos.sql    # catálogo curado de sitios turísticos
├── img/                        # Imágenes estáticas por ciudad
├── carrusel/                  # Imágenes del carrusel de inicio
├── uploads/                   # (legado) — ya no se usa, las fotos van a Supabase Storage
├── DIAGRAMAS.md              # ER (3FN) + diagramas UML (casos de uso, actividades, clases)
├── Documentacion-DaleViaje.docx # Explicación funcional del proyecto para no-técnicos
└── README.md                  # Este archivo
```

## Dependencias

No hay `npm install` ni proceso de build. Todo se carga por CDN directamente en el HTML:

| Librería | Uso |
|---|---|
| [`@supabase/supabase-js`](https://github.com/supabase/supabase-js) v2 | Cliente de autenticación, base de datos y storage |
| [`lucide`](https://lucide.dev/) | Set de íconos SVG |
| [`leaflet`](https://leafletjs.com/) | Mapa interactivo |

> `package.json` existe solo por compatibilidad con algunas plataformas de despliegue que lo esperan; no define ningún script de build real (ver sección de Despliegue).

## Variables de entorno / configuración

Este proyecto no usa un archivo `.env` (no hay servidor que lo lea). La configuración pública vive en **`supabase-config.js`**:

```js
window.SUPABASE_CONFIG = {
  url: 'https://TU-PROYECTO.supabase.co',
  publishableKey: 'sb_publishable_...'   // clave "anon" / publishable — es pública a propósito
};
```

- Esta clave es segura de subir a un repositorio público: por diseño, Supabase espera que la clave `anon`/`publishable` viaje en el navegador. La protección real de los datos la hacen las políticas **RLS** (ver [Seguridad](#seguridad-y-buenas-prácticas)).
- **Nunca** se debe usar ni exponer la `service_role key` en este archivo ni en ningún código que corra en el navegador: esa clave se salta todas las políticas de seguridad.
- Además hay que configurar, del lado del **dashboard de Supabase** (no en código):
  - **Authentication → URL Configuration → Site URL**: la URL pública donde quede publicado el sitio (para que los links de verificación de correo redirijan correctamente a `/#type=signup`, que la app detecta para mostrar "Correo verificado").

## Cómo correr el proyecto en local

No requiere instalar nada. Basta con servir la carpeta como archivos estáticos:

- **VS Code**: extensión "Live Server" → clic derecho en `index.html` → *Open with Live Server*.
- **Alternativa por terminal**: `npx serve .` o `python3 -m http.server 5500` desde la carpeta del proyecto.

No abras `index.html` con doble clic (`file://`): algunos navegadores bloquean `fetch`/`supabase-js` en ese modo. Siempre serví el proyecto con un servidor local.

## Base de datos

El modelo completo (diagrama entidad-relación en 3FN + diagramas UML) está en **[`DIAGRAMAS.md`](./DIAGRAMAS.md)**.

Para levantar la base de datos desde cero en un proyecto nuevo de Supabase, correr en el **SQL Editor**, en este orden exacto:

1. `supabase/schema.sql`
2. `supabase/migracion_plan_de_pago.sql`
3. `supabase/migracion_2_historial_yapti.sql`
4. `supabase/migracion_3_conversaciones_yapti.sql`
5. `supabase/migracion_4_sitios_creativos.sql`

### Tablas

| Tabla | Qué guarda |
|---|---|
| `profiles` | Perfil de cada usuario (extiende `auth.users`): nombre, ciudad favorita, avatar, plan y tokens de YAPTI |
| `gallery` | Fotos publicadas por la comunidad |
| `gallery_likes` / `gallery_saves` | Reacciones a las fotos |
| `locales_negocio` | Negocios que los usuarios con Plan Viajero agregan a Ciudades Creativas |
| `sitios_creativos` | Catálogo curado de sitios turísticos por ciudad (solo editable desde el SQL Editor) |
| `yapti_historial` | Conversaciones del asistente YAPTI, agrupadas por `conversation_id` |

## "Endpoints" (superficie de datos usada por el frontend)

Como no hay una API REST propia, el "contrato de endpoints" son las operaciones que `script.js` ejecuta contra Supabase. Las más importantes:

| Acción | Llamada | Función en `script.js` |
|---|---|---|
| Registrar usuario | `supabaseClient.auth.signUp()` | `handleRegister()` |
| Iniciar sesión | `supabaseClient.auth.signInWithPassword()` | `handleLogin()` |
| Leer sesión actual | `supabaseClient.auth.getSession()` | `getAuthenticatedUser()` |
| Publicar foto | `INSERT` en `gallery` + `storage.from('gallery').upload()` | `handleUploadSubmit()` |
| Leer galería | `SELECT` en `gallery` | `renderGallery()` |
| Comprar/cancelar plan | `UPDATE profiles SET has_plan` | `purchasePlanSimulated()` / `cancelPlanSubscription()` |
| Agregar local | `INSERT` en `locales_negocio` (solo si `has_plan = true`, forzado por RLS) | `handleAddLocalSubmit()` |
| Chatear con YAPTI | `INSERT`/`SELECT` en `yapti_historial` | `sendUserMessage()`, `saveYaptiMessage()` |

## Seguridad y buenas prácticas

- **Row Level Security (RLS) en todas las tablas**: cada política define exactamente qué fila puede leer/escribir cada usuario (por ejemplo, `auth.uid() = user_id`). Esto es lo que reemplaza a la autorización de un backend tradicional, ya que el navegador habla directo con la base de datos.
- **Reglas de negocio también en la base de datos, no solo en el frontend**: la política de `INSERT` en `locales_negocio` exige `has_plan = true` a nivel de SQL — aunque alguien modifique el JavaScript del navegador, no puede saltarse esa condición.
- **Validación de formularios**: todos los formularios (registro, perfil, subir foto, agregar local) usan validación nativa HTML5 (`required`, `type="email"`, `type="file"`) más una revalidación en JavaScript antes de enviar a Supabase.
- **Manejo de errores**: todas las llamadas a Supabase están envueltas en `try/catch` o revisan `{ data, error }`, y los errores se muestran al usuario con notificaciones (toasts) en vez de fallar en silencio o mostrar errores técnicos.
- **Claves**: solo la clave pública (`publishable`/`anon`) vive en el código; la `service_role key` nunca se usa en el navegador.

### Pendientes de seguridad (no implementados todavía)

- **Autenticación de dos factores (2FA)**: Supabase Auth soporta MFA por TOTP de forma nativa (`supabaseClient.auth.mfa`). Se puede agregar como una pantalla de "Activar verificación en dos pasos" en el perfil. *(Puedo implementarlo si querés que lo hagamos ahora.)*
- **Expiración de sesión explícita en la UI**: Supabase ya refresca el token automáticamente y lo expira del lado del servidor, pero falta un manejo explícito en pantalla (por ejemplo, redirigir a `/registro` con un aviso si `onAuthStateChange` reporta `SIGNED_OUT` por expiración, en vez de dejar botones que fallan en silencio).

## Control de versiones

El repositorio usa Git con una rama `main`. Para el resto del desarrollo se recomienda:

- **Commits siguiendo [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/)**: `feat: agregar botón de agregar local`, `fix: modal de compartir momento no abría`, `docs: actualizar README`, `style:`, `refactor:`, `chore:`.
- **Una rama por funcionalidad**, creada desde `main` y fusionada por Pull Request:
  - `feat/plan-de-pago`
  - `feat/yapti-historial`
  - `fix/modal-galeria`
  - `docs/diagramas`
- **Pull Requests** con una descripción corta de qué cambia y por qué, en vez de commitear directo a `main`, para que quede trazabilidad de qué se probó antes de integrar.

## Despliegue a producción

El sitio es 100% estático, así que se puede publicar en cualquier hosting de archivos estáticos:

1. **Elegí un hosting**: GitHub Pages, Netlify o Vercel (cualquiera sirve, no hace falta configurar un runtime de Node).
2. **No hay build command**: es un despliegue de archivos tal cual (`index.html`, `ciudades.html`, `script.js`, `style.css`, `img/`, etc.). Si la plataforma pide un "build command", dejarlo vacío o usar `echo "sin build"`.
3. Verificá que `supabase-config.js` tenga la URL y clave del proyecto de Supabase de **producción** (no la de pruebas).
4. En Supabase → **Authentication → URL Configuration**, agregá la URL final del sitio publicado como *Site URL* y como *Redirect URL*.
5. Corré, en orden, todos los scripts de `supabase/` (ver [Base de datos](#base-de-datos)) sobre el proyecto de producción antes de anunciar el lanzamiento.