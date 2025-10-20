const { Preference } = require('mercadopago');
const client = require('../src/config/mercadopago');
const User = require('../models/User');

const createPayment = async (req, res) => {
  try {
    const { userId, title, price, quantity } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const preference = new Preference(client);

   // controllers/paymentController.js
const body = {
  items: [{ title, unit_price: Number(price), quantity: Number(quantity) }],
  back_urls: {
    success: `${process.env.BACKEND_URL}/api/payments/payment-return`,
    failure: `${process.env.BACKEND_URL}/api/payments/payment-return`,
    pending: `${process.env.BACKEND_URL}/api/payments/payment-return`,
  },
  auto_return: 'approved',
  external_reference: userId,
};


    const response = await preference.create({ body });
    res.json({ init_point: response.init_point });
  } catch (error) {
    console.error('Erro ao criar preferência:', error);
    res.status(500).json({ error: 'Erro ao processar pagamento' });
  }
};

const handlePaymentReturn = async (req, res) => {
  try {
    const { status, external_reference } = req.query;

    if (status === 'approved') {
      await User.findByIdAndUpdate(external_reference, { isPaid: true });
      return res.redirect(process.env.MP_BACK_URL_SUCCESS);
    }
    res.redirect(process.env.MP_BACK_URL_FAILURE);
  } catch (error) {
    console.error('Erro ao processar retorno:', error);
    res.redirect(process.env.MP_BACK_URL_FAILURE);
  }
};

module.exports = { createPayment, handlePaymentReturn };
