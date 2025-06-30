// frontend/public/js/auth.js

const AUTH_TOKEN_KEY = 'jwtToken'; // Chave para armazenar o token no localStorage
const API_BASE_URL = 'http://localhost:3001/api'; // Sua URL base da API

// Função para obter o token JWT do localStorage
function getAuthToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
}

// Função para armazenar o token JWT no localStorage
function setAuthToken(token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
}

// Função para remover o token JWT do localStorage (logout)
function removeAuthToken() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
}

// Função para verificar se o usuário está logado
function isAuthenticated() {
    const token = getAuthToken();
    if (!token) return false;

    // Opcional: Decodificar o token para verificar se expirou ou é inválido
    // Para uma verificação mais robusta, uma chamada ao backend seria ideal,
    // mas para simplicidade no frontend, podemos confiar na expiração do token JWT.
    try {
        const payload = JSON.parse(atob(token.split('.')[1])); // Decodifica o payload do JWT
        if (payload.exp * 1000 < Date.now()) { // Verifica se o token expirou (exp é em segundos, Date.now() em ms)
            removeAuthToken(); // Remove token expirado
            return false;
        }
        return true;
    } catch (e) {
        console.error("Erro ao decodificar token:", e);
        removeAuthToken(); // Remove token inválido/corrompido
        return false;
    }
}

// Função para obter os dados do usuário do token (após isAuthenticated ser true)
function getUserDataFromToken() {
    const token = getAuthToken();
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload; // Retorna o payload decodificado
        } catch (e) {
            console.error("Erro ao decodificar payload do token:", e);
            return null;
        }
    }
    return null;
}


// --- Lógica para atualizar a navegação (header) com base no status de login ---
document.addEventListener('DOMContentLoaded', () => {
    const navAuthLinks = document.getElementById('nav-auth-links');
    if (navAuthLinks) {
        updateNavLinks(navAuthLinks);
    }
});

// frontend/public/js/auth.js (trecho da função updateNavLinks)

function updateNavLinks(navAuthLinksElement) {
    if (isAuthenticated()) {
        const userData = getUserDataFromToken();
        // Apenas ajustando a injeção HTML para a nova estrutura
        navAuthLinksElement.innerHTML = `
            <div class="nav-auth-info">
                <span>Olá, ${userData.username}!</span>
                <a href="#" id="logout-link" class="btn btn-signup">Sair</a> </div>
        `;
        document.getElementById('logout-link').addEventListener('click', (event) => {
            event.preventDefault();
            removeAuthToken();
            window.location.href = 'index.html';
        });
    } else {
        // Apenas ajustando a injeção HTML para a nova estrutura de botões
        navAuthLinksElement.innerHTML = `
            <a href="login.html" class="btn btn-login">Login</a>
            <a href="register.html" class="btn btn-signup">Sign-up</a>
        `;
    }
}

// Exportar funções para que outros scripts possam usá-las
window.getAuthToken = getAuthToken;
window.setAuthToken = setAuthToken;
window.removeAuthToken = removeAuthToken;
window.isAuthenticated = isAuthenticated;
window.getUserDataFromToken = getUserDataFromToken;
window.updateNavLinks = updateNavLinks; // Exportar a função para atualizar a navegação