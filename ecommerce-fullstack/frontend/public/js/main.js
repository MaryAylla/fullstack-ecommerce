document.addEventListener('DOMContentLoaded', () => {
    // Certifica-se de que a API_BASE_URL de auth.js está disponível
    if (typeof API_BASE_URL === 'undefined') {
        console.error("API_BASE_URL não definida. Verifique a ordem dos scripts no HTML.");
        return;
    }
    fetchProducts();

    // Adiciona event listener para os botões "Adicionar ao Carrinho"
    const productsListSection = document.getElementById('products-list');
    productsListSection.addEventListener('click', async (event) => {
        if (event.target.tagName === 'BUTTON' && event.target.dataset.productId) {
            const productId = event.target.dataset.productId;
            await addProductToCart(productId, 1); // Adiciona 1 unidade por padrão
        }
    });
});
async function fetchProducts() {
    const productsListSection = document.getElementById('products-list');
    productsListSection.innerHTML = '<p>Carregando produtos...</p>'; // Mensagem de carregamento

    try {
        const response = await fetch(`${API_BASE_URL}/products`); // Usa a API_BASE_URL global
        if (!response.ok) {
            throw new Error(`Erro HTTP! Status: ${response.status}`);
        }
        const products = await response.json();

        productsListSection.innerHTML = ''; // Limpa a mensagem de carregamento

        if (products.length === 0) {
            productsListSection.innerHTML = '<p>Nenhum produto encontrado.</p>';
            return;
        }

        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');

            // Define a URL da imagem. Se não houver, usa um placeholder.
            const imageUrl = product.image_url 
                ? `${API_BASE_URL}${product.image_url}` 
                : 'https://via.placeholder.com/200x200?text=Sem+Imagem';

            productCard.innerHTML = `
                <img src="${imageUrl}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>${product.description || 'Sem descrição.'}</p>
                <p class="price">R$ ${parseFloat(product.price).toFixed(2).replace('.', ',')}</p>
                <button data-product-id="${product.id}">Adicionar ao Carrinho</button>
            `;
            productsListSection.appendChild(productCard);
        });

    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        productsListSection.innerHTML = `<p>Erro ao carregar produtos: ${error.message}</p>`;
    }
}
async function addProductToCart(productId, quantity) {
    if (!isAuthenticated()) {
        alert('Você precisa estar logado para adicionar produtos ao carrinho.');
        window.location.href = 'login.html';
        return;
    }

    try {
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/cart`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ product_id: parseInt(productId), quantity: quantity })
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

        alert('Produto adicionado ao carrinho com sucesso!');
        // Opcional: Atualizar um contador de carrinho no cabeçalho
        // Ou redirecionar para o carrinho: window.location.href = 'cart.html';

    } catch (error) {
        console.error('Erro ao adicionar produto ao carrinho:', error);
        alert(`Erro ao adicionar produto ao carrinho: ${error.message}`);
    }
}

// ... (Opcional: Lógica para botão "Adicionar ao Carrinho" se você a tiver) ...