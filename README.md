# 💻 Aplicação Web Oberon

Este repositório contém a interface web (front-end e back-end) da plataforma de monitoramento e segurança Oberon, focada em infraestrutura para o setor bancário. A aplicação oferece visualização em tempo real das informações e ferramentas de gestão dos ativos monitorados.

---


## 🌟 Funcionalidades Principais

A aplicação web é uma solução completa para gerenciamento e monitoramento de ativos e usuários:

* **Dashboard em Tempo Real:** Visualização imediata de métricas críticas ($\text{CPU}$, $\text{RAM}$, $\text{Disco}$, $\text{Rede}$) dos ativos, com painéis de visão geral e específicos por máquina (consumindo dados da tabela `Registro`).
* **Gestão de Máquinas (Frotas):** Ferramentas para $\text{CRUD}$ de máquinas, com opções de configuração de limites de alerta (padrão Oberon, da empresa ou específico por máquina, manipulando a tabela `Parametro`).
* **Histórico de Alertas:** Consulta e filtragem de todos os alertas passados e ativos, categorizados por componente, máquina ou descrição (lendo a tabela `Alerta`).
* **Exportação de Relatórios:** Geração de relatórios completos em formato $\text{CSV}$ a partir do histórico de alertas com filtros aplicados.
* **Autenticação Segura:** Login, cadastro de novo usuário e funcionalidade de Recuperação/Redefinição de Senha via e-mail (usando `BcryptJS` e `Nodemailer`).
* **Controle de Acesso (Menu Dinâmico):** O menu de navegação é construído dinamicamente com base nas permissões de cada usuário, assegurando que apenas módulos autorizados sejam exibidos.
* **Gestão de Usuários:** Ferramentas para Gerentes ou Administradores realizarem o $\text{CRUD}$ de colaboradores (`Funcionario`), incluindo pesquisa e paginação.
* **Edição de Empresa:** Área dedicada para que usuários com permissão possam visualizar e atualizar os dados da `Empresa` (Razão Social e $\text{CNPJ}$).
* **Design Responsivo:** A interface se adapta a diferentes tamanhos de tela (desktop, tablet, mobile).

---

## 🛠️ Tecnologias

A aplicação utiliza uma arquitetura $\text{Node.js}$ com $\text{Express}$ no back-end, seguindo o padrão **$\text{MVC}$ (Model-View-Controller)**.

### Back-end (Node.js/Express)

| Tecnologia | Propósito |
| :--- | :--- |
| **Node.js** | Ambiente de execução $\text{JavaScript}$ no lado do servidor. |
| **Express** | Framework para construção de rotas e APIs $\text{RESTful}$. |
| **MySQL2** | Driver para conexão e interação com o banco de dados $\text{MySQL}$. |
| **Dotenv** | Gerenciamento de variáveis de ambiente (`.env` e `.env.dev`). |
| **BcryptJS** | Implementação para hash seguro de senhas durante o cadastro e autenticação. |
| **Nodemailer** | Serviço de envio de e-mail (usado para a função de recuperação de senha). |
| **JSON2CSV** | Biblioteca para conversão de dados $\text{JSON}$ em formato $\text{CSV}$ (para exportação). |
| **CORS** | Configuração de Cross-Origin Resource Sharing. |

### Front-end (Web)

| Tecnologia | Propósito |
| :--- | :--- |
| **HTML / CSS / JavaScript** | Estrutura, estilo e lógica de interação do cliente. |
| **Bootstrap** | Framework $\text{CSS}$ e $\text{JS}$ para design responsivo e componentes de $\text{UI}$. |
| **Chart.js** | Biblioteca utilizada para renderização dos gráficos de monitoramento de performance em tempo real. |
| **SweetAlert2** | Biblioteca para modais e alertas personalizados (usado em exclusão e mensagens de sistema). |

---

## 🏗️ Estrutura de Arquivos

