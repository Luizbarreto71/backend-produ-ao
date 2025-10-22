// controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/** Utils */
const ensureJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET não definido nas variáveis de ambiente');
  }
  return secret;
};
const isValidEmail = (email = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/** POST /api/users/register */
const registerUser = async (req, res) => {
  try {
    let { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
    }

    email = String(email).toLowerCase().trim();
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'E-mail inválido.' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ error: 'E-mail já registrado.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = new User({ name, email, password: hash, isPaid: false });
    await user.save();

    return res.status(201).json({
      userId: user._id,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isPaid: !!user.isPaid,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return res.status(400).json({ error: 'Erro ao registrar usuário' });
  }
};

/** POST /api/users/login */
const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    email = String(email).toLowerCase().trim();
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password || '');
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { userId: user._id },
      ensureJwtSecret(),
      { expiresIn: '1h' }
    );

    // não envia a senha
    const { password: _, ...userData } = user.toObject();

    return res.json({
      user: {
        _id: userData._id,
        name: userData.name,
        email: userData.email,
        isPaid: !!userData.isPaid,
        createdAt: userData.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return res.status(500).json({ error: 'Erro ao fazer login' });
  }
};

/** GET /api/users/status/:userId */
const checkUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: 'userId obrigatório.' });

    const user = await User.findById(userId).select('isPaid');
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    return res.json({ isPaid: !!user.isPaid });
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    return res.status(500).json({ error: 'Erro ao verificar status' });
  }
};

/** GET /api/users/profile (protegido) */
const getUserProfile = async (req, res) => {
  try {
    const userId = req.userId; // setado pelo verifyToken
    if (!userId) {
      return res.status(401).json({ error: 'Acesso negado: token inválido.' });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    return res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isPaid: !!user.isPaid,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error);
    return res.status(500).json({ error: 'Erro interno ao buscar perfil.' });
  }
};

/** Middleware: verifica Bearer token e injeta req.userId */
const verifyToken = (req, res, next) => {
  try {
    const header = req.headers.authorization || req.header('Authorization') || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
    }

    const decoded = jwt.verify(token, ensureJwtSecret());
    req.userId = decoded.userId;
    return next();
  } catch (ex) {
    return res.status(401).json({ error: 'Token inválido.' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  checkUserStatus,
  getUserProfile,
  verifyToken,
};
