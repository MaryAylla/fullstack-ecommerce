// backend/src/models/Order.js
const { pool } = require('../config/database');
const CartItem = require('./CartItem'); // Para buscar itens do carrinho
const Product = require('./Product');   // Para atualizar estoque

class Order {
    // Método para criar um novo pedido a partir do carrinho de um usuário
    static async createOrderFromCart(userId, shippingAddress) {
        const client = await pool.connect(); // Inicia uma transação
        try {
            await client.query('BEGIN'); // Inicia a transação

            // 1. Obter os itens do carrinho do usuário
            const cartItems = await CartItem.findByUserId(userId);

            if (cartItems.length === 0) {
                throw new Error('O carrinho está vazio. Não é possível criar um pedido.');
            }

            let totalAmount = 0;
            const orderItemsData = [];

            // 2. Verificar estoque e calcular total
            for (const item of cartItems) {
                const product = await Product.findById(item.product_id);
                if (!product || product.stock_quantity < item.quantity) {
                    throw new Error(`Estoque insuficiente para o produto: ${item.product_name}. Disponível: ${product ? product.stock_quantity : 0}, Solicitado: ${item.quantity}`);
                }
                totalAmount += parseFloat(item.product_price) * item.quantity;
                orderItemsData.push({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price_at_purchase: item.product_price // Preço atual do produto
                });
            }

            // 3. Criar o pedido na tabela 'orders'
            const orderResult = await client.query(
                `INSERT INTO orders (user_id, total_amount, shipping_address)
                 VALUES ($1, $2, $3) RETURNING *`,
                [userId, totalAmount, shippingAddress]
            );
            const newOrder = orderResult.rows[0];

            // 4. Inserir os itens do pedido na tabela 'order_items' e atualizar o estoque
            for (const itemData of orderItemsData) {
                await client.query(
                    `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
                     VALUES ($1, $2, $3, $4)`,
                    [newOrder.id, itemData.product_id, itemData.quantity, itemData.price_at_purchase]
                );
                // Atualizar o estoque do produto
                await client.query(
                    `UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2`,
                    [itemData.quantity, itemData.product_id]
                );
            }

            // 5. Limpar o carrinho do usuário
            await CartItem.clearCart(userId);

            await client.query('COMMIT'); // Confirma a transação
            return newOrder;

        } catch (error) {
            await client.query('ROLLBACK'); // Reverte a transação em caso de erro
            throw error;
        } finally {
            client.release(); // Libera o cliente para o pool
        }
    }

    // Método para buscar todos os pedidos de um usuário
    static async findByUserId(userId) {
        const result = await pool.query(`
            SELECT * FROM orders WHERE user_id = $1 ORDER BY order_date DESC
        `, [userId]);
        return result.rows;
    }

    // Método para buscar um pedido específico por ID (com seus itens)
    static async findById(orderId, userId = null) { // userId opcional para admin
        let query = `
            SELECT 
                o.id AS order_id,
                o.user_id,
                o.order_date,
                o.total_amount,
                o.status,
                o.shipping_address,
                o.payment_status,
                oi.id AS order_item_id,
                oi.product_id,
                p.name AS product_name,
                p.description AS product_description,
                p.price AS product_current_price, -- Preço atual do produto (pode ser diferente do price_at_purchase)
                p.image_url AS product_image_url,
                oi.quantity,
                oi.price_at_purchase -- Preço do produto no momento da compra
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            JOIN products p ON oi.product_id = p.id
            WHERE o.id = $1
        `;
        const params = [orderId];

        if (userId) { // Se userId for fornecido (usuário comum), filtra também por user_id
            query += ` AND o.user_id = $2`;
            params.push(userId);
        }
        query += ` ORDER BY oi.id ASC`;

        const result = await pool.query(query, params);

        if (result.rows.length === 0) {
            return null;
        }

        // Reestrutura os dados para um formato mais útil (pedido com array de itens)
        const order = {
            id: result.rows[0].order_id,
            user_id: result.rows[0].user_id,
            order_date: result.rows[0].order_date,
            total_amount: result.rows[0].total_amount,
            status: result.rows[0].status,
            shipping_address: result.rows[0].shipping_address,
            payment_status: result.rows[0].payment_status,
            items: []
        };

        result.rows.forEach(row => {
            order.items.push({
                order_item_id: row.order_item_id,
                product_id: row.product_id,
                product_name: row.product_name,
                product_description: row.product_description,
                product_current_price: row.product_current_price,
                product_image_url: row.product_image_url,
                quantity: row.quantity,
                price_at_purchase: row.price_at_purchase
            });
        });

        return order;
    }

    // Método para atualizar o status de um pedido
    static async updateOrderStatus(orderId, newStatus) {
        const result = await pool.query(
            `UPDATE orders SET 
                status = $1, 
                updated_at = CURRENT_TIMESTAMP
             WHERE id = $2 RETURNING *`,
            [newStatus, orderId]
        );
        return result.rows[0];
    }

    // Método para atualizar o status de pagamento de um pedido
    static async updatePaymentStatus(orderId, newPaymentStatus) {
        const result = await pool.query(
            `UPDATE orders SET 
                payment_status = $1, 
                updated_at = CURRENT_TIMESTAMP
             WHERE id = $2 RETURNING *`,
            [newPaymentStatus, orderId]
        );
        return result.rows[0];
    }

    // Método para deletar um pedido (apenas para fins administrativos ou de teste, geralmente não se deleta pedidos)
    static async delete(orderId) {
        const result = await pool.query('DELETE FROM orders WHERE id = $1 RETURNING *', [orderId]);
        return result.rows[0];
    }
}

module.exports = Order;