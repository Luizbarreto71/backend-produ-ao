// controllers/paymentController.js
const { Preference } = require('mercadopago');
const client = require('../src/config/mercadopago');
const User = require('../models/User');

// helpers para evitar // nas URLs
const trimEndSlash = (s = '') => s.replace(/\/+$/, '');
const joinUrl = (base, path) => {
  const b = trimEndSlash(base || '');
  const p = String(path || '').replace(/^\/+/, '');
  return `${b}/${p}`;
};

const createPayment = async (req, res) => {
  try {
    const { userId, title, price, quantity } = req.body;

    if (!userId || price == null) {
      return res.status(400).json({ error: 'userId e price são obrigatórios' });
    }

    // garante que o usuário existe
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    // monta as back_urls apontando para o BACKEND
    const BACKEND = process.env.BACKEND_URL;
    if (!BACKEND) {
      console.error('Faltando BACKEND_URL nas env vars');
      return res.status(500).json({ error: 'Configuração ausente: BACKEND_URL' });
    }

    const preference = new Preference(client);

    const body = {
      items: [
        {
          title: title || 'MindKids Premium',
          unit_price: Number(price),
          quantity: Number(quantity || 1),
        },
      ],
      external_reference: String(userId), // id do user no seu DB
      back_urls: {
        success: joinUrl(BACKEND, '/api/payments/payment-return'),
        failure: joinUrl(BACKEND, '/api/payments/payment-return'),
        pending: joinUrl(BACKEND, '/api/payments/payment-return'),
      },
      auto_return: 'approved',
    };

    const mpRes = await preference.create({ body });

    // o SDK pode retornar init_point em caminhos diferentes conforme a versão
    const initPoint =
      mpRes?.init_point ||
      mpRes?.body?.init_point ||
      mpRes?.sandbox_init_point ||
      mpRes?.body?.sandbox_init_point;

    if (!initPoint) {
      console.error('Resposta do MP sem init_point:', mpRes);
      return res.status(502).json({ error: 'Falha ao criar preferência no Mercado Pago' });
    }

    return res.status(201).json({
      init_point: initPoint,
      preference_id: mpRes?.id || mpRes?.body?.id || null,
    });
  } catch (error) {
    console.error('Erro ao criar preferência:', error);
    return res.status(500).json({ error: 'Erro ao processar pagamento' });
  }
};

const handlePaymentReturn = async (req, res) => {
  try {
    const { status, external_reference } = req.query;

    const FRONT_SUCCESS = process.env.MP_BACK_URL_SUCCESS;
    const FRONT_FAILURE = process.env.MP_BACK_URL_FAILURE;
    const FRONT_PENDING = process.env.MP_BACK_URL_PENDING || FRONT_FAILURE;

    // aprovado -> marca como pago e redireciona para a página de sucesso do front
    if (status === 'approved' && external_reference) {
      await User.findByIdAndUpdate(external_reference, { isPaid: true });
      return res.redirect(FRONT_SUCCESS);
    }

    // pendente -> manda para a tela de pendente
    if (status === 'pending') {
      return res.redirect(FRONT_PENDING);
    }

    // demais casos -> falha
    return res.redirect(FRONT_FAILURE);
  } catch (error) {
    console.error('Erro ao processar retorno:', error);
    return res.redirect(process.env.MP_BACK_URL_FAILURE);
  }
};

module.exports = { createPayment, handlePaymentReturn };

