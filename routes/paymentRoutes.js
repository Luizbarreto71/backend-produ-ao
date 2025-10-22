// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();

// importa as funções do controller
const {
  createPayment,
  handlePaymentReturn,
} = require('../controllers/paymentController');

// cria preferência de pagamento
router.post('/create-payment', createPayment);

// rota de retorno (back_urls) do Mercado Pago
router.get('/payment-return', handlePaymentReturn);

// (opcional, mas fortemente recomendado)
// webhook do Mercado Pago para confirmar pagamento mesmo sem redirect
router.post('/webhook', async (req, res) => {
  try {
    console.log('Webhook recebido do Mercado Pago:', req.body);

    // só processa se for notificação de pagamento
    if (req.body?.type === 'payment' || req.body?.action === 'payment.updated') {
      const mercadopago = require('mercadopago');
      const User = require('../models/User');
      const paymentId = req.body.data?.id || req.query['data.id'];

      if (paymentId) {
        const payment = await mercadopago.payment.findById(paymentId);
        const status = payment.body.status; // approved, pending, rejected...
        const userId = payment.body.external_reference; // id que você passou na preferência

        if (status === 'approved' && userId) {
          await User.findByIdAndUpdate(userId, { isPaid: true });
          console.log(`✅ Pagamento aprovado: user ${userId} marcado como pago`);
        } else {
          console.log(`Pagamento ${paymentId} ainda não aprovado (status: ${status})`);
        }
      }
    }

    return res.sendStatus(200); // sempre 200 pro MP não reenviar infinitamente
  } catch (err) {
    console.error('Erro ao processar webhook:', err);
    return res.sendStatus(200);
  }
});

module.exports = router;
