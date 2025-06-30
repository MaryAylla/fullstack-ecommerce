// backend/src/middlewares/userValidation.js
const { body, param, validationResult } = require('express-validator');

const validateUserCreate = [
    body('username')
        .notEmpty().withMessage('O nome de usuário é obrigatório.')
        .isLength({ min: 3, max: 50 }).withMessage('O nome de usuário deve ter entre 3 e 50 caracteres.'),
    body('email')
        .notEmpty().withMessage('O email é obrigatório.')
        .isEmail().withMessage('O email deve ser válido.')
        .isLength({ max: 255 }).withMessage('O email deve ter no máximo 255 caracteres.'),
    body('password')
        .notEmpty().withMessage('A senha é obrigatória.')
        .isLength({ min: 6 }).withMessage('A senha deve ter no mínimo 6 caracteres.'),
    body('is_admin')
        .optional()
        .isBoolean().withMessage('O campo is_admin deve ser um booleano.')
        .toBoolean(), // Converte para booleano
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateUserUpdate = [
    body('username')
        .optional() // Username é opcional para atualização
        .isLength({ min: 3, max: 50 }).withMessage('O nome de usuário deve ter entre 3 e 50 caracteres.'),
    body('email')
        .optional() // Email é opcional para atualização
        .isEmail().withMessage('O email deve ser válido.')
        .isLength({ max: 255 }).withMessage('O email deve ter no máximo 255 caracteres.'),
    body('password')
        .optional() // Senha é opcional para atualização
        .isLength({ min: 6 }).withMessage('A senha deve ter no mínimo 6 caracteres.'),
    body('is_admin')
        .optional()
        .isBoolean().withMessage('O campo is_admin deve ser um booleano.')
        .toBoolean(),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateUserId = [
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
    validateUserCreate,
    validateUserUpdate,
    validateUserId
};