// backend/src/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Obter o token do cabeçalho da requisição
    // O token geralmente vem no formato: "Bearer SEU_TOKEN_AQUI"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token de autenticação não fornecido ou mal formatado.' });
    }

    const token = authHeader.split(' ')[1]; // Extrai apenas o token (parte após "Bearer ")

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Anexar as informações do usuário decodificadas ao objeto de requisição
        // Assim, o controller poderá acessar req.user.id, req.user.is_admin, etc.
        req.user = decoded; 
        
        next(); // Passa para o próximo middleware ou para a função do controller
    } catch (error) {
        console.error('Erro de autenticação:', error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expirado.' });
        }
        return res.status(403).json({ message: 'Token inválido ou acesso negado.' }); // 403 Forbidden
    }
};

const adminMiddleware = (req, res, next) => {
    // Presume que authMiddleware já foi executado e req.user está disponível
    if (!req.user || !req.user.is_admin) {
        return res.status(403).json({ message: 'Acesso negado: Requer privilégios de administrador.' });
    }
    next();
};


module.exports = { authMiddleware, adminMiddleware };