// backend/src/server.js
require('dotenv').config(); // Garante que as variáveis de ambiente sejam carregadas
const app = require('./app'); // Importa a aplicação Express
const { connectDB } = require('./config/database'); // Importa a função de conexão com o DB

const PORT = process.env.PORT || 3000; // Pega a porta do .env ou usa 3000 como padrão

// Conecta ao banco de dados e depois inicia o servidor
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
        console.log(`Acesse: http://localhost:${PORT}`);
        console.log(`Rotas de produtos: http://localhost:${PORT}/api/products`);
    });
}).catch(error => {
    console.error('Falha ao iniciar o servidor:', error);
    process.exit(1); // Sai da aplicação se não conseguir conectar ao DB ou iniciar o servidor
});