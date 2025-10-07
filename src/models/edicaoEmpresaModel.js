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


// function getDadosEmpresaBd(idFuncionario) {
//   console.log(`
//     ACESSEI O EMPRESA MODEL 
//     \n >> Se aqui der erro de 'Error: connect ECONNREFUSED',
//     \n >> verifique suas credenciais de acesso ao banco
//     \n >> e se o servidor do BD está rodando corretamente.
//     \n\n Parâmetro recebido: ${idFuncionario}
//   `);

//   const instrucaoSql = `
//     SELECT 
//       empresa.razaoSocial, 
//       empresa.cnpj, 
//       funcionario.nome
//     FROM empresa
//     JOIN funcionario ON funcionario.fkEmpresa = empresa.idEmpresa
//     WHERE funcionario.idFuncionario = ${idFuncionario};
//   `;

//   console.log("Executando a instrução SQL:\n" + instrucaoSql);

//   return database.executar(instrucaoSql);
// }





// // function atualizarStatus(fkEmpresa, razaoSocial, cnpj) {
// //   console.log(
// //     "ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function entrar(): ",
// //     fkEmpresa,
// //     razaoSocial,
// //     cnpj,
// //   );    
//   var instrucaoSql = `
//         UPDATE empresa SET 
//         razaoSocial = '${razaoSocial}',
//         cnpj = '${cnpj}'
//         WHERE = ${fkEmpresa}
//          ;
//     `;
//   console.log("Executando a instrução SQL: \n" + instrucaoSql);
//   return database.executar(instrucaoSql);
// }



module.exports = {
    // Exportamos a função com o nome que o controller está chamando
    getDadosEmpresaBd
    // atualizarStatus
};