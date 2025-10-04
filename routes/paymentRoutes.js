const express = require('express');
const router = express.Router();
const { createPayment, handlePaymentReturn } = require('../controllers/paymentController');

router.post('/create-payment', createPayment);
router.get('/payment-return', handlePaymentReturn);

module.exports = router;