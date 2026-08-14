# Documentación de Diseño y Diagramas: Dale Viaje 🌍

Este documento contiene la especificación formal de la base de datos normalizada (3FN) y los tres diagramas UML del sistema **Dale Viaje**. Todos los diagramas están en formato [Mermaid](https://mermaid.js.org/), por lo que se renderizan automáticamente al ver este archivo en GitHub.

> La base de datos real vive en Supabase (PostgreSQL). El origen de verdad de cada tabla son los scripts en `supabase/` (`schema.sql` + `migracion_1..4_*.sql`), ejecutados en ese orden.

---

## 1. Diagrama Entidad-Relación Normalizado (3FN)

```mermaid
erDiagram
    AUTH_USERS ||--|| PROFILES : "tiene"
    AUTH_USERS ||--o{ GALLERY : "publica"
    AUTH_USERS ||--o{ GALLERY_LIKES : "da like"
    AUTH_USERS ||--o{ GALLERY_SAVES : "guarda"
    AUTH_USERS ||--o{ LOCALES_NEGOCIO : "registra"
    AUTH_USERS ||--o{ YAPTI_HISTORIAL : "conversa"
    GALLERY ||--o{ GALLERY_LIKES : "recibe"
    GALLERY ||--o{ GALLERY_SAVES : "recibe"

    AUTH_USERS {
        uuid id PK
        string email
        string encrypted_password
    }

    PROFILES {
        uuid id PK
        string username
        string city
        string avatar_url
        boolean has_plan
        int yapti_tokens
        timestamptz created_at
    }

    GALLERY {
        bigint id PK
        uuid user_id FK
        string image_url
        string location
        string description
        timestamptz created_at
    }

    GALLERY_LIKES {
        bigint gallery_id PK
        uuid user_id PK
        timestamptz created_at
    }

    GALLERY_SAVES {
        bigint gallery_id PK
        uuid user_id PK
        timestamptz created_at
    }

    LOCALES_NEGOCIO {
        uuid id PK
        uuid user_id FK
        string nombre
        string ciudad
        string categoria
        string descripcion
        timestamptz created_at
    }

    SITIOS_CREATIVOS {
        uuid id PK
        string ciudad
        string name
        string category
        string description
        numeric rating
        string visitors
        text_array highlights
    }

    YAPTI_HISTORIAL {
        uuid id PK
        uuid user_id FK
        uuid conversation_id
        string role
        text content
        timestamptz created_at
    }
```

### Justificación de la normalización (3FN)

- **1FN**: todos los atributos son atómicos (por ejemplo, `highlights` en `SITIOS_CREATIVOS` es un arreglo nativo de Postgres, no una cadena de texto separada por comas).
- **2FN**: en las tablas con clave compuesta (`GALLERY_LIKES`, `GALLERY_SAVES`) no hay atributos que dependan solo de una parte de la clave; `created_at` depende de la combinación completa `(gallery_id, user_id)`.
- **3FN**: no hay dependencias transitivas. Por ejemplo, los datos de cada sitio turístico viven en `SITIOS_CREATIVOS` y no se repiten dentro de `LOCALES_NEGOCIO` (son conceptos distintos: catálogo curado vs. negocios de la comunidad).
- `PROFILES` es una **extensión 1 a 1** de `AUTH_USERS` (tabla gestionada por Supabase Auth): se separan porque `auth.users` es privada del esquema de autenticación y no debe mezclarse con datos de aplicación.

---

## 2. Diagrama de Casos de Uso

```mermaid
flowchart LR
    Visitante(("Visitante"))
    Viajero(("Viajero registrado"))
    ViajeroPlan(("Viajero con Plan"))

    subgraph Sistema["Dale Viaje"]
        UC1(["Explorar rutas y mapa"])
        UC2(["Registrarse / Iniciar sesión"])
        UC3(["Confirmar correo"])
        UC4(["Editar perfil"])
        UC5(["Publicar foto en Galería"])
        UC6(["Dar like / Guardar foto"])
        UC7(["Consultar Ciudades Creativas"])
        UC8(["Preguntar a YAPTI"])
        UC9(["Comprar Plan Viajero"])
        UC10(["Agregar Local propio"])
        UC11(["Dar de baja el Plan"])
        UC12(["Ver historial de conversaciones"])
    end

    Visitante --> UC1
    Visitante --> UC2
    Visitante --> UC7
    Visitante --> UC8

    Viajero --> UC3
    Viajero --> UC4
    Viajero --> UC5
    Viajero --> UC6
    Viajero --> UC8
    Viajero --> UC9
    Viajero --> UC12

    ViajeroPlan --> UC10
    ViajeroPlan --> UC11

    UC9 -.incluye.-> UC2
    UC10 -.incluye.-> UC9
```

**Notas:**
- *Visitante* = cualquiera que entra sin haber iniciado sesión (tokens gratis limitados en YAPTI).
- *Viajero registrado* = tiene cuenta pero no compró el plan.
- *Viajero con Plan* hereda todos los casos de uso de "Viajero registrado", más los exclusivos del plan.

---

## 3. Diagrama de Actividades

Flujo completo de **"Compartir un Momento en la Galería"**, el caso de uso más representativo del sistema (combina autenticación, validación y persistencia):

```mermaid
flowchart TD
    Start([Inicio]) --> Click["Usuario toca Compartir Momento"]
    Click --> AbrirModal[Se abre el modal al instante]
    AbrirModal --> Verifica{Tiene sesion activa?}

    Verifica -- No --> Redirige[Cerrar modal y redirigir a registro]
    Redirige --> FinNoAuth([Fin])

    Verifica -- Si --> Llenar[Completa nombre destino foto y experiencia]
    Llenar --> Valida{Campos completos?}
    Valida -- No --> Error[Mostrar notificacion de error]
    Error --> Llenar

    Valida -- Si --> Subir[Subir imagen al storage de Supabase]
    Subir --> SubeOk{Subida exitosa?}
    SubeOk -- No --> ErrorSubida[Mostrar notificacion de error]
    ErrorSubida --> Llenar

    SubeOk -- Si --> Insertar[Insertar fila en tabla gallery]
    Insertar --> Refrescar[Cerrar modal y refrescar la grilla]
    Refrescar --> Toast[Mostrar notificacion de exito]
    Toast --> End([Fin])
```

---

## 4. Diagrama de Clases

Modelo conceptual de las entidades principales del sistema y cómo se relacionan (no es una traducción literal del JavaScript, que es procedural, sino el modelo de dominio subyacente):

```mermaid
classDiagram
    class Usuario {
        +uuid id
        +string email
        +string username
        +string city
        +string avatarUrl
        +boolean hasPlan
        +int yaptiTokens
        +iniciarSesion()
        +cerrarSesion()
        +actualizarPerfil()
    }

    class PlanViajero {
        +boolean activo
        +decimal precioMensual
        +comprar()
        +cancelar()
    }

    class PublicacionGaleria {
        +bigint id
        +string imageUrl
        +string location
        +string description
        +datetime createdAt
        +publicar()
    }

    class LocalNegocio {
        +uuid id
        +string nombre
        +string ciudad
        +string categoria
        +string descripcion
        +publicar()
    }

    class SitioCreativo {
        +uuid id
        +string ciudad
        +string name
        +string category
        +decimal rating
        +string[] highlights
    }

    class ConversacionYapti {
        +uuid conversationId
        +Mensaje[] mensajes
        +iniciarNuevoChat()
        +borrarHistorial()
    }

    class Mensaje {
        +string role
        +string content
        +datetime createdAt
    }

    Usuario "1" --> "0..1" PlanViajero : posee
    Usuario "1" --> "0..*" PublicacionGaleria : publica
    Usuario "1" --> "0..*" LocalNegocio : registra
    Usuario "1" --> "0..*" ConversacionYapti : mantiene
    ConversacionYapti "1" *-- "0..*" Mensaje : contiene
    PlanViajero "1" ..> "0..*" LocalNegocio : habilita
```