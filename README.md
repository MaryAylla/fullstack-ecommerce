
# 💜 E-commerce Fullstack

Um sistema completo de e-commerce construído com **Node.js + Express.js** no backend e **HTML, CSS puro + JavaScript** no frontend. Este projeto utiliza **PostgreSQL** como banco de dados relacional, emprega **JWT** para autenticação e **bcryptjs** para segurança de senhas. As funcionalidades incluem carrinho de compras, sistema de pedidos com controle de estoque, upload de imagens via **Multer** e integração de pagamento com **Stripe**. A interface frontend é estilizada com um tema em tons de **roxo pastel e lilás**, utilizando fontes personalizadas 💻✨.

Ideal para estudos, prática de desenvolvimento web fullstack, e como base para seu portfólio.

---

## 🔐 Funcionalidades Implementadas

-   **Gerenciamento de Usuários (CRUD)**:
    -   Cadastro de novos usuários com senhas criptografadas usando `bcryptjs`.
    -   Login com geração e validação de tokens JWT.
    -   Gerenciamento (listagem, busca, atualização, exclusão) de usuários protegidos por autenticação e autorização (admin).
-   **Gerenciamento de Produtos (CRUD)**:
    -   Criação, listagem, atualização e exclusão de produtos.
    -   Associação de produtos a categorias.
    -   Upload de imagens de produtos e armazenamento local com `Multer`.
-   **Gerenciamento de Categorias (CRUD)**.
-   **Carrinho de Compras**:
    -   Adicionar produtos ao carrinho.
    -   Visualizar itens no carrinho, atualizar quantidades e remover itens.
    -   Limpar todo o carrinho de um usuário.
-   **Sistema de Pedidos**:
    -   Criação de novos pedidos a partir do carrinho de compras.
    -   Controle de estoque, diminuindo a quantidade de produtos disponíveis após um pedido.
    -   Histórico de pedidos por usuário.
    -   Atualização de status de pedido e pagamento (administrador).
-   **Integração de Pagamento**:
    -   Iniciação de sessões de checkout com a API do **Stripe**.
    -   Manipulação de webhooks do Stripe para confirmação segura de pagamentos e atualização de status de pedidos.
-   **Autenticação e Autorização**:
    -   Rotas protegidas que exigem um JWT válido.
    -   Privilégios de administrador para operações sensíveis.
    -   Logout com remoção de token.
-   **Frontend Interativo**:
    -   Páginas de produtos, login, registro e carrinho.
    -   Estilização com tema em tons de roxo pastel e lilás, proporcionando uma experiência visual agradável.
    -   Uso de fontes personalizadas (`Northseano` para títulos/destaques e `Amelaryas` para o corpo).
-   **Arquitetura**:
    -   Organização do código backend em rotas, controllers, e modelos (seguindo um padrão MVC simples).

---

## 🛠️ Tecnologias Utilizadas

