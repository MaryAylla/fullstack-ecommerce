// backend/src/controllers/userController.js
const User = require('../models/User'); // Importa o modelo User

class UserController {
    // Obter todos os usuários
    static async getAllUsers(req, res) {
        try {
            const users = await User.findAll();
            res.status(200).json(users);
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao buscar usuários.' });
        }
    }

    // Obter um usuário por ID
    static async getUserById(req, res) {
        try {
            const { id } = req.params;
            const user = await User.findById(id);
            if (user) {
                res.status(200).json(user);
            } else {
                res.status(404).json({ message: 'Usuário não encontrado.' });
            }
        } catch (error) {
            console.error('Erro ao buscar usuário por ID:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao buscar usuário.' });
        }
    }

    // Criar um novo usuário (REGISTRO)
    static async createUser(req, res) {
        try {
            const { username, email, password, is_admin } = req.body; // is_admin é opcional e false por padrão

            // A validação de unicidade de username/email já ocorre no DB (UNIQUE constraint),
            // mas podemos adicionar uma verificação prévia para dar um feedback mais amigável.
            // Para este momento, o erro do DB será capturado.

            const newUser = await User.create({ username, email, password, is_admin });
            res.status(201).json(newUser); // Retorna o usuário criado (sem hash da senha)
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            // Tratamento de erro para username ou email duplicado (unique_violation)
            if (error.code === '23505') { // PostgreSQL unique_violation error code
                return res.status(409).json({ message: 'Nome de usuário ou email já em uso.' });
            }
            res.status(500).json({ message: 'Erro interno do servidor ao criar usuário.' });
        }
    }

    // Atualizar um usuário
    static async updateUser(req, res) {
        try {
            const { id } = req.params;
            const { username, email, password, is_admin } = req.body;
            
            const updatedUser = await User.update(id, { username, email, password, is_admin });
            if (updatedUser) {
                res.status(200).json(updatedUser);
            } else {
                res.status(404).json({ message: 'Usuário não encontrado para atualização.' });
            }
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            if (error.code === '23505') { // PostgreSQL unique_violation error code
                return res.status(409).json({ message: 'Nome de usuário ou email já em uso.' });
            }
            res.status(500).json({ message: 'Erro interno do servidor ao atualizar usuário.' });
        }
    }

    // Deletar um usuário
    static async deleteUser(req, res) {
        try {
            const { id } = req.params;
            const deletedUser = await User.delete(id);
            if (deletedUser) {
                res.status(204).send();
            } else {
                res.status(404).json({ message: 'Usuário não encontrado para exclusão.' });
            }
        } catch (error) {
            console.error('Erro ao deletar usuário:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao deletar usuário.' });
        }
    }
}

module.exports = UserController;