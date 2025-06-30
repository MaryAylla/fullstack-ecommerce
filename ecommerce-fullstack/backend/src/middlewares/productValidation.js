// backend/src/middlewares/productValidation.js
const { body, param, validationResult } = require('express-validator');

const validateProduct = [
    body('name')
        .notEmpty().withMessage('O nome do produto é obrigatório.')
        .isLength({ min: 3, max: 255 }).withMessage('O nome deve ter entre 3 e 255 caracteres.'),
    body('description')
        .optional()
        .isString().withMessage('A descrição deve ser um texto.'),
    body('price')
        .notEmpty().withMessage('O preço é obrigatório.')
        .isFloat({ gt: 0 }).withMessage('O preço deve ser um número maior que zero.'),
    body('stock_quantity')
        .notEmpty().withMessage('A quantidade em estoque é obrigatória.')
        .isInt({ min: 0 }).withMessage('A quantidade em estoque deve ser um número inteiro não negativo.'),
    
    // NOVO: Validação para category_id
    body('category_id')
        .optional({ nullable: true }) // O category_id é opcional e pode ser nulo
        .isInt({ min: 1 }).withMessage('O ID da categoria deve ser um número inteiro positivo.')
        .toInt(), // Converte para inteiro, importante para o SQL
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateProductId = [
    param('id')
        .isInt({ min: 1 }).withMessage('O ID deve ser um número inteiro positivo.'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    validateProduct,
    validateProductId
};