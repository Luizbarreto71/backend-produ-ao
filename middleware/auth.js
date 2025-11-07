const jwt = require('jsonwebtoken');

module.exports = function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const [, token] = authHeader.split(' ');

    if (!token) {
      return res.status(401).json({ error: 'Token ausente' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // use o mesmo campo que você coloca no token no login (ex.: { id: user._id })
    req.userId = decoded.id || decoded._id || decoded.userId;
    if (!req.userId) return res.status(401).json({ error: 'Token inválido' });

    return next();
  } catch (e) {
    console.error('[auth] erro:', e.message);
    return res.status(401).json({ error: 'Não autenticado' });
  }
};
