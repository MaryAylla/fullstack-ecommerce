// frontend/public/js/cart.js

document.addEventListener('DOMContentLoaded', () => {
    // Redireciona para o login se o usuário não estiver autenticado
    if (!isAuthenticated()) {
        alert('Você precisa estar logado para ver seu carrinho.');
        window.location.href = 'login.html';
        return;
    }

    // --- Mova as declarações para o início do bloco DOMContentLoaded ---
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalItemsSpan = document.getElementById('cart-total-items');
    const cartTotalAmountSpan = document.getElementById('cart-total-amount');
    const cartMessage = document.getElementById('cart-message');
    const clearCartButton = document.getElementById('clear-cart-button');
    const checkoutButton = document.getElementById('checkout-button');
    // --- FIM das declarações movidas ---

    fetchCartItems(); // Agora esta chamada acontecerá DEPOIS que as variáveis foram declaradas

    // Delegação de eventos para botões de quantidade e remoção
    cartItemsContainer.addEventListener('click', async (event) => {
        if (event.target.classList.contains('update-quantity-button')) {
            const cartItemId = event.target.dataset.id;
            const quantityInput = event.target.closest('.cart-item-controls').querySelector('input[type="number"]');
            const newQuantity = parseInt(quantityInput.value);
            await updateCartItem(cartItemId, newQuantity);
        } else if (event.target.classList.contains('remove-button')) {
            const cartItemId = event.target.dataset.id;
            await removeCartItem(cartItemId);
        }
    });

    // Evento para limpar carrinho
    clearCartButton.addEventListener('click', async () => {
        if (confirm('Tem certeza que deseja limpar todo o seu carrinho?')) {
            await clearCart();
        }
    });

    // Evento para finalizar compra (chamará a lógica de pedidos no futuro)
    checkoutButton.addEventListener('click', async () => {
        alert('Funcionalidade de Finalizar Compra será implementada em breve!');
        const shippingAddress = prompt("Por favor, digite seu endereço de entrega:");
        if (shippingAddress) {
            await createOrder(shippingAddress);
        } else {
            alert("Endereço de entrega é obrigatório para finalizar a compra.");
        }
    });


    async function fetchCartItems() {
        // Agora, cartMessage já estará definida quando esta linha for executada
        cartMessage.textContent = 'Carregando carrinho...';
        cartItemsContainer.innerHTML = ''; 

        try {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE_URL}/cart`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    alert('Sessão expirada ou não autorizada. Faça login novamente.');
                    removeAuthToken();
                    window.location.href = 'login.html';
                    return;
                }
                throw new Error(`Erro HTTP! Status: ${response.status}`);
            }

            const cartItems = await response.json();
            
            if (cartItems.length === 0) {
                cartMessage.textContent = 'Seu carrinho está vazio.';
                cartTotalItemsSpan.textContent = '0';
                cartTotalAmountSpan.textContent = 'R$ 0,00';
                checkoutButton.disabled = true;
                clearCartButton.disabled = true;
                return;
            }

            cartMessage.textContent = ''; 
            checkoutButton.disabled = false;
            clearCartButton.disabled = false;

            let totalItems = 0;
            let totalAmount = 0;

            cartItems.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.classList.add('cart-item');
                
                const imageUrl = item.product_image_url 
                    ? `${API_BASE_URL}${item.product_image_url}` 
                    : 'https://via.placeholder.com/80x80?text=Sem+Imagem';

                itemElement.innerHTML = `
                    <img src="${imageUrl}" alt="${item.product_name}">
                    <div class="cart-item-details">
                        <h4>${item.product_name}</h4>
                        <p>Preço unitário: R$ ${parseFloat(item.product_price).toFixed(2).replace('.', ',')}</p>
                        <p>Subtotal: R$ ${(parseFloat(item.product_price) * item.quantity).toFixed(2).replace('.', ',')}</p>
                    </div>
                    <div class="cart-item-controls">
                        <label for="quantity-${item.id}">Qtd:</label>
                        <input type="number" id="quantity-${item.id}" value="${item.quantity}" min="1" data-id="${item.id}">
                        <button class="update-quantity-button" data-id="${item.id}">Atualizar</button>
                        <button class="remove-button" data-id="${item.id}">Remover</button>
                    </div>
                `;
                cartItemsContainer.appendChild(itemElement);

                totalItems += item.quantity;
                totalAmount += parseFloat(item.product_price) * item.quantity;
            });

            cartTotalItemsSpan.textContent = totalItems;
            cartTotalAmountSpan.textContent = `R$ ${totalAmount.toFixed(2).replace('.', ',')}`;

        } catch (error) {
            console.error('Erro ao buscar itens do carrinho:', error);
            cartMessage.textContent = `Erro ao carregar carrinho: ${error.message}`;
            cartMessage.classList.add('error');
            checkoutButton.disabled = true;
            clearCartButton.disabled = true;
        }
    }

    async function updateCartItem(cartItemId, newQuantity) {
        if (newQuantity < 0) {
            alert("A quantidade não pode ser negativa.");
            return;
        }

        try {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE_URL}/cart/${cartItemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ quantity: newQuantity })
            });

            if (!response.ok) {
                 if (response.status === 401 || response.status === 403) {
                    alert('Sessão expirada ou não autorizada. Faça login novamente.');
                    removeAuthToken();
                    window.location.href = 'login.html';
                    return;
                }
                const errorData = await response.json();
                throw new Error(errorData.message || `Erro HTTP! Status: ${response.status}`);
            }

            if (newQuantity === 0) {
                 alert('Item removido do carrinho.');
            } else {
                 alert('Quantidade atualizada com sucesso!');
            }
            fetchCartItems(); 

        } catch (error) {
            console.error('Erro ao atualizar item do carrinho:', error);
            alert(`Erro ao atualizar item: ${error.message}`);
        }
    }

    async function removeCartItem(cartItemId) {
        if (!confirm('Tem certeza que deseja remover este item do carrinho?')) {
            return;
        }

        try {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE_URL}/cart/${cartItemId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                 if (response.status === 401 || response.status === 403) {
                    alert('Sessão expirada ou não autorizada. Faça login novamente.');
                    removeAuthToken();
                    window.location.href = 'login.html';
                    return;
                }
                const errorData = await response.json();
                throw new Error(errorData.message || `Erro HTTP! Status: ${response.status}`);
            }

            alert('Item removido com sucesso!');
            fetchCartItems(); 

        } catch (error) {
            console.error('Erro ao remover item do carrinho:', error);
            alert(`Erro ao remover item: ${error.message}`);
        }
    }

    async function clearCart() {
        try {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE_URL}/cart/clear`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                 if (response.status === 401 || response.status === 403) {
                    alert('Sessão expirada ou não autorizada. Faça login novamente.');
                    removeAuthToken();
                    window.location.href = 'login.html';
                    return;
                }
                const errorData = await response.json();
                throw new Error(errorData.message || `Erro HTTP! Status: ${response.status}`);
            }

            alert('Carrinho limpo com sucesso!');
            fetchCartItems(); 

        } catch (error) {
            console.error('Erro ao limpar carrinho:', error);
            alert(`Erro ao limpar carrinho: ${error.message}`);
        }
    }

    async function createOrder(shippingAddress) {
        try {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ shipping_address: shippingAddress })
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    alert('Sessão expirada ou não autorizada. Faça login novamente.');
                    removeAuthToken();
                    window.location.href = 'login.html';
                    return;
                }
                throw new Error(data.message || `Erro HTTP! Status: ${response.status}`);
            }

            alert('Pedido criado com sucesso! Redirecionando para o pagamento...');
            await initiatePayment(data.order.id);

        } catch (error) {
            console.error('Erro ao criar pedido:', error);
            alert(`Erro ao finalizar compra: ${error.message}`);
        }
    }

    async function initiatePayment(orderId) {
        try {
            const token = getAuthToken();
            const response = await fetch(`${API_BASE_URL}/payment/create-checkout-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ orderId: orderId })
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    alert('Sessão expirada ou não autorizada. Faça login novamente.');
                    removeAuthToken();
                    window.location.href = 'login.html';
                    return;
                }
                throw new Error(data.message || `Erro HTTP! Status: ${response.status}`);
            }

            if (data.checkoutUrl) {
                window.location.href = data.checkoutUrl;
            } else {
                throw new Error('URL de checkout do Stripe não recebida.');
            }

        } catch (error) {
            console.error('Erro ao iniciar pagamento Stripe:', error);
            alert(`Erro ao prosseguir para o pagamento: ${error.message}`);
        }
    }
});