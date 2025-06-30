// backend/src/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');
const { validateCreateOrder, validateOrderId, validateUpdateOrderStatus, validateUpdatePaymentStatus } = require('../middlewares/orderValidation');

// Rotas para usuários autenticados (criar e ver seus próprios pedidos)
router.post('/', authMiddleware, validateCreateOrder, OrderController.createOrder);
router.get('/', authMiddleware, OrderController.getUserOrders);
router.get('/:id', authMiddleware, validateOrderId, OrderController.getOrderById);

// Rotas para administradores (atualizar status, deletar qualquer pedido)
router.put('/:id/status', authMiddleware, adminMiddleware, validateUpdateOrderStatus, OrderController.updateOrderStatus);
router.put('/:id/payment-status', authMiddleware, adminMiddleware, validateUpdatePaymentStatus, OrderController.updatePaymentStatus);
router.delete('/:id', authMiddleware, adminMiddleware, validateOrderId, OrderController.deleteOrder);

module.exports = router;