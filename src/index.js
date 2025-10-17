const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Importações
const connectDB = require('./config/database');
const paymentRoutes = require('../routes/paymentRoutes');
const userRoutes = require('../routes/userRoutes');

dotenv.config();

// 1. Defina a porta e a URL do Frontend
const PORT = process.env.PORT || 4000;
// Use a variável de ambiente para o CORS (configurada no Render)
const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173'; 

// --- FUNÇÃO PRINCIPAL PARA ORQUESTRAR A INICIALIZAÇÃO ---
const startServer = async () => {
    
    // 2. CORREÇÃO DE TIMING: ESPERA A CONEXÃO COM O MONGODB TERMINAR
    // A função connectDB deve ser uma função async/await
    await connectDB(); 

    // O Express só inicia APÓS o DB estar pronto
    const app = express();
    
    // Middleware CORS
    app.use(
      cors({
        // 3. CORREÇÃO DE CORS: Usa a variável de ambiente
        origin: [frontendURL, 'http://localhost:5173'], 
        methods: ['GET', 'POST'],
        credentials: true,
      })
    );

    app.use(express.json());
    
    // Rota de Teste de Vida (Para verificar se o Render está ativo)
    app.get('/', (req, res) => {
        res.status(200).send('MindKids Backend OK e Conectado ao DB!');
    });


    // Rotas
    app.use('/api/payments', paymentRoutes);
    app.use('/api/users', userRoutes);

    // 4. INICIALIZAÇÃO DO SERVIDOR
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
};

// Chama a função principal
startServer();