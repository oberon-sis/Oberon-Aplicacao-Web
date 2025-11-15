var ambiente_processo = 'producao';
// var ambiente_processo = "desenvolvimento";

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
var menuRouter = require('./src/routes/menu');
var usuarioRouter = require('./src/routes/usuarios');
var empresaRouter = require('./src/routes/empresas'); // Corrigido o nome do arquivo para 'empresas'
var edicaoEmpresaRouter = require('./src/routes/edicaoEmpresa');
var edicaoUsuarioRouter = require('./src/routes/edicaoUsuario');
var maquinasRouter = require('./src/routes/maquinas');
var gerenciamentoUsuarioRouter = require('./src/routes/gerenciamentoUsuario');
var empresaRouter = require('./src/routes/empresas');
var authRouter = require('./src/routes/email');
var alertasRouter = require('./src/routes/alertas');
const downloadRoutes = require('./src/routes/appInstalacao');
const painelRoutes = require('./src/routes/painel');

// --- CONFIGURAÇÃO DOS MIDDLEWARES ---
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public', 'html')));
app.use(cors());

// --- REGISTRO DAS ROTAS ---
app.use('/', indexRouter);
app.use('/menu', menuRouter);
app.use('/usuarios', usuarioRouter);
app.use('/gerenciamentoUsuario', gerenciamentoUsuarioRouter);
// CORRIGIDO: O prefixo agora está no plural para corresponder ao front-end
app.use('/empresas', empresaRouter);
app.use('/edicaoEmpresa', edicaoEmpresaRouter);
app.use('/edicaoUsuario', edicaoUsuarioRouter);
app.use('/maquinas', maquinasRouter);
app.use('/auth', authRouter);
app.use('/alertas', alertasRouter);
app.use('/api/download', downloadRoutes);
app.use('/painel', painelRoutes);

app.listen(PORTA_APP, function () {
  console.log(`

      ------------                                                                                          
  #+---------------  ##                                                                                     
  ###+-------------- ##      ########       #########      ##########  #########        ########      ####       ###    
  #####         ----- ##     ############     ###########   ##########  ###########     ############      #####       ###    
  ##### --      ----- ##   ###          ###    ##       ###   ###         ###       ###   ###          ###    ######       ###    
  ##### --      ----- ##   ##              ###   ##      ####   ###         ###       ###  ###              ###  ### ###      ###    
  ##### --      ----- ##  ###              ###   ##########     #########   ##########   ###              ###  ###  ####     ###    
  ##### --      ----- ##   ##              ###   ##       ###   ###         #########    ###              ###  ###   ####    ###    
  ##### --      ----- ##   ###          ###    ##       ###   ###         ###      ###   ###          ###   ###      ######    
  ######++######+--- ##      ###### #####     ###########   #########   ###       ###    ############    ###        #####    
   ##############+- ##         #########       #########    ##########  ###        ###     ########      ###         ####     
     ###########+-----+#                                                                                
       # -----------                                                                                  

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
