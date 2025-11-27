var ambiente_processo = 'producao';

var caminho_env = ambiente_processo === 'producao' ? '.env' : '.env.dev';

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


const dashboardEspecificaRouter = require('./src/routes/dashboardEspecifica'); 

const analiseGeralRoutes = require('./src/routes/analise-tendencia');
var downloadRoutes = require('./src/routes/appInstalacao');
var painelRoutes = require('./src/routes/painel');
var homeRouter = require('./src/routes/home');
var dashboardParametrosRouter = require('./src/routes/dashboardParametros')
var dashboardEstrategicaRouter = require("./src/routes/dashboardEstrategica"); 
var logAuditoriaRouter = require('./src/routes/logAuditoria');

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

app.use('/dashboardEspecifica', dashboardEspecificaRouter);
app.use('/painel', painelRoutes);
app.use('/api/desempenho', analiseGeralRoutes);
app.use('/api/maquinas', homeRouter);
app.use('/dashboardParametros', dashboardParametrosRouter);
app.use("/dashboardEstrategica", dashboardEstrategicaRouter); 
app.use("/logAuditoria", logAuditoriaRouter);

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