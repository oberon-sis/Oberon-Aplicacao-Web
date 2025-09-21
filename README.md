# Aplicação Web Oberon

Repositório da **interface web** usada para visualização das informações de monitoramento da **Oberon**.

## 📌 Funcionalidades
- Dashboard em tempo real de métricas e alertas.
- Filtros por maquina, localidade.
- Histórico de alertas com exportação de relatórios.
- Autenticação de usuários e controle de permissões.
- Gestão de usúarios.
- Gestão de cargo.
- Gestão de frotas(maquinas).
- Responsividade par os diferentes tamanhos de tela.

## 🚀 Tecnologias
- JavaScript 
- HTML / CSS
- Node.js
- Express
- SweetAlert
- Chart.js
- Email.js
- BootStrap

## Pré-requisitos

Antes de iniciar, certifique-se de ter instalado:

- Node.js
 (versão 18+ recomendada)

- npm
 (gerenciador de pacotes do Node.js)

- Um banco de dados compatível (ex.: MySQL, PostgreSQL, MongoDB) conforme configuração do projeto

## Estrutura de Arquivos

    Oberon-Web/ 
    │
    ├── node_modules/          # Dependências do projeto
    ├── public/                # Arquivos públicos (front-end)
    │   ├── assets/
    │   │   ├── fonts/
    │   │   ├── icons/
    │   │   └── images/
    │   │   └── marca/         #logotipo
    │   ├── css/
    │   ├── js/
    │   ├── cadastro.html
    │   ├── index.html
    │   ├── login.html
    │   └── home.html
    │
    ├── src/                   # Código-fonte
    │   ├── controllers/       # Lógica de controle
    │   ├── database/          # Configuração do banco de dados
    │   ├── models/            # Modelos do banco de dados
    │   └── routes/            # Rotas da aplicação
    │
    ├── .env                   # Variáveis de ambiente (produção)
    ├── .env.dev               # Variáveis de ambiente (desenvolvimento)
    ├── .env.example           # Exemplo de variáveis de ambiente
    ├── app.js                 # Arquivo principal do servidor
    ├── package.json           # Configurações do projeto e dependências
    ├── package-lock.json
    └── README.md


## Configuração

Instalar dependências:

    npm install

Configurar variáveis de ambiente:

Crie os arquivos .env e .env.dev na raiz do projeto com suas credenciais. Um exemplo de .env.example está disponível.

Exemplo .env:

    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=senha123
    DB_NAME=maquina_monitoramento
    PORT=3000


Rodar o projeto:

    npm start   


Ou, caso tenha script de desenvolvimento (com nodemon):

    npm run dev


Acesse a aplicação no navegador em:

    http://localhost:3000

## 📖 Documentação
Mais detalhes sobre as métricas e requisitos estão na [documentação principal](../) disponivél nas pasta do one drive.

---
