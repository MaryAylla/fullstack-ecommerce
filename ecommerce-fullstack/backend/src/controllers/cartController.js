// backend/src/controllers/cartController.js
const CartItem = require('../models/CartItem');
const Product = require('../models/Product'); // Para verificar se o produto existe

class CartController {
    // Obter todos os itens do carrinho do usuário autenticado
    static async getUserCart(req, res) {
        try {
            const userId = req.user.id; // ID do usuário logado (vem do JWT)
            const cartItems = await CartItem.findByUserId(userId);
            res.status(200).json(cartItems);
        } catch (error) {
            console.error('Erro ao buscar carrinho do usuário:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao buscar carrinho.' });
        }
    }

    // Adicionar um produto ao carrinho ou atualizar sua quantidade
    static async addItemToCart(req, res) {
        try {
            const userId = req.user.id;
            const { product_id, quantity } = req.body;

            // Validação: Verificar se o produto_id e quantity são válidos
            if (!product_id || !quantity || quantity <= 0) {
                return res.status(400).json({ message: 'product_id e quantity (maior que 0) são obrigatórios.' });
            }

            // Validação: Verificar se o produto existe antes de adicionar ao carrinho
            const productExists = await Product.findById(product_id);
            if (!productExists) {
                return res.status(404).json({ message: 'Produto não encontrado.' });
            }

            const item = await CartItem.addItem(userId, product_id, quantity);
            res.status(201).json(item);
        } catch (error) {
            console.error('Erro ao adicionar item ao carrinho:', error);
            if (error.message === 'Produto ou usuário inválido.') {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: 'Erro interno do servidor ao adicionar item ao carrinho.' });
        }
    }

    // Atualizar a quantidade de um item no carrinho
    static async updateCartItemQuantity(req, res) {
        try {
            const userId = req.user.id;
            const { id } = req.params; // ID do item do carrinho
            const { quantity } = req.body;

            if (quantity === undefined || quantity < 0) {
                return res.status(400).json({ message: 'A quantidade é obrigatória e não pode ser negativa.' });
            }

            const updatedItem = await CartItem.updateQuantity(id, userId, quantity);
            if (updatedItem) {
                if (updatedItem.quantity === 0) { 
                    return res.status(204).send();
                }
                res.status(200).json(updatedItem);
            } else {
                res.status(404).json({ message: 'Item do carrinho não encontrado para este usuário.' });
            }
        } catch (error) {
            console.error('Erro ao atualizar item do carrinho:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao atualizar item do carrinho.' });
        }
    }

    static async removeCartItem(req, res) {
        try {
            const userId = req.user.id;
            const { id } = req.params; 

            const removedItem = await CartItem.removeItem(id, userId);
            if (removedItem) {
                res.status(204).send();
            } else {
                res.status(404).json({ message: 'Item do carrinho não encontrado para este usuário.' });
            }
        } catch (error) {
            console.error('Erro ao remover item do carrinho:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao remover item do carrinho.' });
        }
    }

    static async clearUserCart(req, res) {
        try {
            const userId = req.user.id;
            await CartItem.clearCart(userId);
            res.status(204).send(); 
        } catch (error) {
            console.error('Erro ao limpar carrinho do usuário:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao limpar carrinho.' });
        }
    }
}

module.exports = CartController;