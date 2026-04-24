require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const mysql      = require('mysql2/promise');

// ── Rutas ────────────────────────────────────────────────────
const authRouter       = require('./routes/auth');
const clientesRouter   = require('./routes/clientes');
const productosRouter  = require('./routes/productos');
const ventasRouter     = require('./routes/ventas');
const reportesRouter   = require('./routes/reportes');
const categoriasRouter = require('./routes/categorias');
const proveedoresRouter= require('./routes/proveedores');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middlewares globales ─────────────────────────────────────
app.use(cors({
  origin: 'http://localhost:5173',   // URL del frontend Vite
  credentials: true
}));
app.use(express.json());

// ── Pool de conexiones MySQL ─────────────────────────────────
const pool = mysql.createPool({
  host    : process.env.DB_HOST,
  port    : process.env.DB_PORT     || 3306,
  database: process.env.DB_NAME,
  user    : process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit   : 10,
  queueLimit        : 0
});

// Exponemos el pool para que las rutas lo importen
app.locals.db = pool;

// ── Rutas de la API ──────────────────────────────────────────
app.use('/api/auth',        authRouter);
app.use('/api/clientes',    clientesRouter);
app.use('/api/productos',   productosRouter);
app.use('/api/ventas',      ventasRouter);
app.use('/api/reportes',    reportesRouter);
app.use('/api/categorias',  categoriasRouter);
app.use('/api/proveedores', proveedoresRouter);

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', db: err.message });
  }
});

// ── Manejo de errores global ─────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor'
  });
});

// ── Arranque ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
});