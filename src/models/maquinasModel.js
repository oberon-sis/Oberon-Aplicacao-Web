var database = require("../database/config");

function cadastrarMaquina(nome, cpf, email, fkEmpresa, fkTipoUsuario, senha) {
  console.log(
    "ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function cadastrarMaquina():",
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
    cadastrarMaquina
};
