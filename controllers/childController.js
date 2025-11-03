// controllers/childController.js
const Child = require('../models/Child');

exports.listChildren = async (req, res) => {
  try {
    const items = await Child.find({ userId: req.userId }).sort({ createdAt: 1 });
    res.json(items);
  } catch (e) {
    console.error('listChildren:', e);
    res.status(500).json({ error: 'Erro ao listar perfis' });
  }
};

exports.createChild = async (req, res) => {
  try {
    const { name, age } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    // Limite de 2 perfis por conta
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

    res.status(201).json(created);
  } catch (e) {
    console.error('createChild:', e);
    res.status(500).json({ error: 'Erro ao criar perfil' });
  }
};
