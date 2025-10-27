var database = require('../database/config');
function getMenu(idUsuario) {
  console.log(
    "ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function getMenu(): ",
    idUsuario,
  );
  var instrucaoSql = `
        SELECT tu.tipoUsuario, tu.permissoes
          FROM Funcionario AS u JOIN TipoUsuario AS tu ON u.fkTipoUsuario =
           tu.idTipoUsuario WHERE u.idFuncionario = '${idUsuario}';
    `;
  console.log('Executando a instrução SQL: \n' + instrucaoSql);
  return database.executar(instrucaoSql);
}
module.exports = {
  getMenu,
};
