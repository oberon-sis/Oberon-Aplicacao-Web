var database = require("../database/config");

function buscarPorId(idEmpresa) {
    var instrucao = `SELECT * FROM Empresa WHERE idEmpresa = ${idEmpresa}`;
    return database.executar(instrucao);
}

function editar(idEmpresa, razaoSocial, cnpj) {
    var instrucao = `
        UPDATE Empresa 
        SET razaoSocial = '${razaoSocial}', 
            cnpj = '${cnpj}' 
        WHERE idEmpresa = ${idEmpresa};
    `;
    return database.executar(instrucao);
}

function excluir(idEmpresa) {
    var instrucao = `DELETE FROM Empresa WHERE idEmpresa = ${idEmpresa};`;
    return database.executar(instrucao);
}

module.exports = {
    buscarPorId,
    editar,
    excluir
};