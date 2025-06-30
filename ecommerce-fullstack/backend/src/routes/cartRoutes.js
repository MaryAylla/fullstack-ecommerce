// backend/src/routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const CartController = require('../controllers/cartController');
const { authMiddleware } = require('../middlewares/authMiddleware'); // O carrinho é sempre para usuários autenticados
const { validateAddToCart, validateUpdateCartItem, validateCartItemId } = require('../middlewares/cartValidation');

// Todas as rotas de carrinho exigem autenticação
router.use(authMiddleware); // Aplica authMiddleware a todas as rotas a seguir neste router

// Obter o carrinho do usuário logado
router.get('/', CartController.getUserCart);

// Adicionar um produto ao carrinho (ou atualizar quantidade se já existir)
router.post('/', validateAddToCart, CartController.addItemToCart);

// Atualizar a quantidade de um item no carrinho
router.put('/:id', validateUpdateCartItem, CartController.updateCartItemQuantity);

// Remover um item do carrinho
router.delete('/:id', validateCartItemId, CartController.removeCartItem);

// Limpar o carrinho do usuário
router.delete('/clear', CartController.clearUserCart); // Rota específica para limpar o carrinho

module.exports = router;