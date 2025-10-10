const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');



const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const user = new User({ name, email, password });

    await user.save();
    res.status(201).json({ userId: user._id });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(400).json({ error: 'Erro ao registrar usuário' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '1h' }
    );

    const { password: _, ...userData } = user.toObject();

    res.json({ user: userData, token });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
};

const checkUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json({ isPaid: user.isPaid });
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    res.status(500).json({ error: 'Erro ao verificar status' });
  }
};

const getUserProfile = async (req, res) => {
    try {
        // ASSUMIMOS que o middleware salva o ID aqui, com base na chave do token (userId)
        const userId = req.userId; 

        if (!userId) {
            // Isso acontece se o verifyToken falhar ou não adicionar o ID
            return res.status(401).json({ error: 'Acesso negado: ID de usuário ausente.' });
        }

        // Busca o usuário, excluindo a senha
        const user = await User.findById(userId).select('-password'); 

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        // Retorna o objeto do usuário completo (incluindo isPaid)
        return res.status(200).json({ user });

    } catch (error) {
        console.error('Erro ao buscar perfil do usuário:', error);
        return res.status(500).json({ error: 'Erro interno ao buscar perfil.' });
    }
};
// userController.js (Adicione esta função)

const verifyToken = (req, res, next) => {
    // 1. Pega o token do cabeçalho de autorização
    const token = req.header('Authorization')?.replace('Bearer ', ''); 
    
    if (!token) {
        return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
    }

    try {
        // 2. Verifica o token (baseado na sua chave 'userId' no login)
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
        
        // 3. Salva o ID na requisição, que será usado por getUserProfile
        req.userId = decoded.userId; 
        
        next(); 
    } catch (ex) {
        res.status(400).json({ error: 'Token inválido.' });
    }
};

module.exports = { 
    registerUser, 
    checkUserStatus, 
    loginUser,
    getUserProfile, // Para buscar o perfil
    verifyToken     // Para proteger a rota de perfil
};


