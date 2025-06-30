// backend/src/middlewares/orderValidation.js
const { body, param, validationResult } = require('express-validator');

const validateCreateOrder = [
    body('shipping_address')
        .notEmpty().withMessage('O endereço de entrega é obrigatório.')
        .isLength({ min: 10 }).withMessage('O endereço de entrega deve ter pelo menos 10 caracteres.'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateOrderId = [
    param('id')
        .isInt({ min: 1 }).withMessage('ID do pedido deve ser um número inteiro positivo.'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateUpdateOrderStatus = [
    param('id')
        .isInt({ min: 1 }).withMessage('ID do pedido deve ser um número inteiro positivo.'),
    body('status')
        .notEmpty().withMessage('O status é obrigatório.')
        .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Status inválido.'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateUpdatePaymentStatus = [
    param('id')
        .isInt({ min: 1 }).withMessage('ID do pedido deve ser um número inteiro positivo.'),
    body('payment_status')
        .notEmpty().withMessage('O status de pagamento é obrigatório.')
        .isIn(['pending', 'paid', 'refunded']).withMessage('Status de pagamento inválido.'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    validateCreateOrder,
    validateOrderId,
    validateUpdateOrderStatus,
    validateUpdatePaymentStatus
};