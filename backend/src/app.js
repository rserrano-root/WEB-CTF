require('dotenv').config();
const express    = require('express');
const helmet     = require('helmet');
const morgan     = require('morgan');
const session    = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const path       = require('path');
const fs         = require('fs');

const authRoutes = require('./routes/authRoutes');

const app = express();

// Répertoire racine du projet (un niveau au-dessus de /backend)
const FRONTEND_ROOT = path.join(__dirname, '../../');

// ── Dossier logs ─────────────────────────────────────────────────────────────
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// ── Sécurité des en-têtes HTTP (helmet) ──────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc:     ["'self'"],
        scriptSrc:      ["'self'"],
        styleSrc:       ["'self'", 'https://fonts.googleapis.com'],
        fontSrc:        ["'self'", 'https://fonts.gstatic.com'],
        connectSrc:     ["'self'"],
        imgSrc:         ["'self'", 'data:'],
        frameAncestors: ["'none'"],
      },
    },
    hsts: {
      maxAge:            31536000,
      includeSubDomains: true,
      preload:           true,
    },
  })
);

// ── Fichiers statiques du frontend (même origine → pas de CORS nécessaire) ────
app.use(express.static(FRONTEND_ROOT));

// ── Body parsing (limite 10 ko pour éviter les JSON bombs) ────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// ── Logging HTTP (morgan) ─────────────────────────────────────────────────────
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'),
  { flags: 'a' }
);
app.use(morgan('combined', { stream: accessLogStream }));
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ── Store de sessions MySQL ───────────────────────────────────────────────────
const sessionStore = new MySQLStore({
  host:                process.env.DB_HOST     || '127.0.0.1',
  port:                parseInt(process.env.DB_PORT, 10) || 3306,
  user:                process.env.DB_USER,
  password:            process.env.DB_PASSWORD,
  database:            process.env.DB_NAME,
  createDatabaseTable: true,
  schema: {
    tableName:   'sessions',
    columnNames: {
      session_id: 'session_id',
      expires:    'expires',
      data:       'data',
    },
  },
});

app.use(
  session({
    name:              process.env.SESSION_NAME || 'nexus_sid',
    secret:            process.env.SESSION_SECRET,
    store:             sessionStore,
    resave:            false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:   parseInt(process.env.SESSION_MAX_AGE_MS, 10) || 86400000,
    },
  })
);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);

app.get('/api/health', async (req, res) => {
  try {
    const db = require('./config/db');
    await db.execute('SELECT 1');
    return res.status(200).json({ status: 'ok', db: 'connected', ts: new Date().toISOString() });
  } catch {
    return res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route non trouvée' });
});

// ── Gestionnaire d'erreurs global ─────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  console.error('[unhandled]', err);
  res.status(500).json({ success: false, message: 'Erreur interne' });
});

module.exports = app;
