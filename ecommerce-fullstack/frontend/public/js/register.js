// frontend/public/js/register.js

document.addEventListener('DOMContentLoaded', () => {
    // Redirecionar se já estiver logado
    if (isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }

    const registerForm = document.getElementById('register-form');
    const registerMessage = document.getElementById('register-message');

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Impede o recarregamento da página

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        registerMessage.textContent = ''; // Limpa mensagens anteriores
        registerMessage.className = 'form-message'; // Limpa classes de sucesso/erro

        if (password !== confirmPassword) {
            registerMessage.textContent = 'As senhas não coincidem!';
            registerMessage.classList.add('error');
            return;
        }

        // Validações básicas de frontend (opcional, o backend já valida)
        if (username.length < 3) {
            registerMessage.textContent = 'Nome de usuário deve ter no mínimo 3 caracteres.';
            registerMessage.classList.add('error');
            return;
        }
        if (password.length < 6) {
            registerMessage.textContent = 'Senha deve ter no mínimo 6 caracteres.';
            registerMessage.classList.add('error');
            return;
        }

        registerMessage.textContent = 'Registrando...';

        try {
            const response = await fetch(`${API_BASE_URL}/users`, { // Rota POST /api/users para registro
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                registerMessage.textContent = 'Conta criada com sucesso! Redirecionando para o login...';
                registerMessage.classList.add('success');
                setTimeout(() => {
                    window.location.href = 'login.html'; // Redireciona para a página de login
                }, 2000);
            } else {
                // Tratar erros específicos do backend (ex: email/username já em uso)
                if (response.status === 409) { // Conflito, geralmente por unicidade
                    registerMessage.textContent = data.message || 'Nome de usuário ou email já em uso.';
                } else if (data.errors && data.errors.length > 0) {
                    // Erros de validação do express-validator
                    registerMessage.textContent = data.errors[0].msg;
                } else {
                    registerMessage.textContent = data.message || 'Erro ao registrar. Tente novamente.';
                }
                registerMessage.classList.add('error');
            }
        } catch (error) {
            console.error('Erro na requisição de registro:', error);
            registerMessage.textContent = 'Erro ao conectar ao servidor. Tente novamente.';
            registerMessage.classList.add('error');
        }
    });
});