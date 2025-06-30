// backend/src/controllers/categoryController.js
const Category = require('../models/Category');

class CategoryController {
    static async getAllCategories(req, res) {
        try {
            const categories = await Category.findAll();
            res.status(200).json(categories);
        } catch (error) {
            console.error('Erro ao buscar categorias:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao buscar categorias.' });
        }
    }

    static async getCategoryById(req, res) {
        try {
            const { id } = req.params;
            const category = await Category.findById(id);
            if (category) {
                res.status(200).json(category);
            } else {
                res.status(404).json({ message: 'Categoria não encontrada.' });
            }
        } catch (error) {
            console.error('Erro ao buscar categoria por ID:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao buscar categoria.' });
        }
    }

    static async createCategory(req, res) {
        try {
            const { name, description } = req.body;
            const newCategory = await Category.create({ name, description });
            res.status(201).json(newCategory);
        } catch (error) {
            // Se o erro for de duplicidade (nome da categoria UNIQUE), podemos dar um feedback melhor
            if (error.code === '23505') { // PostgreSQL unique_violation error code
                return res.status(409).json({ message: 'Já existe uma categoria com este nome.' });
            }
            console.error('Erro ao criar categoria:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao criar categoria.' });
        }
    }

    static async updateCategory(req, res) {
        try {
            const { id } = req.params;
            const { name, description } = req.body;
            const updatedCategory = await Category.update(id, { name, description });
            if (updatedCategory) {
                res.status(200).json(updatedCategory);
            } else {
                res.status(404).json({ message: 'Categoria não encontrada para atualização.' });
            }
        } catch (error) {
            if (error.code === '23505') { // PostgreSQL unique_violation error code
                return res.status(409).json({ message: 'Já existe uma categoria com este nome.' });
            }
            console.error('Erro ao atualizar categoria:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao atualizar categoria.' });
        }
    }

    static async deleteCategory(req, res) {
        try {
            const { id } = req.params;
            const deletedCategory = await Category.delete(id);
            if (deletedCategory) {
                res.status(204).send();
            } else {
                res.status(404).json({ message: 'Categoria não encontrada para exclusão.' });
            }
        } catch (error) {
            console.error('Erro ao deletar categoria:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao deletar categoria.' });
        }
    }
}

module.exports = CategoryController;