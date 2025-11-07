// controllers/childController.js
const Child = require('../models/Child');

exports.listChildren = async (req, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Não autenticado' });

    const items = await Child.find({ userId: req.userId }).sort({ createdAt: 1 });
    return res.json(items);
  } catch (e) {
    console.error('listChildren:', e);
    return res.status(500).json({ error: 'Erro ao listar perfis' });
  }
};

exports.createChild = async (req, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Não autenticado' });

    const { name, age } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    // Limite de 2 perfis por conta (mude para 1 se quiser)
    const count = await Child.countDocuments({ userId: req.userId });
    if (count >= 2) {
      return res.status(403).json({ error: 'Limite de 2 perfis por conta atingido' });
    }

    // Evitar duplicado por nome
    const exists = await Child.findOne({ userId: req.userId, name: name.trim() });
    if (exists) {
      return res.status(409).json({ error: 'Já existe um perfil com esse nome' });
    }

    const created = await Child.create({
      userId: req.userId,
      name: name.trim(),
      age: typeof age === 'number' ? age : undefined,
    });

    return res.status(201).json(created);
  } catch (e) {
    console.error('createChild:', e?.message || e);

    // Erros comuns do Mongoose que viram 500: tratamos para 400
    if (e.name === 'ValidationError') {
      return res.status(400).json({ error: 'Dados inválidos', details: e.errors });
    }
    if (e.code === 11000) { // índice único
      return res.status(409).json({ error: 'Perfil duplicado' });
    }
    return res.status(500).json({ error: 'Erro ao criar perfil' });
  }
};
