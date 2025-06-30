// backend/src/middlewares/cartValidation.js
const { body, param, validationResult } = require('express-validator');

const validateAddToCart = [
    body('product_id')
        .notEmpty().withMessage('ID do produto é obrigatório.')
        .isInt({ min: 1 }).withMessage('ID do produto deve ser um número inteiro positivo.'),
    body('quantity')
        .notEmpty().withMessage('A quantidade é obrigatória.')
        .isInt({ min: 1 }).withMessage('A quantidade deve ser um número inteiro maior que 0.'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateUpdateCartItem = [
    param('id')
        .isInt({ min: 1 }).withMessage('ID do item do carrinho deve ser um número inteiro positivo.'),
    body('quantity')
        .notEmpty().withMessage('A quantidade é obrigatória.')
        .isInt({ min: 0 }).withMessage('A quantidade deve ser um número inteiro não negativo.'), // Permite 0 para remover
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateCartItemId = [
    param('id')
        .isInt({ min: 1 }).withMessage('ID do item do carrinho deve ser um número inteiro positivo.'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    validateAddToCart,
    validateUpdateCartItem,
    validateCartItemId
};