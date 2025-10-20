var database = require("../database/config");

/**
 * Verifica no banco de dados se uma Razão Social OU um CNPJ já está em uso.
 * @param {string} razaoSocial - A Razão Social a ser verificada.
 * @param {string} cnpj - O CNPJ a ser verificado.
 * @returns Promessa com o resultado da busca.
 */
function verificarDuplicidade(razaoSocial, cnpj) {
    console.log("[MODEL] Fui chamado para verificar duplicidade:", razaoSocial, cnpj);
    
    // Query que usa OR para checar se um dos dois campos já existe em algum registro
    // E seleciona as colunas que o controller precisa para a lógica.
    var instrucaoSql = `
        SELECT razaoSocial, cnpj FROM Empresa WHERE razaoSocial = '${razaoSocial}' OR cnpj = '${cnpj}';
    `;

    console.log("[MODEL] Executando a instrução SQL: \n" + instrucaoSql);
    // Retorna a execução da query, que o controller irá processar
    return database.executar(instrucaoSql);
}


module.exports = {
    // Exportamos a função com o nome que o controller está chamando
    verificarDuplicidade
    
};