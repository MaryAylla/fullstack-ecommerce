// frontend/public/js/login.js

document.addEventListener('DOMContentLoaded', () => {
    // REMOVA: const API_BASE_URL = 'http://localhost:3001/api'; // Esta linha DEVE SER REMOVIDA

    // Redirecionar se já estiver logado
    if (isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }

    const loginForm = document.getElementById('login-form');
    const loginMessage = document.getElementById('login-message');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Impede o recarregamento da página

        const usernameOrEmail = document.getElementById('usernameOrEmail').value;
        const password = document.getElementById('password').value;

        loginMessage.textContent = 'Autenticando...';
        loginMessage.className = 'form-message'; // Limpa classes de sucesso/erro

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, { // Usa a API_BASE_URL global
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ usernameOrEmail, password })
            });

            const data = await response.json();

            if (response.ok) {
                setAuthToken(data.token); // Armazena o token
                loginMessage.textContent = 'Login bem-sucedido! Redirecionando...';
                loginMessage.classList.add('success');
                // Atualiza os links de navegação para mostrar o nome do usuário
                const navAuthLinks = document.getElementById('nav-auth-links');
                if (navAuthLinks) {
                    updateNavLinks(navAuthLinks);
                }
                setTimeout(() => {
                    window.location.href = 'index.html'; // Redireciona para a página inicial
                }, 1500); // Dá um tempo para a mensagem aparecer
            } else {
                loginMessage.textContent = data.message || 'Erro no login. Verifique suas credenciais.';
                loginMessage.classList.add('error');
            }
        } catch (error) {
            console.error('Erro na requisição de login:', error);
            loginMessage.textContent = 'Erro ao conectar ao servidor. Tente novamente.';
            loginMessage.classList.add('error');
        }
    });
});