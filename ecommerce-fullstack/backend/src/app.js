// backend/src/app.js (trecho atualizado)
const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes'); // NOVO: Importa as rotas de pagamento

const app = express();

// --- NOVO: Middleware para parsear o corpo RAW para webhooks do Stripe ---
// Deve vir ANTES de express.json() para que o webhook possa acessar o corpo bruto.
app.use((req, res, next) => {
    if (req.originalUrl === '/api/payment/webhook') {
        express.raw({ type: 'application/json' })(req, res, next);
    } else {
        express.json()(req, res, next);
    }
});
// --- FIM NOVO ---

app.use(cors()); // CORS deve vir após o middleware de raw body

// Configura o Express para servir arquivos estáticos da pasta 'uploads'
app.use('/uploads', express.static('uploads'));

// Rotas de Autenticação
app.use('/api/auth', authRoutes);

// Montando os Routers para suas respectivas bases de URL
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes); // NOVO: Monta as rotas de pagamento

// Rota de teste simples (pública)
app.get('/', (req, res) => {
    res.send('Bem-vindo à API do E-commerce!');
});

module.exports = app;