const mongoose = require('mongoose');

const connectDB = async () => {
    // Lê a NOVA variável MONGO_PROD_URI
    const mongoURI = process.env.MONGO_PROD_URI; 

    // VERIFICAÇÃO CRÍTICA: Trava a aplicação se a variável não estiver definida
    if (!mongoURI) {
        console.error("###################################################");
        console.error("❌ ERRO FATAL: Variável MONGO_PROD_URI não foi carregada pelo Render!");
        console.error("A aplicação será encerrada. Verifique as Variáveis de Ambiente no painel do Render.");
        console.error("###################################################");
        return process.exit(1); 
    }

    try {
        // Conecta usando a nova variável
        await mongoose.connect(mongoURI, { 
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB conectado com sucesso');
    } catch (error) {
        console.error('❌ Erro ao conectar ao MongoDB:', error);
        process.exit(1);
    }
};

module.exports = connectDB;