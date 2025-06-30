// backend/src/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');
const { validateProduct, validateProductId } = require('../middlewares/productValidation');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');
const upload = require('../config/multerConfig'); // NOVO: Importa a configuração do Multer

// Rotas para obter produtos (PÚBLICAS)
router.get('/', ProductController.getAllProducts);
router.get('/:id', validateProductId, ProductController.getProductById);

// Rotas abaixo exigem autenticação e privilégios de administrador
router.use(authMiddleware, adminMiddleware);

// Rota para criar um novo produto
router.post('/', validateProduct, ProductController.createProduct);

// Rota para atualizar um produto por ID
router.put('/:id', validateProductId, validateProduct, ProductController.updateProduct);

// Rota para deletar um produto por ID
router.delete('/:id', validateProductId, ProductController.deleteProduct);

// NOVO: Rota para upload de imagem de um produto
// 'image' é o nome do campo no formulário multipart/form-data
router.post('/:id/upload-image', validateProductId, upload.single('image'), ProductController.uploadProductImage);

module.exports = router;