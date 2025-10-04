// config/database.js

const mongoose = require('mongoose');

const connectDB = async () => {
    // 1. AQUI está a leitura da variável do ambiente Render
    const mongoURI = process.env.MONGODB_URI;

    // 2. Verifica se a variável veio como "indefinido" (UNDEFINED)
    if (!mongoURI) {
        console.error("❌ ERRO GRAVE: A variável MONGODB_URI não foi carregada pelo ambiente do Render.");
        console.error("Por favor, verifique no painel do Render se a chave e o valor estão corretos.");
        // Impede que o servidor tente se conectar com um valor nulo
        return process.exit(1); 
    }

    try {
        await mongoose.connect(mongoURI, {
            // Opções de conexão (useNewUrlParser/useUnifiedTopology são boas práticas)
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('✅ MongoDB Atlas conectado com sucesso!');

    } catch (error) {
        // Isso captura erros de conexão (ex: senha errada, IP bloqueado, etc.)
        console.error(`❌ Erro na Conexão com o MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;