// backend/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { body, validationResult } = require('express-validator'); // Para validação de login

const validateLogin = [
    body('usernameOrEmail')
        .notEmpty().withMessage('Nome de usuário ou email é obrigatório.'),
    body('password')
        .notEmpty().withMessage('Senha é obrigatória.'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

router.post('/login', validateLogin, AuthController.login);

module.exports = router;