// src/index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Carrega variáveis de ambiente (.env)
dotenv.config();

// Conexão MongoDB
connectDB();

const app = express();

// Necessário no Render para redirecionamentos HTTPS e IP correto
app.set('trust proxy', 1);

/* ==============  C O R S  ================= */
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL,        // ex.: https://mindkidss.com
  'https://mindkidss.com',
  'https://www.mindkidss.com',
  'http://localhost:5173',         // dev local do Vite
].filter(Boolean);

console.log('[CORS] ALLOWED_ORIGINS =>', ALLOWED_ORIGINS);

app.use(
  cors({
    origin(origin, cb) {
      // permite curl/postman (origin null) e as origins liberadas
      if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      console.warn('[CORS] BLOQUEADO:', origin);
      return cb(new Error(`CORS bloqueado para origem: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
  })
);

// responde a preflights para qualquer rota
app.options('*', cors());

/* ============  P A R S E R S  ============= */
app.use(express.json({ limit: '1mb' }));

/* ==============  R O T A S  =============== */
// IMPORTS — como o index.js está em src/, usa ../routes/...
const paymentRoutes = require('../routes/paymentRoutes');
const userRoutes    = require('../routes/userRoutes');
const childRoutes   = require('../routes/childRoutes'); // ⭐ perfis de crianças

// MOUNT
app.use('/api/payments', paymentRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/children', childRoutes); // ⭐ AGORA ESTÁ EXPONDO /api/children

// Healthcheck
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'MindKids API online 🚀',
    time: new Date().toISOString(),
  });
});

// Opcional: rota raiz só para ver que está vivo
app.get('/', (_req, res) => {
  res.status(200).send('MindKids API — OK');
});

/* ============  S E R V I D O R  ============ */
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log('✅ MindKids API rodando!');
  console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⚙️ Porta: ${PORT}`);
  console.log(`🔗 FRONTEND_URL: ${process.env.FRONTEND_URL || 'não definido'}`);
});
