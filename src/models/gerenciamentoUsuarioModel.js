var database = require("../database/config");

function autenticar(email, senha) {
  console.log(
    "ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function entrar(): ",
    email,
    senha,
  );
  var instrucaoSql = `
        SELECT id, nome, email, fk_empresa as empresaId FROM usuario WHERE email = '${email}' AND senha = '${senha}';
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function getFkEmpresa(idFuncionario) {
  console.log(
    "ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function entrar(): ",
    idFuncionario,
  );
  var instrucaoSql = `
        SELECT fkEmpresa FROM funcionario WHERE idFuncionario = ${idFuncionario} ;
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function getTipoUsuario() {
  console.log(
    "ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function entrar(): ",
  );
  var instrucaoSql = `
         SELECT 
            idTipoUsuario, 
            tipoUsuario AS nomeTipo
        FROM tipoUsuario
        ORDER BY idTipoUsuario; 
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}


function salvarEdicao(nome,cpf,email,fkTipoUsuario,senha,idFuncionario) {
  console.log(
    "ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function entrar(): ",
    nome,
    cpf,
    email,
    fkTipoUsuario,
    senha,
    idFuncionario,
  );
  var instrucaoSql = `
         UPDATE funcionario
          SET nome = '${nome}', cpf = '${cpf}', email = '${email}', 
          fkTipoUsuario = ${fkTipoUsuario} , senha = '${senha}' 
          WHERE idFuncionario = ${idFuncionario}; 
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}


function getUsuariobyID(idFuncionario) {
  console.log(
    "ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function entrar(): ",
    idFuncionario,
  );
  var instrucaoSql = `
    SELECT
	   funcionario.nome,
	   funcionario.cpf,
       funcionario.email,
       funcionario.senha,
       tipoUsuario.tipoUsuario,
       tipoUsuario.permissoes FROM funcionario JOIN tipoUsuario
       on funcionario.fkTipoUsuario = tipoUsuario.idTipoUsuario	
       WHERE idFuncionario = ${idFuncionario} ;    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}


function cadastrar(nome, cpf, email, fkEmpresa, fkTipoUsuario, senha) {
  console.log(
    "ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function cadastrar():",
    nome,
    cpf,
    email,
    fkEmpresa,
    fkTipoUsuario,
    senha,
  );

  var instrucaoSql = `
        INSERT INTO Funcionario (nome, cpf, email, fkEmpresa, fkTipoUsuario, senha) VALUES ('${nome}', '${cpf}', '${email}', ${fkEmpresa}, ${fkTipoUsuario},'${senha}');
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}



module.exports = {
  autenticar,
  cadastrar,
  getFkEmpresa,
  getUsuariobyID,
  getTipoUsuario,
  salvarEdicao,
};
