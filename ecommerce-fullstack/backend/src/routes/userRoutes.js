// backend/src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { validateUserCreate, validateUserUpdate, validateUserId } = require('../middlewares/userValidation');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware'); // Importar os middlewares de autenticação

// Rota para criar um novo usuário (registro) - PÚBLICA, não requer autenticação
router.post('/', validateUserCreate, UserController.createUser);

// As rotas definidas ABAIXO desta linha exigirão autenticação JWT e privilégios de administrador.
// O middleware `router.use()` aplica-se a todas as requisições que chegam a este router APÓS esta linha.
router.use(authMiddleware, adminMiddleware);

// Rota para obter todos os usuários (AGORA PROTEGIDA POR ADMIN)
router.get('/', UserController.getAllUsers);

// Rota para obter um usuário por ID (AGORA PROTEGIDA POR ADMIN)
router.get('/:id', validateUserId, UserController.getUserById);

// Rota para atualizar um usuário por ID (AGORA PROTEGIDA POR ADMIN)
router.put('/:id', validateUserId, validateUserUpdate, UserController.updateUser);

// Rota para deletar um usuário por ID (AGORA PROTEGIDA POR ADMIN)
router.delete('/:id', validateUserId, UserController.deleteUser);

module.exports = router;