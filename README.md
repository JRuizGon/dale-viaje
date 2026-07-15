# Dale Viaje - Compartiendo Caminos 🌍🎒

**Dale Viaje** es una plataforma web interactiva diseñada para que viajeros compartan sus aventuras, fotos y descubrimientos de destinos turísticos. El proyecto cuenta con un sistema de autenticación de usuarios, una galería dinámica y persistencia de datos local para registrar cada experiencia.

---

## 🚀 Características del Proyecto

* **Autenticación Completa:** Registro e inicio de sesión de usuarios con almacenamiento local de sesión (`localStorage`).
* **Galería Dinámica:** Los usuarios registrados pueden subir imágenes de sus viajes con un título y descripción detallada.
* **Base de Datos Relacional:** Uso de **SQLite** para gestionar de forma eficiente la información de usuarios y destinos publicados.
* **Diseño Adaptable:** Interfaz moderna, limpia y totalmente responsiva adaptada para dispositivos móviles y computadoras.

---

## 🛠️ Tecnologías Utilizadas

* **Frontend:** HTML5, CSS3 (con estilos personalizados y efectos visuales modernos) y JavaScript moderno (ES6 / Fetch API).
* **Backend:** Node.js junto con el framework Express.
* **Base de Datos:** SQLite (`sqlite3`) para un almacenamiento rápido sin necesidad de servidores de bases de datos complejos.
* **Gestión de Archivos:** Multer para procesar y almacenar de forma segura las imágenes subidas en el servidor.

---

## 📦 Estructura del Repositorio

El proyecto se compone de los siguientes archivos principales:

1. `server.js`: Servidor Express que gestiona la API REST, la subida de imágenes y la conexión con la base de datos `dale_viaje.db`.
2. `index.html`: Estructura principal de la aplicación que contiene el banner de Nicaragua, los formularios de acceso y el contenedor de la galería.
3. `style.css`: Estilos visuales del sitio, incluyendo efectos de transición en las tarjetas de la galería y diseño adaptativo.
4. `script.js`: Lógica del cliente que interactúa con la API del servidor para registrar usuarios, iniciar sesión, renderizar los destinos y subir nuevas publicaciones.

---

## 🔧 Instrucciones de Instalación y Ejecución

Para levantar el proyecto en tu entorno local, asegúrate de tener instalado [Node.js](https://nodejs.org/) y sigue estos pasos:

### 1. Clonar el repositorio
```bash
git clone [https://github.com/TU_USUARIO/dale-viaje.git](https://github.com/TU_USUARIO/dale-viaje.git)
cd dale-viaje
