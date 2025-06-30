// backend/src/middlewares/paymentValidation.js
const { body, validationResult } = require('express-validator');

const validateCreateCheckoutSession = [
    body('orderId')
        .notEmpty().withMessage('O ID do pedido é obrigatório para iniciar o pagamento.')
        .isInt({ min: 1 }).withMessage('O ID do pedido deve ser um número inteiro positivo.'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    validateCreateCheckoutSession
};