// backend/src/controllers/productController.js
const Product = require('../models/Product');
const Category = require('../models/Category'); // NOVO: Importa o modelo Category para validação

class ProductController {
    // Obter todos os produtos (sem alterações na lógica)
    static async getAllProducts(req, res) {
        try {
            const products = await Product.findAll();
            res.status(200).json(products);
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao buscar produtos.' });
        }
    }

    // Obter um produto por ID (sem alterações na lógica)
    static async getProductById(req, res) {
        try {
            const { id } = req.params;
            const product = await Product.findById(id);
            if (product) {
                res.status(200).json(product);
            } else {
                res.status(404).json({ message: 'Produto não encontrado.' });
            }
        } catch (error) {
            console.error('Erro ao buscar produto por ID:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao buscar produto.' });
        }
    }

    // Criar um novo produto (agora com image_url opcional)
    static async createProduct(req, res) {
        try {
            const { name, description, price, stock_quantity, category_id } = req.body;
            // image_url não vem do body aqui, ele será uploadado separadamente ou em outro endpoint
            
            if (category_id) {
                const categoryExists = await Category.findById(category_id);
                if (!categoryExists) {
                    return res.status(400).json({ message: 'ID da categoria fornecido não existe.' });
                }
            }

            // Nota: image_url não é passado aqui, pois será manipulado por um endpoint de upload separado.
            const newProduct = await Product.create({ name, description, price, stock_quantity, category_id });
            res.status(201).json(newProduct);
        } catch (error) {
            console.error('Erro ao criar produto:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao criar produto.' });
        }
    }

    // Atualizar um produto (image_url opcional na atualização via PUT)
    static async updateProduct(req, res) {
        try {
            const { id } = req.params;
            // Note que image_url NÃO é incluído aqui, pois será manipulado via endpoint de upload
            const { name, description, price, stock_quantity, category_id } = req.body;

            if (category_id !== undefined) {
                if (category_id !== null) { // Permite passar null para remover a categoria
                    const categoryExists = await Category.findById(category_id);
                    if (!categoryExists) {
                        return res.status(400).json({ message: 'ID da categoria fornecido não existe.' });
                    }
                }
            }
            
            // Passamos null para image_url aqui, o upload será um endpoint separado.
            const updatedProduct = await Product.update(id, { name, description, price, stock_quantity, category_id, image_url: null }); 
            if (updatedProduct) {
                res.status(200).json(updatedProduct);
            } else {
                res.status(404).json({ message: 'Produto não encontrado para atualização.' });
            }
        } catch (error) {
            console.error('Erro ao atualizar produto:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao atualizar produto.' });
        }
    }

    // Deletar um produto (sem alterações na lógica do controller, a lógica de exclusão de imagem está no modelo)
    static async deleteProduct(req, res) {
        try {
            const { id } = req.params;
            const deletedProduct = await Product.delete(id);
            if (deletedProduct) {
                res.status(204).send(); // Retorna 204 No Content (sucesso sem corpo de resposta)
            } else {
                res.status(404).json({ message: 'Produto não encontrado para exclusão.' });
            }
        } catch (error) {
            console.error('Erro ao deletar produto:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao deletar produto.' });
        }
    }

    // NOVO: Endpoint para fazer upload de imagem de um produto
    static async uploadProductImage(req, res) {
        try {
            const { id } = req.params; // ID do produto
            
            // req.file é preenchido pelo Multer quando um arquivo é enviado
            if (!req.file) {
                return res.status(400).json({ message: 'Nenhum arquivo de imagem foi enviado.' });
            }

            // O caminho completo do arquivo salvo pelo Multer
            const imageUrl = `/uploads/${req.file.filename}`; // Construímos uma URL acessível publicamente

            const updatedProduct = await Product.updateImage(id, imageUrl); // Chama o novo método no modelo
            if (updatedProduct) {
                res.status(200).json({ 
                    message: 'Imagem do produto atualizada com sucesso!',
                    imageUrl: imageUrl,
                    product: updatedProduct
                });
            } else {
                // Se o produto não for encontrado, a imagem já foi salva no disco, precisa ser deletada
                await fs.unlink(req.file.path); // Deleta o arquivo físico que acabou de ser salvo
                return res.status(404).json({ message: 'Produto não encontrado para associar a imagem.' });
            }

        } catch (error) {
            // Se o erro veio do Multer (ex: tipo de arquivo inválido, tamanho excedido)
            if (error.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'O tamanho do arquivo excede o limite permitido (5MB).' });
            }
            console.error('Erro ao fazer upload de imagem:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao fazer upload de imagem.' });
        }
    }
}

module.exports = ProductController;