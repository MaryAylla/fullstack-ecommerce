// backend/src/controllers/paymentController.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Inicializa o Stripe com sua chave secreta
const Order = require('../models/Order');
const Product = require('../models/Product'); // Para pegar detalhes do produto para o Stripe

class PaymentController {
    // Endpoint para criar uma sessão de checkout do Stripe
    static async createCheckoutSession(req, res) {
        try {
            const userId = req.user.id; // Usuário logado
            const { orderId } = req.body; // ID do pedido que queremos pagar

            // 1. Obter os detalhes do pedido
            const order = await Order.findById(orderId, userId); // Pega o pedido e seus itens
            if (!order || order.payment_status !== 'pending') {
                return res.status(404).json({ message: 'Pedido não encontrado ou já pago.' });
            }

            // 2. Preparar os itens para o Stripe
            const lineItems = await Promise.all(order.items.map(async (item) => {
                const product = await Product.findById(item.product_id); // Pega o produto para ter o nome/descrição mais recentes
                return {
                    price_data: {
                        currency: 'brl', // Moeda (pode ser 'usd', 'eur' etc.)
                        product_data: {
                            name: item.product_name,
                            description: item.product_description, // Usar a descrição do item do pedido
                            images: product.image_url ? [`${req.protocol}://${req.get('host')}${product.image_url}`] : [], // URL completa da imagem
                        },
                        unit_amount: Math.round(parseFloat(item.price_at_purchase) * 100), // Preço em centavos
                    },
                    quantity: item.quantity,
                };
            }));

            // 3. Criar a sessão de checkout no Stripe
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: lineItems,
                mode: 'payment',
                success_url: `${req.protocol}://${req.get('host')}/success?session_id={CHECKOUT_SESSION_ID}`, // URL de sucesso (para o frontend)
                cancel_url: `${req.protocol}://${req.get('host')}/cancel`, // URL de cancelamento (para o frontend)
                client_reference_id: String(order.id), // ID do pedido para identificar no webhook
                metadata: {
                    order_id: String(order.id),
                    user_id: String(userId)
                }
            });

            // 4. Retornar a URL da sessão de checkout
            res.status(200).json({ sessionId: session.id, checkoutUrl: session.url });

        } catch (error) {
            console.error('Erro ao criar sessão de checkout:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao iniciar pagamento.' });
        }
    }

    // Endpoint para receber webhooks do Stripe (confirmação de pagamento)
    static async handleWebhook(req, res) {
        const sig = req.headers['stripe-signature'];
        let event;

        try {
            event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
        } catch (err) {
            console.error(`Erro de verificação do Webhook Stripe: ${err.message}`);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        // Lidar com os tipos de eventos
        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object;
                const orderId = session.metadata.order_id; // Recupera o ID do pedido
                
                // Atualiza o status do pedido no seu DB para 'paid'
                if (orderId) {
                    await Order.updatePaymentStatus(parseInt(orderId), 'paid');
                    console.log(`Pedido ${orderId} atualizado para 'paid' via webhook.`);
                }
                break;
            // Outros tipos de eventos que você pode querer lidar:
            // case 'payment_intent.succeeded':
            // case 'payment_intent.payment_failed':
            default:
                console.log(`Tipo de evento Stripe não tratado: ${event.type}`);
        }

        // Retornar um 200 OK para o Stripe
        res.status(200).json({ received: true });
    }
}

module.exports = PaymentController;