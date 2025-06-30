// backend/src/models/Product.js
const { pool } = require('../config/database');
const fs = require('fs/promises'); // Módulo nativo para lidar com sistema de arquivos (deletar imagem)
const path = require('path'); // Módulo nativo para lidar com caminhos

class Product {
    // Método estático para buscar todos os produtos (agora com nome da categoria)
    static async findAll() {
        const result = await pool.query(`
            SELECT 
                p.id, 
                p.name, 
                p.description, 
                p.price, 
                p.stock_quantity, 
                p.created_at, 
                p.updated_at,
                p.category_id,
                c.name AS category_name -- Adiciona o nome da categoria
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            ORDER BY p.id ASC
        `);
        return result.rows;
    }

    // Método estático para buscar um produto por ID (agora com nome da categoria)
    static async findById(id) {
        const result = await pool.query(`
            SELECT 
                p.id, 
                p.name, 
                p.description, 
                p.price, 
                p.stock_quantity, 
                p.created_at, 
                p.updated_at,
                p.category_id,
                c.name AS category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = $1
        `, [id]);
        return result.rows[0];
    }

    static async create({ name, description, price, stock_quantity, category_id, image_url = null }) {
        const result = await pool.query(
            'INSERT INTO products (name, description, price, stock_quantity, category_id, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, description, price, stock_quantity, category_id, image_url]
        );
        return result.rows[0];
    }

    // Método estático para atualizar um produto existente (incluindo image_url)
    static async update(id, { name, description, price, stock_quantity, category_id, image_url }) {
        const result = await pool.query(
            `UPDATE products SET 
                name = $1, 
                description = $2, 
                price = $3, 
                stock_quantity = $4,
                category_id = $5,
                image_url = $6, -- NOVO: Atualiza o image_url
                updated_at = CURRENT_TIMESTAMP
             WHERE id = $7 RETURNING *`,
            [name, description, price, stock_quantity, category_id, image_url, id]
        );
        return result.rows[0];
    }

    // Método estático para deletar um produto e sua imagem associada
    static async delete(id) {
        // Primeiro, obtenha o produto para pegar o caminho da imagem
        const product = await Product.findById(id);
        if (!product) {
            return null; // Produto não encontrado
        }

        // Deleta o registro do banco de dados
        const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
        
        // Se a deleção do DB foi bem-sucedida e há uma imagem associada
        if (result.rows[0] && product.image_url) {
            const imagePath = path.resolve(__dirname, '..', '..', 'uploads', path.basename(product.image_url));
            try {
                await fs.unlink(imagePath); // Deleta o arquivo físico da imagem
                console.log(`Imagem '${imagePath}' deletada com sucesso.`);
            } catch (err) {
                console.error(`Erro ao deletar imagem '${imagePath}':`, err.message);
                // Não precisa retornar erro, pois o produto já foi deletado do DB
            }
        }
        return result.rows[0];
    }

    // NOVO: Método estático para adicionar/atualizar a imagem de um produto
    static async updateImage(id, imageUrl) {
        // Primeiro, obtenha o produto atual para verificar se já existe uma imagem
        const product = await Product.findById(id);
        if (!product) {
            return null; // Produto não encontrado
        }

        // Se o produto já tem uma imagem, deleta a imagem antiga
        if (product.image_url) {
            const oldImagePath = path.resolve(__dirname, '..', '..', 'uploads', path.basename(product.image_url));
            try {
                await fs.unlink(oldImagePath);
                console.log(`Imagem antiga '${oldImagePath}' deletada.`);
            } catch (err) {
                console.error(`Erro ao deletar imagem antiga '${oldImagePath}':`, err.message);
            }
        }

        const result = await pool.query(
            `UPDATE products SET 
                image_url = $1, 
                updated_at = CURRENT_TIMESTAMP
             WHERE id = $2 RETURNING *`,
            [imageUrl, id]
        );
        return result.rows[0];
    }
}

module.exports = Product;