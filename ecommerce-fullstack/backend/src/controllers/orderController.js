// backend/src/controllers/orderController.js
const Order = require('../models/Order');

class OrderController {
    // Criar um novo pedido a partir do carrinho do usuário autenticado
    static async createOrder(req, res) {
        try {
            const userId = req.user.id; // ID do usuário logado
            const { shipping_address } = req.body;

            if (!shipping_address || shipping_address.trim() === '') {
                return res.status(400).json({ message: 'O endereço de entrega é obrigatório.' });
            }

            const newOrder = await Order.createOrderFromCart(userId, shipping_address);
            res.status(201).json({ message: 'Pedido criado com sucesso!', order: newOrder });
        } catch (error) {
            console.error('Erro ao criar pedido:', error);
            if (error.message.includes('carrinho está vazio') || error.message.includes('Estoque insuficiente')) {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: 'Erro interno do servidor ao criar pedido.' });
        }
    }

    // Obter todos os pedidos do usuário autenticado
    static async getUserOrders(req, res) {
        try {
            const userId = req.user.id;
            const orders = await Order.findByUserId(userId);
            res.status(200).json(orders);
        } catch (error) {
            console.error('Erro ao buscar pedidos do usuário:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao buscar pedidos.' });
        }
    }

    // Obter um pedido específico (usuário comum só vê os seus, admin vê qualquer um)
    static async getOrderById(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const isAdmin = req.user.is_admin;

            let order;
            if (isAdmin) {
                order = await Order.findById(id); // Admin pode ver qualquer pedido
            } else {
                order = await Order.findById(id, userId); // Usuário comum só vê os seus
            }
            
            if (order) {
                res.status(200).json(order);
            } else {
                res.status(404).json({ message: 'Pedido não encontrado ou você não tem permissão para acessá-lo.' });
            }
        } catch (error) {
            console.error('Erro ao buscar pedido por ID:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao buscar pedido.' });
        }
    }

    // Atualizar o status de um pedido (APENAS ADMIN)
    static async updateOrderStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            // Validação de status
            const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
            if (!status || !allowedStatuses.includes(status)) {
                return res.status(400).json({ message: 'Status inválido. Use: pending, processing, shipped, delivered, cancelled.' });
            }

            const updatedOrder = await Order.updateOrderStatus(id, status);
            if (updatedOrder) {
                res.status(200).json(updatedOrder);
            } else {
                res.status(404).json({ message: 'Pedido não encontrado para atualização de status.' });
            }
        } catch (error) {
            console.error('Erro ao atualizar status do pedido:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao atualizar status do pedido.' });
        }
    }

    // Atualizar o status de pagamento de um pedido (APENAS ADMIN)
    static async updatePaymentStatus(req, res) {
        try {
            const { id } = req.params;
            const { payment_status } = req.body;

            // Validação de status de pagamento
            const allowedPaymentStatuses = ['pending', 'paid', 'refunded'];
            if (!payment_status || !allowedPaymentStatuses.includes(payment_status)) {
                return res.status(400).json({ message: 'Status de pagamento inválido. Use: pending, paid, refunded.' });
            }

            const updatedOrder = await Order.updatePaymentStatus(id, payment_status);
            if (updatedOrder) {
                res.status(200).json(updatedOrder);
            } else {
                res.status(404).json({ message: 'Pedido não encontrado para atualização de status de pagamento.' });
            }
        } catch (error) {
            console.error('Erro ao atualizar status de pagamento do pedido:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao atualizar status de pagamento do pedido.' });
        }
    }

    // Deletar um pedido (APENAS ADMIN)
    static async deleteOrder(req, res) {
        try {
            const { id } = req.params;
            const deletedOrder = await Order.delete(id);
            if (deletedOrder) {
                res.status(204).send();
            } else {
                res.status(404).json({ message: 'Pedido não encontrado para exclusão.' });
            }
        } catch (error) {
            console.error('Erro ao deletar pedido:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao deletar pedido.' });
        }
    }
}

module.exports = OrderController;