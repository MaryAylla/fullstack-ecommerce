// backend/src/middlewares/categoryValidation.js
const { body, param, validationResult } = require('express-validator');

const validateCategory = [
    body('name')
        .notEmpty().withMessage('O nome da categoria é obrigatório.')
        .isLength({ min: 2, max: 255 }).withMessage('O nome deve ter entre 2 e 255 caracteres.'),
    body('description')
        .optional()
        .isString().withMessage('A descrição deve ser um texto.'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateCategoryId = [
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
    validateCategory,
    validateCategoryId
};