var ambiente_processo = 'producao';

var caminho_env = ambiente_processo === 'desenvolvimento' ? '.env' : '.env.dev';

require('dotenv').config({ path: caminho_env });

var express = require('express');
var cors = require('cors');
var path = require('path');
var PORTA_APP = process.env.APP_PORT;
var HOST_APP = process.env.APP_HOST;

var app = express();

// --- IMPORTAÇÃO DAS ROTAS (agrupadas) ---
var indexRouter = require('./src/routes/index');
var usuarioRouter = require('./src/routes/usuarios');
var empresaRouter = require('./src/routes/empresas');
var edicaoEmpresaRouter = require('./src/routes/edicaoEmpresa');
var edicaoUsuarioRouter = require('./src/routes/edicaoUsuario');
var maquinasRouter = require('./src/routes/maquinas');
var gerenciamentoUsuarioRouter = require('./src/routes/gerenciamentoUsuario');
var authRouter = require('./src/routes/email');
var alertasRouter = require('./src/routes/alertas');
var downloadRoutes = require('./src/routes/appInstalacao');
var painelRoutes = require('./src/routes/painel');
var homeRouter = require('./src/routes/home');
var dashboardParametrosRouter = require('./src/routes/dashboardParametros')

// ROTEADOR ESTRATÉGICO: Contém a rota /risco/:idEmpresa
var dashboardEstrategicaRouter = require("./src/routes/dashboardEstrategicaRoutes"); 

// ROTEADOR GERAL: Mantido para outras páginas de dashboard que não sejam de risco.
var dashboardRouter = require("./src/routes/dashboard"); 


// --- CONFIGURAÇÃO DOS MIDDLEWARES ---
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public', 'html')));
app.use(cors());


// --- REGISTRO DAS ROTAS ---
app.use('/', indexRouter);
app.use('/usuarios', usuarioRouter);
app.use('/gerenciamentoUsuario', gerenciamentoUsuarioRouter);
app.use('/empresas', empresaRouter);
app.use('/edicaoEmpresa', edicaoEmpresaRouter);
app.use('/edicaoUsuario', edicaoUsuarioRouter);
app.use('/maquinas', maquinasRouter);
app.use('/auth', authRouter);
app.use('/alertas', alertasRouter);
app.use('/api/download', downloadRoutes);
app.use('/painel', painelRoutes);
app.use('/api/maquinas', homeRouter);
app.use('/dashboardParametros', dashboardParametrosRouter)

// CORREÇÃO: Mapeia o roteador específico para o prefixo /dashboard.
// O frontend chama /dashboard/risco/6
app.use("/dashboard", dashboardEstrategicaRouter); 

// O roteador geral dashboardRouter (se tiver outras rotas)
// app.use("/dashboardGeral", dashboardRouter); 

app.listen(PORTA_APP, function () {
  console.log(`                                                                            

       ##   ##  ######   #####          ####       ##      ######      ##                 ##  ##      ####      ######  
       ##   ##  ##       ##  ##          ## ##     ####        ##     ####                 ##  ##       ##          ##  
       ##   ##  ##       ##  ##          ##  ##   ##  ##       ##    ##  ##                 ##  ##       ##         ##   
       ## # ##  ####     #####   ######   ##  ##   ######       ##    ######   ######   ##  ##       ##         ##    
       #######  ##       ##  ##          ##  ##   ##  ##       ##    ##  ##           ##  ##       ##        ##     
       ### ###  ##       ##  ##          ## ##    ##  ##       ##    ##  ##            ####         ##       ##      
       ##   ##  ######   #####          ####     ##  ##       ##    ##  ##             ##        ####      ######  
       \n\n\n                                                                                        
    Servidor do site já está rodando! Acesse o caminho a seguir para visualizar .: http://${HOST_APP}:${PORTA_APP} :. \n\n
    Você está rodando sua aplicação em ambiente de .:${process.env.AMBIENTE_PROCESSO}:. \n\n
    \tSe .:desenvolvimento:. você está se conectando ao banco local. \n
    \tSe .:producao:. você está se conectando ao banco remoto. \n\n
    \t\tPara alterar o ambiente, comente ou descomente as linhas 1 ou 2 no arquivo 'app.js'\n\n`);
});