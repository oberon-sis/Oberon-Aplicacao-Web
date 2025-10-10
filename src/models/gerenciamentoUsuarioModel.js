var database = require("../database/config");

function autenticar(email, senha) {
  console.log(
    "ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function entrar(): ",
    email,
    senha
  );
  var instrucaoSql = `
        SELECT id, nome, email, fk_empresa as empresaId FROM usuario WHERE email = '${email}' AND senha = '${senha}';
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

// CADASTRO DE USÚARIO

function cadastrar(nome, cpf, email, fkEmpresa, fkTipoUsuario, senha) {
  console.log(
    "ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function cadastrar():",
    nome,
    cpf,
    email,
    fkEmpresa,
    fkTipoUsuario,
    senha
  );

  var instrucaoSql = `
        INSERT INTO Funcionario (nome, cpf, email, fkEmpresa, fkTipoUsuario, senha) VALUES ('${nome}', '${cpf}', '${email}', ${fkEmpresa}, ${fkTipoUsuario},'${senha}');
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

// PEGAR DADOS ISOLADOS DO USÚARIO
// ----------------------------------------------------------------------

function PesquisarUsuario(campo, valor) {
  console.log(`
    ACESSEI O USUARIO MODEL
    >> Função: PesquisarUsuario()
    >> Campo: ${campo}
    >> Valor: ${valor}
  `);

  if (campo !== "nome" && campo !== "email") {
    console.error("Campo inválido! Use 'nome' ou 'email'.");
    return "Campo inválido para pesquisa.";
  }

  var instrucaoSql = `
      SELECT 
            f.idFuncionario AS id, 
            f.nome, 
            f.cpf, 
            f.email, 
            t.tipoUsuario AS funcao
        FROM Funcionario AS f
        JOIN tipoUsuario AS t ON f.fkTipoUsuario = t.idTipoUsuario
      WHERE ${campo} LIKE '${valor}%';
  `;

  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function getFkEmpresa(idFuncionario) {
  console.log(
    "ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function entrar(): ",
    idFuncionario
  );
  var instrucaoSql = `
        SELECT fkEmpresa FROM funcionario WHERE idFuncionario = ${idFuncionario} ;
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function getUsuariobyID(idFuncionario) {
  console.log(
    "ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function entrar(): ",
    idFuncionario
  );
  var instrucaoSql = `
    SELECT
	   funcionario.nome,
	   funcionario.cpf,
       funcionario.email,
       funcionario.senha,
       funcionario.fkTipoUsuario,
       tipoUsuario.tipoUsuario,
       tipoUsuario.permissoes FROM funcionario JOIN tipoUsuario
       on funcionario.fkTipoUsuario = tipoUsuario.idTipoUsuario	
       WHERE idFuncionario = ${idFuncionario} ;    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function getTipoUsuario() {
  console.log(
    "ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function entrar(): "
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

//--------------------------------------------------------------

//MODIFICAR DADOS DO USÚARIO

function ExcluirUsuario(idFuncionario) {
  console.log(
    "ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function entrar(): ",
    idFuncionario
  );
  var instrucaoSql = `
         DELETE FROM funcionario 
         WHERE idfuncionario = ${idFuncionario};
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function salvarEdicao(nome, email, fkTipoUsuario, senha, idFuncionario) {
  console.log(
    "ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function entrar(): ",
    nome,
    email,
    fkTipoUsuario,
    senha,
    idFuncionario
  );
  var instrucaoSql = `
         UPDATE funcionario
          SET nome = '${nome}', email = '${email}', 
          fkTipoUsuario = ${fkTipoUsuario} , senha = '${senha}' 
          WHERE idFuncionario = ${idFuncionario}; 
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

// LISTAGEM USÚARIOS
//----------------------------

function contarTotalUsuarios() {
  console.log(
    "ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function entrar(): "
  );
  var instrucaoSql = `
        SELECT COUNT(idFuncionario) AS totalItems 
        FROM Funcionario;
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function listarFuncionarios(limit, offset) {
  console.log(
    `Executando listarFuncionarios(limit=${limit}, offset=${offset})`
  );

  var instrucao = `
        SELECT 
            f.idFuncionario AS id, 
            f.nome, 
            f.cpf, 
            f.email, 
            t.tipoUsuario AS funcao
        FROM Funcionario AS f
        JOIN tipoUsuario AS t ON f.fkTipoUsuario = t.idTipoUsuario
        ORDER BY f.nome ASC
        LIMIT ${limit} OFFSET ${offset};
    `;

  console.log("SQL executado:\n" + instrucao);
  return database.executar(instrucao);
}

//-----------------------------
module.exports = {
  autenticar,
  cadastrar,
  getFkEmpresa,
  getUsuariobyID,
  getTipoUsuario,
  salvarEdicao,
  ExcluirUsuario,
  listarFuncionarios,
  contarTotalUsuarios,
  PesquisarUsuario,
};
