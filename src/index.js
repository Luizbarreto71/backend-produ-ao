// src/index.js ou server/index.js
// server/index.js (Render)
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

dotenv.config();
connectDB();

const app = express();
app.set('trust proxy', 1);

// ====== CORS ======
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL,        // ex.: https://mindkidss.com
  'https://mindkidss.com',
  'https://www.mindkidss.com',
  'http://localhost:5173',         // <- LIBERAR O DEV AQUI!
].filter(Boolean);

// (opcional) log para diagnóstico
console.log('[CORS] ALLOWED_ORIGINS =>', ALLOWED_ORIGINS);

app.use(
  cors({
    origin(origin, cb) {
      // permite curl/postman (origin null) e as origins da lista
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

// responde preflight para qualquer rota
app.options('*', cors());

// ====== BODY PARSER ======
app.use(express.json());

// ====== ROTAS ======
const paymentRoutes = require('../routes/paymentRoutes'); // <- ./ e não ../
const userRoutes    = require('../routes/userRoutes');    // <- ./ e não ../
const childRoutes   = require('../routes/childRoutes');

app.use('/api/payments', paymentRoutes);
app.use('/api/users',    userRoutes);

// healthcheck
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'MindKids API online 🚀',
    time: new Date().toISOString(),
  });
});

// ====== START ======
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log('✅ MindKids API rodando!');
  console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⚙️ Porta: ${PORT}`);
  console.log(`🔗 FRONTEND_URL: ${process.env.FRONTEND_URL || 'não definido'}`);
});
