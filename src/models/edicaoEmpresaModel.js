var database = require("../database/config");

function getDadosEmpresaBd(idFuncionario) {
  console.log(
    "ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function entrar(): ",
    idFuncionario,
  );
  var instrucaoSql = `
    SELECT empresa.razaosocial, empresa.cnpj, funcionario.nome, funcionario.fkTipoUsuario
    from empresa join funcionario
        on funcionario.fkempresa = empresa.idempresa
        where idfuncionario = ${idFuncionario} ;`;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}




// function atualizarEmpresa(fkEmpresa, razaoSocial, cnpj) {
//   var instrucaoSql = `
//     UPDATE empresa
//     SET razaoSocial = '${razaoSocial}', cnpj = '${cnpj}'
//     WHERE idEmpresa = ${fkEmpresa};
//   `;
//   console.log("Atualizando empresa:", instrucaoSql);
//   return database.executar(instrucaoSql);
// }

// function getFkEmpresa(idFuncionario) {
//   var instrucaoSql = `
//     SELECT fkEmpresa FROM funcionario WHERE idFuncionario = ${idFuncionario};
//   `;
//   console.log("Buscando fkEmpresa:", instrucaoSql);
//   return database.executar(instrucaoSql);
// }




  module.exports = {
    //     // Exportamos a função com o nome que o controller está chamando
    getDadosEmpresaBd
    // atualizarEmpresa,
    // getFkEmpresa
  };