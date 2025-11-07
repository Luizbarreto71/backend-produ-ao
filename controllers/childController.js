// controllers/childController.js
const Child = require('../models/Child');

exports.listChildren = async (req, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Não autenticado' });

    console.log('[listChildren] userId =', req.userId);

    const items = await Child.find({ userId: req.userId }).sort({ createdAt: 1 });
    console.log(`[listChildren] encontrados ${items.length} perfis`);
    return res.json(items);
  } catch (e) {
    console.error('[listChildren] Erro:', e);
    return res.status(500).json({ error: 'Erro ao listar perfis' });
  }
};

exports.createChild = async (req, res) => {
  try {
    // 🔍 Log de tudo que chega
    console.log('==============================');
    console.log('[createChild] Requisição recebida');
    console.log('[createChild] Headers:', req.headers);
    console.log('[createChild] userId:', req.userId);
    console.log('[createChild] Body recebido:', req.body);
    console.log('==============================');

    if (!req.userId) {
      console.warn('[createChild] ❌ Falha: Token ausente ou inválido');
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const { name, age } = req.body || {};

    if (!name || !String(name).trim()) {
      console.warn('[createChild] ❌ Falha: Nome é obrigatório');
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    // ✅ Limite de 1 perfil por conta
    const count = await Child.countDocuments({ userId: req.userId });
    console.log(`[createChild] Perfis existentes: ${count}`);
    if (count >= 1) {
      console.warn('[createChild] ❌ Limite de 1 perfil por conta atingido');
      return res.status(403).json({ error: 'Limite de 1 perfil por conta atingido' });
    }

    // ✅ Evitar duplicado por nome
    const exists = await Child.findOne({ userId: req.userId, name: String(name).trim() });
    if (exists) {
      console.warn('[createChild] ❌ Já existe um perfil com esse nome');
      return res.status(409).json({ error: 'Já existe um perfil com esse nome' });
    }

    // ✅ Criar
    const created = await Child.create({
      userId: req.userId,
      name: String(name).trim(),
      ...(typeof age === 'number' ? { age } : {}),
    });

    console.log('[createChild] ✅ Perfil criado com sucesso:', created);
    return res.status(201).json(created);
  } catch (e) {
    console.error('[createChild] ❌ Erro inesperado:', e);

    // Erros de validação
    if (e.name === 'ValidationError') {
      console.warn('[createChild] ⚠️ ValidationError:', e.errors);
      return res.status(400).json({ error: 'Dados inválidos', details: e.errors });
    }

    // Erro de duplicidade MongoDB
    if (e.code === 11000) {
      console.warn('[createChild] ⚠️ Perfil duplicado');
      return res.status(409).json({ error: 'Perfil duplicado' });
    }

    return res.status(500).json({ error: 'Erro ao criar perfil' });
  }
};
