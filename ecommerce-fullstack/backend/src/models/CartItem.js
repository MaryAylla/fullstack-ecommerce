// backend/src/models/CartItem.js
const { pool } = require('../config/database');

class CartItem {
    // Método para buscar todos os itens do carrinho de um usuário, com detalhes do produto
    static async findByUserId(userId) {
        const result = await pool.query(`
            SELECT 
                ci.id,
                ci.product_id,
                p.name AS product_name,
                p.description AS product_description,
                p.price AS product_price,
                p.image_url AS product_image_url,
                ci.quantity,
                ci.created_at,
                ci.updated_at
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.user_id = $1
            ORDER BY ci.created_at ASC
        `, [userId]);
        return result.rows;
    }

    // Método para adicionar um item ao carrinho ou atualizar a quantidade se já existir
    static async addItem(userId, productId, quantity) {
        try {
            const result = await pool.query(
                `INSERT INTO cart_items (user_id, product_id, quantity)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (user_id, product_id) DO UPDATE
                 SET quantity = cart_items.quantity + EXCLUDED.quantity, -- Adiciona à quantidade existente
                     updated_at = CURRENT_TIMESTAMP
                 RETURNING *`,
                [userId, productId, quantity]
            );
            return result.rows[0];
        } catch (error) {
            // Se houver uma falha de FK (produto ou usuário não existe), podemos tratar aqui
            if (error.code === '23503') { // foreign_key_violation
                throw new Error('Produto ou usuário inválido.');
            }
            throw error; // Re-lança outros erros
        }
    }

    // Método para atualizar a quantidade de um item específico no carrinho
    static async updateQuantity(cartItemId, userId, newQuantity) {
        if (newQuantity <= 0) {
            // Se a nova quantidade for 0 ou menos, remove o item
            return await this.removeItem(cartItemId, userId);
        }
        const result = await pool.query(
            `UPDATE cart_items SET 
                quantity = $1, 
                updated_at = CURRENT_TIMESTAMP
             WHERE id = $2 AND user_id = $3
             RETURNING *`,
            [newQuantity, cartItemId, userId]
        );
        return result.rows[0];
    }

    // Método para remover um item do carrinho
    static async removeItem(cartItemId, userId) {
        const result = await pool.query(
            'DELETE FROM cart_items WHERE id = $1 AND user_id = $2 RETURNING *',
            [cartItemId, userId]
        );
        return result.rows[0];
    }

    // Método para limpar o carrinho de um usuário
    static async clearCart(userId) {
        const result = await pool.query(
            'DELETE FROM cart_items WHERE user_id = $1 RETURNING *',
            [userId]
        );
        return result.rows;
    }
}

module.exports = CartItem;