### **Backend**
-   **[Node.js](https://nodejs.org/)**: Ambiente de tempo de execução JavaScript.
-   **[Express.js](https://expressjs.com/)**: Framework web rápido e minimalista para Node.js.
-   **[PostgreSQL](https://www.postgresql.org/)**: Poderoso sistema de banco de dados relacional de código aberto.
-   **[pg](https://node-postgres.com/)**: Cliente não-bloqueador para PostgreSQL para Node.js.
-   **[JWT (jsonwebtoken)](https://jwt.io/)**: Padrão aberto para criação de tokens de acesso seguros.
-   **[bcryptjs](https://www.npmjs.com/package/bcryptjs)**: Biblioteca para criptografar senhas de forma segura.
-   **[Multer](https://www.npmjs.com/package/multer)**: Middleware para Node.js que lida com `multipart/form-data`, usado para upload de arquivos.
-   **[Stripe](https://stripe.com/)**: Plataforma de pagamentos para processar transações financeiras.
-   **[dotenv](https://www.npmjs.com/package/dotenv)**: Carrega variáveis de ambiente de um arquivo `.env`.
-   **[express-validator](https://express-validator.github.io/)**: Middleware para validação e sanitização de dados no Express.js.
-   **[cors](https://www.npmjs.com/package/cors)**: Middleware para habilitar o Cross-Origin Resource Sharing (CORS).

### **Frontend**
-   **HTML5**: Estrutura da aplicação web.
-   **CSS3**: Estilização e design responsivo (com CSS Grid e Flexbox).
-   **JavaScript Puro**: Lógica interativa do lado do cliente.
-   **[http-server](https://www.npmjs.com/package/http-server)**: Um servidor de linha de comando simples para servir arquivos estáticos localmente.
-   **Fontes Locais**: `Northseano` (para títulos) e `Amelaryas` (para corpo).

---

## 🚀 Como executar localmente

Siga os passos abaixo para configurar e rodar o projeto em sua máquina local.

### **Pré-requisitos**

Antes de começar, certifique-se de ter instalado:
-   **Node.js** (versão 18+ recomendada)
-   **npm** (gerenciador de pacotes do Node.js, vem com o Node.js)
-   **PostgreSQL** (servidor de banco de dados rodando)

### **1. Clone o Repositório**

Abra seu terminal ou prompt de comando e execute:
```bash
git clone [https://github.com/MaryAylla/fullstack-ecommerce.git](https://github.com/MaryAylla/fullstack-ecommerce.git)
cd fullstack-ecommerce
````

### **2. Configuração do Backend**

Navegue até a pasta `backend` e instale suas dependências:

```bash
cd backend
npm install
```

### **3. Configuração do Banco de Dados PostgreSQL**

  * Certifique-se de que seu servidor PostgreSQL está ativo.
  * Crie um novo banco de dados para o projeto (ex: `ecommerce_db`). Você pode usar ferramentas como `psql` ou `pgAdmin`.
    ```sql
    CREATE DATABASE ecommerce_db;
    ```
  * Obtenha suas credenciais de acesso ao PostgreSQL (usuário, senha, porta).

### **4. Configuração das Variáveis de Ambiente (.env)**

Na pasta `backend/`, crie um arquivo chamado **`.env`** (atenção ao ponto inicial) e adicione as seguintes variáveis, substituindo pelos seus dados e chaves:

```env
DB_USER=seu_usuario_postgres
DB_HOST=localhost
DB_DATABASE=ecommerce_db
DB_PASSWORD=sua_senha_postgres
DB_PORT=5432 # Ou a porta configurada para seu PostgreSQL
PORT=3001    # Porta em que o servidor Express irá rodar
JWT_SECRET=uma_string_muito_longa_e_secreta_para_assinatura_jwt_troque_isso
STRIPE_SECRET_KEY=sk_test_SUA_CHAVE_SECRETA_DO_STRIPE_DE_TESTE # Obtenha no Dashboard do Stripe (modo teste)
STRIPE_WEBHOOK_SECRET=whsec_SUA_CHAVE_SECRETA_DO_WEBHOOK_DO_STRIPE # Obtenha no Dashboard do Stripe após configurar o webhook
```

*Lembre-se de não compartilhar seu arquivo `.env`.*

### **5. Iniciar o Servidor Backend**

Ainda na pasta `backend/`, execute:

```bash
node src/server.js
```

O servidor iniciará e automaticamente criará todas as tabelas necessárias no seu banco de dados. Você deverá ver mensagens de sucesso no terminal, como "PostgreSQL conectado com sucesso\!".

### **6. Configuração e Execução do Frontend**

Abra uma **nova janela de terminal** e siga estes passos:

Navegue de volta à pasta raiz do projeto e, em seguida, para a pasta `frontend`:

```bash
cd .. # Volta para ecommerce-fullstack
cd frontend
```

Instale o servidor de arquivos estáticos `http-server` globalmente (se ainda não o fez):

```bash
npm install -g http-server
```

Inicie o servidor de arquivos estáticos para o frontend:

```bash
http-server public -p 8080
```

O frontend estará acessível em `http://localhost:8080`.

### **7. Acessando a Aplicação**

Com ambos os servidores rodando (backend na porta `3001` e frontend na porta `8080`), abra seu navegador e acesse:

```
http://localhost:8080/index.html
```

Você pode testar as APIs diretamente usando ferramentas como Postman, Insomnia ou Thunder Client (extensão do VS Code), enviando requisições para `http://localhost:3001/api/...`.

-----
