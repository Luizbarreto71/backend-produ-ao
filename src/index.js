// src/index.js ou server/index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

dotenv.config();

const paymentRoutes = require('../routes/paymentRoutes');
const userRoutes = require('../routes/userRoutes');

connectDB();

const app = express();

// -------- CONFIGURAÇÕES GERAIS --------

// Confia no proxy (obrigatório no Render para redirecionamentos HTTPS funcionarem)
app.set('trust proxy', 1);

// Middleware CORS - inclui as URLs do front
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL, // exemplo: https://mindkidss.com
      'https://mindkidss.com',
      'https://www.mindkidss.com',
      'http://localhost:5174',
    ].filter(Boolean), // remove undefined
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
);

// Permite JSON
app.use(express.json());

// -------- ROTAS PRINCIPAIS --------

// Pagamentos (Mercado Pago)
app.use('/api/payments', paymentRoutes);

// Usuários (login, cadastro, perfil, etc)
app.use('/api/users', userRoutes);

// Rota de teste / monitoramento
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'MindKids API online 🚀',
    time: new Date(),
  });
});

// -------- INICIALIZAÇÃO --------

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log('✅ MindKids API rodando!');
  console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⚙️  Porta: ${PORT}`);
  console.log(`🔗 Frontend permitido: ${process.env.FRONTEND_URL || 'não definido'}`);
});
