var database = require("../database/config");

const limitePagina = 15; 

function getFkEmpresa(idFuncionario) {
    console.log("[ALERTA MODEL] Buscando fkEmpresa para o funcionário:", idFuncionario);
    var instrucaoSql = `
        SELECT fkEmpresa FROM Funcionario WHERE idFuncionario = ${idFuncionario};
    `;
    return database.executar(instrucaoSql);
}

function verAlertas(fkEmpresa, pagina) {
    const limite = limitePagina;
    const offset = (pagina - 1) * limite;
    console.log(`[ALERTA MODEL] Buscando alertas para a empresa ${fkEmpresa} - Página: ${pagina}, Offset: ${offset}`);

    var instrucaoSql = `
        SELECT 
            A.idAlerta,
            A.descricao,
            A.nivel,
            DATE_FORMAT(A.horarioInicio, '%Y-%m-%d %H:%i:%s') AS horarioInicio,
            DATE_FORMAT(A.horarioFinal, '%Y-%m-%d %H:%i:%s') AS horarioFinal,
            M.nome AS nomeMaquina,
            C.tipoComponente,
            C.funcaoMonitorar,
            TIMESTAMPDIFF(SECOND, A.horarioInicio, COALESCE(A.horarioFinal, NOW())) AS duracaoSegundos
        FROM Alerta AS A
        JOIN Maquina AS M ON A.fkMaquina = M.idMaquina
        JOIN MaquinaComponente AS MC ON A.fkMaquinaComponente = MC.idMaquinaComponente
        JOIN Componente AS C ON MC.fkComponente = C.idComponente
        WHERE M.fkEmpresa = ${fkEmpresa}
        ORDER BY A.horarioInicio DESC
        LIMIT ${limite} OFFSET ${offset};
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function contarTotalAlertas(fkEmpresa) {
    console.log(`[ALERTA MODEL] Contando total de alertas para a empresa ${fkEmpresa}`);

    var instrucaoSql = `
        SELECT 
            COUNT(A.idAlerta) AS totalAlertas
        FROM Alerta AS A
        JOIN Maquina AS M ON A.fkMaquina = M.idMaquina
        WHERE M.fkEmpresa = ${fkEmpresa};
    `;
    
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    getFkEmpresa,
    verAlertas,
    contarTotalAlertas,
    limitePagina
};