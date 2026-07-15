const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middlewares - Aumentamos el límite para permitir imágenes Base64 pesadas
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Inicialización de la Base de Datos SQLite
const dbPath = path.resolve(__dirname, 'ruta505.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al abrir la base de datos:', err.message);
    } else {
        console.log('Conectado con éxito a la base de datos SQLite (ruta505.db)');
        crearTablas();
    }
});

// Crear tablas si no existen
function crearTablas() {
    // Tabla de Usuarios (Añadido campo avatar y city)
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            city TEXT DEFAULT 'Granada',
            avatar TEXT DEFAULT ''
        )
    `);

    // Tabla de la Galería (Bitácora de momentos)
    db.run(`
        CREATE TABLE IF NOT EXISTS gallery (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT NOT NULL,
            location TEXT NOT NULL,
            description TEXT,
            likes INTEGER DEFAULT 0,
            comments_count INTEGER DEFAULT 0,
            is_saved INTEGER DEFAULT 0
        )
    `);
}

/* ==========================================================================
    ENDPOINTS DE AUTENTICACIÓN Y PERFIL (CORREGIDOS)
   ========================================================================== */

// Registro de usuarios - Corregidos los parámetros de Express (req, res)
app.post('/api/register', (req, res) => {
    const { username, email, password } = req.body;
    
    // Validar que no vengan vacíos ni con espacios en blanco
    if (!username || !email || !password || username.trim() === "" || email.trim() === "" || password.trim() === "") {
        return res.status(400).json({ success: false, error: 'Todos los campos son requeridos.' });
    }

    // Forzamos minúsculas en el email para evitar problemas de mayúsculas/minúsculas al loguearse
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    const query = `INSERT INTO users (username, email, password, city, avatar) VALUES (?, ?, ?, ?, ?)`;
    
    // Pasamos 'Granada' como ciudad por defecto y un string vacío para el avatar inicial
    db.run(query, [cleanUsername, cleanEmail, cleanPassword, 'Granada', ''], function (err) {
        if (err) {
            console.error("Error al registrar usuario en SQLite:", err.message);
            if (err.message.includes('UNIQUE')) {
                return res.status(400).json({ success: false, error: 'El correo electrónico ya está registrado.' });
            }
            return res.status(500).json({ success: false, error: 'Error interno al crear la cuenta.' });
        }
        
        console.log(`Usuario registrado con éxito. ID: ${this.lastID} - Nombre: ${cleanUsername}`);
        res.json({ success: true, message: '¡Cuenta creada con éxito! Ya puedes iniciar sesión.' });
    });
});

// Endpoint de Login - Sincronizado perfectamente con el registro
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Por favor, introduce tu correo y contraseña.' });
    }

    // Buscamos transformando a minúsculas para que coincida con el registro
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const query = `SELECT id, username, email, city, avatar FROM users WHERE LOWER(email) = ? AND password = ?`;
    
    db.get(query, [cleanEmail, cleanPassword], (err, user) => {
        if (err) {
            console.error("Error en consulta de Login:", err.message);
            return res.status(500).json({ success: false, error: 'Error en el servidor al procesar el reingreso.' });
        }
        
        if (!user) {
            // Si no encuentra el registro exacto de correo y contraseña
            return res.status(400).json({ success: false, error: 'Credenciales incorrectas o usuario no encontrado.' });
        }

        // Login exitoso: Devolvemos el objeto tal y como lo espera checkSession()
        console.log(`Sesión iniciada por el explorador: @${user.username}`);
        res.json({ success: true, user });
    });
});

// Actualización de Perfil (Utilizado por tu función saveProfile)
app.post('/api/update-profile', (req, res) => {
    const { username, city, email } = req.body;

    if (!username || !email) {
        return res.status(400).json({ success: false, error: 'El nombre de usuario y email son obligatorios.' });
    }

    const query = `UPDATE users SET username = ?, city = ? WHERE email = ?`;
    db.run(query, [username, city, email], function (err) {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, message: 'Perfil actualizado correctamente.' });
    });
});


/* ==========================================================================
    ENDPOINTS DE LA GALERÍA / BITÁCORA VIAJERA
   ========================================================================== */

// Subir un momento viajero (Guarda la imagen Base64 y los metadatos)
app.post('/api/upload', (req, res) => {
    const { url, location, description } = req.body;

    if (!url || !location) {
        return res.status(400).json({ success: false, error: 'Faltan datos obligatorios (Imagen o Locación).' });
    }

    const query = `INSERT INTO gallery (url, location, description) VALUES (?, ?, ?)`;
    db.run(query, [url, location, description], function (err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, error: 'Error al registrar en la base de datos.' });
        }
        res.json({ success: true, id: this.lastID });
    });
});

// Obtener toda la galería (Llamado por renderGallery)
app.get('/api/gallery', (req, res) => {
    const query = `SELECT * FROM gallery ORDER BY id DESC`;
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json(rows);
    });
});

// Interacciones dinámicas: Likes y Guardados (Manejado por tus funciones toggleLike y toggleSave)
app.patch('/api/gallery/:id/action', (req, res) => {
    const { id } = req.params;
    const { action, value } = req.body; // action: 'like' o 'save'

    let query = '';
    if (action === 'like') {
        // Incrementa o decrementa la columna likes según el valor enviado (1 o -1)
        query = `UPDATE gallery SET likes = likes + (${parseInt(value)}) WHERE id = ?`;
    } else if (action === 'save') {
        // Guarda un booleano simplificado a entero (1 o 0) en SQLite
        const saveValue = value ? 1 : 0;
        query = `UPDATE gallery SET is_saved = ${saveValue} WHERE id = ?`;
    } else {
        return res.status(400).json({ error: 'Acción no válida' });
    }

    db.run(query, [id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true });
    });
});

// Encendido del servidor
app.listen(PORT, () => {
    console.log(`Servidor de Ruta 505 corriendo en http://localhost:${PORT}`);
});