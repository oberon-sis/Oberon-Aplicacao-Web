var database = require("../database/config");

function getDadosEmpresaBd(idFuncionario) {
  console.log(
    "ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function entrar(): ",
    idFuncionario,
  );
  var instrucaoSql = `
    select empresa.razaoSocial,funcionario.nome, funcionario.email, funcionario.fkTipoUsuario, funcionario.cpf
        from  empresa join funcionario 
        on funcionario.fkEmpresa = empresa.idEmpresa
        where idFuncionario = ${idFuncionario};`;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

module.exports = {
    
    getDadosEmpresaBd

};