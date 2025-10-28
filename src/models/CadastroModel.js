var database = require('../database/config');

function autenticar(email, senha) {
  console.log(
    "ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function entrar(): ",
    email,
    senha,
  );
  var instrucaoSql = `
        SELECT idFuncionario, nome, cpf, email, fkTipoUsuario as cargo, fkEmpresa as Empresa FROM Funcionario WHERE email = '${email}' AND senha = '${senha}';
    `;
  console.log('Executando a instrução SQL: \n' + instrucaoSql);
  return database.executar(instrucaoSql);
}
/**
 * Cadastra a empresa e depois o funcionário, vinculando os dois.
 * @param {object} empresa - Contém { razaoSocial, cnpj }
 * @param {object} usuario - Contém { nome, cpf, email, senha }
 */
function cadastrarEmpresaEFuncionario(empresa, usuario) {
  console.log('ACESSEI O MODEL para cadastrar EMPRESA e FUNCIONÁRIO:', empresa, usuario);
  var instrucaoSqlEmpresa = `
        INSERT INTO Empresa (razaoSocial, cnpj) VALUES ('${empresa.razaoSocial}', '${empresa.cnpj}');
    `;
  console.log('Executando SQL para Empresa: \n' + instrucaoSqlEmpresa);

  return database.executar(instrucaoSqlEmpresa).then((resultadoEmpresa) => {
    const idNovaEmpresa = resultadoEmpresa.insertId;
    console.log('ID da nova empresa:', idNovaEmpresa);
    if (!idNovaEmpresa) {
      throw new Error('Falha ao obter o ID da nova empresa. Cadastro cancelado.');
    }
    var instrucaoSqlFuncionario = `
            INSERT INTO Funcionario (nome, cpf, email, senha, fkTipoUsuario, fkEmpresa) 
            VALUES ('${usuario.nome}', '${usuario.cpf}', '${usuario.email}', '${usuario.senha}',1000,${idNovaEmpresa});
        `;
    console.log('Executando SQL para Funcionário: \n' + instrucaoSqlFuncionario);
    return database.executar(instrucaoSqlFuncionario);
  });
}
function verificarDuplicidade(razaoSocial, cnpj) {
  var instrucaoSql = `SELECT razaoSocial, cnpj from Empresa WHERE razaoSocial = '${razaoSocial}' OR cnpj = '${cnpj}';`;
  return database.executar(instrucaoSql);
}
function buscarPorEmail(email) {
  console.log('ACESSEI O USUARIO MODEL para buscar por email:', email);

  // ATENÇÃO: A query usa o nome da sua tabela, que é 'funcionario'
  // Seleciona TUDO do funcionário (incluindo a senha criptografada)
  var instrucaoSql = `
        SELECT * FROM Funcionario WHERE email = '${email}';
    `;
  console.log('Executando a instrução SQL: \n' + instrucaoSql);
  return database.executar(instrucaoSql);
}

// Não se esqueça de adicionar a nova função ao module.exports
module.exports = {
  autenticar,
  cadastrar: cadastrarEmpresaEFuncionario,
  verificarDuplicidade,
  buscarPorEmail,
};
