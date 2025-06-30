// backend/src/routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/categoryController');
const { validateCategory, validateCategoryId } = require('../middlewares/categoryValidation');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware'); // Importar os middlewares de autenticação

// Rotas para obter categorias (PÚBLICAS)
router.get('/', CategoryController.getAllCategories);
router.get('/:id', validateCategoryId, CategoryController.getCategoryById);

// As rotas definidas ABAIXO desta linha exigirão autenticação JWT e privilégios de administrador.
router.use(authMiddleware, adminMiddleware);

// Rota para criar uma nova categoria (AGORA PROTEGIDA POR ADMIN)
router.post('/', validateCategory, CategoryController.createCategory);

// Rota para atualizar uma categoria por ID (AGORA PROTEGIDA POR ADMIN)
router.put('/:id', validateCategoryId, validateCategory, CategoryController.updateCategory);

// Rota para deletar uma categoria por ID (AGORA PROTEGIDA POR ADMIN)
router.delete('/:id', validateCategoryId, CategoryController.deleteCategory);

module.exports = router;