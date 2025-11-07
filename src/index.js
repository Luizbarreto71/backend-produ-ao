const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

dotenv.config();
connectDB();

const app = express();
app.set('trust proxy', 1);

// CORS
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL,
  'https://mindkidss.com',
  'https://www.mindkidss.com',
  'http://localhost:5173',
].filter(Boolean);

console.log('[CORS] ALLOWED_ORIGINS =>', ALLOWED_ORIGINS);

app.use(
  cors({
    origin(origin, cb) {
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
app.options('*', cors());

app.use(express.json({ limit: '1mb' }));

// ROTAS (index em src/, rotas em ../routes)
const paymentRoutes = require('../routes/paymentRoutes');
const userRoutes    = require('../routes/userRoutes');
const childRoutes   = require('../routes/childRoutes');

app.use('/api/payments', paymentRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/children', childRoutes);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString() });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log('✅ MindKids API rodando!');
  console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⚙️ Porta: ${PORT}`);
  console.log(`🔗 FRONTEND_URL: ${process.env.FRONTEND_URL || 'não definido'}`);
});
