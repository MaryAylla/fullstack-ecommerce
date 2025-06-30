// backend/src/models/User.js
const { pool } = require('../config/database');
const bcrypt = require('bcryptjs'); // Importa o bcryptjs

class User {
    // Método estático para buscar todos os usuários
    static async findAll() {
        // NÃO RETORNE password_hash em operações de busca de todos os usuários!
        const result = await pool.query('SELECT id, username, email, is_admin, created_at, updated_at FROM users ORDER BY id ASC');
        return result.rows;
    }

    // Método estático para buscar um usuário por ID
    static async findById(id) {
        // NÃO RETORNE password_hash em operações de busca por ID!
        const result = await pool.query('SELECT id, username, email, is_admin, created_at, updated_at FROM users WHERE id = $1', [id]);
        return result.rows[0];
    }

    // Método estático para buscar um usuário por username ou email (útil para login)
    static async findByUsernameOrEmail(usernameOrEmail) {
        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1 OR email = $1',
            [usernameOrEmail]
        );
        return result.rows[0]; // Retorna todos os campos, incluindo password_hash, pois é para login/autenticação
    }

    // Método estático para criar um novo usuário
    static async create({ username, email, password, is_admin = false }) {
        // Gera o hash da senha antes de armazená-la
        const salt = await bcrypt.genSalt(10); // Gera um "sal" (string aleatória) para o hash
        const password_hash = await bcrypt.hash(password, salt); // Gera o hash da senha

        const result = await pool.query(
            'INSERT INTO users (username, email, password_hash, is_admin) VALUES ($1, $2, $3, $4) RETURNING id, username, email, is_admin, created_at, updated_at',
            [username, email, password_hash, is_admin]
        );
        return result.rows[0]; // Retorna o usuário criado (sem o hash da senha)
    }

    // Método estático para atualizar um usuário existente
    static async update(id, { username, email, password, is_admin }) {
        let updateQuery = `UPDATE users SET updated_at = CURRENT_TIMESTAMP`;
        const queryParams = [id];
        let paramCounter = 1;

        if (username !== undefined) {
            paramCounter++;
            updateQuery += `, username = $${paramCounter}`;
            queryParams.push(username);
        }
        if (email !== undefined) {
            paramCounter++;
            updateQuery += `, email = $${paramCounter}`;
            queryParams.push(email);
        }
        if (password !== undefined) {
            paramCounter++;
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(password, salt);
            updateQuery += `, password_hash = $${paramCounter}`;
            queryParams.push(password_hash);
        }
        if (is_admin !== undefined) {
            paramCounter++;
            updateQuery += `, is_admin = $${paramCounter}`;
            queryParams.push(is_admin);
        }

        updateQuery += ` WHERE id = $1 RETURNING id, username, email, is_admin, created_at, updated_at`;

        const result = await pool.query(updateQuery, queryParams);
        return result.rows[0];
    }

    // Método estático para deletar um usuário
    static async delete(id) {
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id, username, email, is_admin, created_at, updated_at', [id]);
        return result.rows[0];
    }

    // Método para comparar uma senha fornecida com o hash armazenado
    static async comparePassword(password, storedHash) {
        return await bcrypt.compare(password, storedHash);
    }
}

module.exports = User;