
const User = require('../models/User'); 
const jwt = require('jsonwebtoken'); 

class AuthController {
    static async login(req, res) {
        try {
            const { usernameOrEmail, password } = req.body;

            const user = await User.findByUsernameOrEmail(usernameOrEmail);
            if (!user) {
                return res.status(401).json({ message: 'Credenciais inválidas.' }); 
            }

            const isMatch = await User.comparePassword(password, user.password_hash);
            if (!isMatch) {
                return res.status(401).json({ message: 'Credenciais inválidas.' }); 
            }

            const payload = {
                id: user.id,
                username: user.username,
                email: user.email,
                is_admin: user.is_admin
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

            res.status(200).json({ token });

        } catch (error) {
            console.error('Erro no login:', error);
            res.status(500).json({ message: 'Erro interno do servidor durante o login.' });
        }
    }
}

module.exports = AuthController;