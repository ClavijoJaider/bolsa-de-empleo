const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const app = express();
const PORT = 3000;

// Configuración de la base de datos
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) return console.error(err.message);
  console.log('Conectado a SQLite');

  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      es_empresa BOOLEAN DEFAULT 0
    )`
  );

  db.run(`
    CREATE TABLE IF NOT EXISTS ofertas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      empresa TEXT NOT NULL,
      ubicacion TEXT NOT NULL,
      salario TEXT NOT NULL,
      descripcion TEXT NOT NULL,
      logo TEXT,
      empresa_id INTEGER,
      fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(empresa_id) REFERENCES usuarios(id)
    )`
  );
});

// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Helper: Autenticación JWT
const autenticar = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Acceso no autorizado' });

  jwt.verify(token, 'secreto_jwt', (err, usuario) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.usuario = usuario;
    next();
  });
};

// ========== RUTAS ========== //

app.post('/api/registro', async (req, res) => {
  try {
    let { nombre, email, password, es_empresa } = req.body;
    email = email.toLowerCase().trim();
    const hash = await bcrypt.hash(password, 10);

    db.run(
      `INSERT INTO usuarios (nombre, email, password, es_empresa) 
       VALUES (?, ?, ?, ?)`,
      [nombre, email, hash, es_empresa || 0],
      function(err) {
        if (err) {
          console.error('Error en registro:', err.message);
          return res.status(400).json({ error: 'El email ya está registrado' });
        }
        console.log(`Usuario registrado: ${email}`);
        res.status(201).json({ id: this.lastID });
      }
    );
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

app.post('/api/login', (req, res) => {
  let { email, password } = req.body;
  email = email.toLowerCase().trim();
  console.log(`Intento de login: ${email}`);

  db.get(
    'SELECT * FROM usuarios WHERE email = ?',
    [email],
    async (err, usuario) => {
      if (err) {
        console.error('Error en DB:', err.message);
        return res.status(500).json({ error: 'Error interno' });
      }
      if (!usuario) {
        console.log('Usuario no encontrado');
        return res.status(401).json({ error: 'Credenciales incorrectas' });
      }
      const match = await bcrypt.compare(password, usuario.password);
      if (!match) {
        console.log('Contraseña incorrecta');
        return res.status(401).json({ error: 'Credenciales incorrectas' });
      }
      const token = jwt.sign(
        { id: usuario.id, es_empresa: usuario.es_empresa },
        'secreto_jwt',
        { expiresIn: '2h' }
      );
      res.json({
        token,
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          es_empresa: usuario.es_empresa
        }
      });
    }
  );
});

app.get('/api/ofertas', (req, res) => {
  db.all(
    `SELECT o.*, u.nombre as empresa_nombre 
     FROM ofertas o
     LEFT JOIN usuarios u ON o.empresa_id = u.id`,
    (err, ofertas) => {
      if (err) return res.status(500).send();
      res.json(ofertas);
    }
  );
});

app.post('/api/ofertas', autenticar, (req, res) => {
  if (!req.usuario.es_empresa) {
    return res.status(403).json({ error: 'Solo empresas pueden crear ofertas' });
  }
  const { titulo, empresa, ubicacion, salario, descripcion, logo } = req.body;
  db.run(
    `INSERT INTO ofertas 
     (titulo, empresa, ubicacion, salario, descripcion, logo, empresa_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [titulo, empresa, ubicacion, salario, descripcion, logo, req.usuario.id],
    function(err) {
      if (err) return res.status(500).send();
      res.status(201).json({ id: this.lastID });
    }
  );
});

// Catch-all: sirve el index de tu frontend sin usar un wildcard inválido
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor listo en http://localhost:${PORT}`);
});
