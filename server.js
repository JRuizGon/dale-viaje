require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Faltan las variables de Supabase en el archivo .env');
}

const supabaseAuth = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_PUBLISHABLE_KEY
);

// Middlewares - Aumentamos el límite para permitir imágenes Base64 pesadas
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, "frontend")));

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
    // Tabla de Usuarios (Añadido campo avatar y ciudad)
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
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({
            success: false,
            error: 'Todos los campos son requeridos.'
        });
    }

    const { data, error } = await supabase.auth.admin.createUser({
        email: email.trim().toLowerCase(),
        password: password.trim(),
        email_confirm: true,
        user_metadata: {
            username: username.trim()
        }
    });

    if (error) {
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }

    res.json({
        success: true,
        message: '¡Cuenta creada con éxito!'
    });
});

// Endpoint de Login - Sincronizado perfectamente con el registro
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    const { data, error } = await supabaseAuth.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password.trim()
    });

    if (error || !data.user) {
        return res.status(400).json({
            success: false,
            error: 'Credenciales incorrectas.'
        });
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('username, city, avatar_url')
        .eq('id', data.user.id)
        .single();

    res.json({
        success: true,
        user: {
            id: data.user.id,
            username: profile?.username || data.user.user_metadata.username,
            email: data.user.email,
            city: profile?.city || 'Granada',
            avatar: profile?.avatar_url || ''
        }
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