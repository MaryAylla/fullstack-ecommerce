// backend/src/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');
const { authMiddleware } = require('../middlewares/authMiddleware'); // Apenas usuários autenticados podem iniciar pagamentos
const { validateCreateCheckoutSession } = require('../middlewares/paymentValidation');

// Rota para iniciar uma sessão de checkout (requer autenticação)
router.post('/create-checkout-session', authMiddleware, validateCreateCheckoutSession, PaymentController.createCheckoutSession);

// Rota para receber webhooks do Stripe (NÃO requer autenticação)
// É crucial que esta rota aceite o corpo RAW da requisição, não JSON parseado.
router.post('/webhook', PaymentController.handleWebhook);

module.exports = router;