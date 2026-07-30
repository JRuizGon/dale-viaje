# Documentación de Diseño y Diagramas: Dale Viaje 🌍

Este documento contiene la especificación formal de la base de datos normalizada y los tres diagramas UML requeridos para el sistema **Dale Viaje**.

---

## 1. Diagrama Entidad-Relación Normalizado (3FN)

Para garantizar la integridad de los datos y evitar redundancias, el modelo relacional se estructuró en **Tercera Forma Normal (3FN)**.

### Listado de Tablas y Atributos

1. **`ROLES`**
   * `id_rol` (INT, PK, Auto_Increment)
   * `nombre_rol` (VARCHAR(20), Unique) — *Ejemplos: 'Admin', 'Viajero'*

2. **`USUARIOS`**
   * `id_usuario` (INT, PK, Auto_Increment)
   * `username` (VARCHAR(50), Unique, Not Null)
   * `password_hash` (VARCHAR(255), Not Null)
   * `email` (VARCHAR(100), Unique, Not Null)
   * `id_rol` (INT, FK -> `ROLES.id_rol`)

3. **`CATEGORIAS`**
   * `id_categoria` (INT, PK, Auto_Increment)
   * `nombre_categoria` (VARCHAR(50), Not Null) — *Ejemplos: 'Playas', 'Volcanes', 'Ciudades Históricas'*

4. **`DESTINOS`**
   * `id_destino` (INT, PK, Auto_Increment)
   * `titulo` (VARCHAR(100), Not Null)
   * `descripcion` (TEXT)
   * `imagen_url` (VARCHAR(255), Not Null)
   * `id_usuario` (INT, FK -> `USUARIOS.id_usuario`)
   * `id_categoria` (INT, FK -> `CATEGORIAS.id_categoria`)
   * `fecha_publicacion` (DATETIME, Default Current_Timestamp)

### Esquema Gráfico ER (ASCII / Mermaid)

```mermaid
erDiagram
    ROLES ||--o{ USUARIOS : "asignado a"
    USUARIOS ||--o{ DESTINOS : "publica"
    CATEGORIAS ||--o{ DESTINOS : "clasifica"

    ROLES {
        int id_rol PK
        string nombre_rol
    }

    USUARIOS {
        int id_usuario PK
        string username
        string password_hash
        string email
        int id_rol FK
    }

    CATEGORIAS {
        int id_categoria PK
        string nombre_categoria
    }

    DESTINOS {
        int id_destino PK
        string titulo
        string descripcion
        string imagen_url
        int id_usuario FK
        int id_categoria FK
        datetime fecha_publicacion
    }