A arquitetura do projeto segue o padrão $\text{MVC}$ com agrupamento lógico por função:

    │
    ├── node_modules/          # Dependências do projeto
    ├── public/                # Arquivos estáticos (Frontend)
    │   ├── assets/            # Imagens, ícones (SVG, PNG), fontes, etc.
    │   ├── component/         # Componentes reutilizáveis (e.g., Menu)
    │   ├── css/               # Folhas de estilo
    │   ├── js/                # Scripts do lado do cliente (lógica, máscaras, gráficos)
    │   └── html/              # Páginas HTML (a 'View' / Interface)
    │       ├── index.html     # Landing Page
    │       ├── login.html     # Tela de login
    │       ├── home.html      # Dashboard principal
    │       └── ... outras páginas (alertas.html, gerenciamentoMaquinas.html, etc.)
    │
    ├── src/                   # Código-fonte (Backend)
    │   ├── controllers/       # Lógica de negócio e manipulação de requisições
    │   ├── database/          # Configuração de conexão com o banco (config.js)
    │   ├── models/            # Lógica de acesso e manipulação de dados (instruções SQL)
    │   ├── routes/            # Definição dos endpoints da API (ex: usuarios.js, maquinas.js)
    │   └── utils/             # Arquivos auxiliares (ex: menuData.js)
    │
    ├── .env                   # Variáveis de ambiente (produção)
    ├── .env.dev               # Variáveis de ambiente (desenvolvimento)
    ├── app.js                 # Arquivo de inicialização do servidor Express
    └── package.json           # Configurações do projeto

    .


---

## ⚙️ Configuração e Instalação

Siga os passos para configurar e executar o projeto localmente:

### Pré-requisitos

* **Node.js:** Versão 18+ recomendada.
* **npm:** Gerenciador de pacotes do $\text{Node.js}$.
* **Banco de Dados:** Uma instância de banco de dados $\text{MySQL}$ compatível (conforme a documentação do $\text{bdOberon}$).

### 1. Instalar Dependências

No diretório raiz do projeto, execute o comando:

```bash
    npm install
```

### 2. Configurar Variáveis de Ambiente


Crie os arquivos .env (para produção) e .env.dev (para desenvolvimento) na raiz do projeto, baseando-se no exemplo fornecido.

Exemplo de .env:

    # Configuração do Banco de Dados
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=senha_do_seu_banco
    DB_DATABASE=bdOberon
    DB_PORT=3306

    # Configuração da Aplicação
    APP_HOST=localhost
    APP_PORT=3333
    AMBIENTE_PROCESSO=desenvolvimento # Altere para 'producao' se for o caso

    # Configuração de E-mail (Nodemailer)
    EMAIL_USER=seu_email_de_envio_smtp@outlook.com
    EMAIL_PASS=sua_senha_ou_app_password
    FRONTEND_URL=http://localhost:3333 # URL base para o link de redefinição de senha

Atenção: A variável AMBIENTE_PROCESSO em app.js define qual arquivo .env será carregado.

### 4. Acessar

Acessar a AplicaçãoApós a execução, acesse a  no seu navegador (assumindo a porta configurada, ex: 

<a src="http://localhost:3333">http://localhost:3333</a>


### 💻 Exemplo de Telas
Aqui você pode visualizar algumas partes da interface da aplicação:

#### Dashboard de Monitoramento Geral
Esta tela mostra os gráficos de performance em tempo real das máquinas cadastradas. 

<div align="center" >
<img src="https://i.imgur.com/4EPJt0I.png"width="230">
<img src="https://i.imgur.com/1k4rILq.png"width="230">
<img src="https://i.imgur.com/x7VUy12.png" width="230">
</div>


#### Gerenciamento e Alertas
Tela utilizada para cadastrar, editar e excluir ativos, incluindo a configuração de alertas. 

<div align="center" >
<img src="https://i.imgur.com/xkihNX0.png"width="230">
<img src="https://i.imgur.com/edMUAfd.png"width="230">
<img src="https://i.imgur.com/vAqKkah.png" width="230">
</div>


#### Tela de Login e Hero da landing Page
A interface de acesso seguro à plataforma. 

<div align="center" >
<img src="https://i.imgur.com/gLfrZ8A.png"width="230">
<img src="https://i.imgur.com/ZFVNQjT.png"width="230">
<img src="https://i.imgur.com/F7PQkM2.png" width="230">
</div>




LicençaEste projeto está sob a Licença .Copyright (c) 2022 BandTec Digital School - agora é São Paulo Tech School