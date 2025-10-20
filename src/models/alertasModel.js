var database = require("../database/config");

const limitePagina = 15; 

function construirClausulaWhere(tipoFiltro, termoPesquisa, dataInicio, dataFim) {
    let clausulaWhere = '';
    if (termoPesquisa) {
        const termoSql = termoPesquisa.replace(/'/g, "''");
        const termoLike = `'%${termoSql}%'`;

        switch (tipoFiltro) {
            case 'maquina':
                clausulaWhere += `AND M.nome LIKE ${termoLike} `;
                break;
            case 'componente':
                clausulaWhere += `AND TC.tipoComponete LIKE ${termoLike} `;
                break;
            case 'descricao':
            default:
                clausulaWhere += `AND A.descricao LIKE ${termoLike} `;
                break;
        }
    }
    if (dataInicio) {
        clausulaWhere += `AND R.horario >= '${dataInicio}' `;
    }
    if (dataFim) {
        clausulaWhere += `AND R.horario <= '${dataFim}' `;
    }

    return clausulaWhere;
}

function getFkEmpresa(idFuncionario) {
    console.log("[ALERTA MODEL] Buscando fkEmpresa para o funcionário:", idFuncionario);
    var instrucaoSql = `
        SELECT fkEmpresa FROM Funcionario WHERE idFuncionario = ${idFuncionario};
    `;
    return database.executar(instrucaoSql);
}

const selectAlertasBase = `
    SELECT 
        A.idAlerta,
        A.descricao,
        A.nivel,
        R.horario AS horarioInicio,
        NULL AS horarioFinal, -- O novo esquema não tem horárioFinal diretamente no Alerta/Registro
        M.nome AS nomeMaquina,
        TC.tipoComponete AS tipoComponente,
        TC.funcaoMonitorar,
        TIMESTAMPDIFF(SECOND, R.horario, NOW()) AS duracaoSegundos
    FROM Alerta AS A
    JOIN Registro AS R ON A.fkRegistro = R.idRegistro
    JOIN Componente AS C ON R.fkComponente = C.idComponente
    JOIN Maquina AS M ON C.fkMaquina = M.idMaquina
    JOIN Parametro AS P ON A.fkParametro = P.idParametro
    JOIN TipoComponente AS TC ON P.fkTipoComponente = TC.idTipoComponente
`;

function verAlertas(fkEmpresa, pagina, tipoFiltro, termoPesquisa, dataInicio, dataFim) {
    const limite = limitePagina;
    const offset = (pagina - 1) * limite;
    const clausulaWhere = construirClausulaWhere(tipoFiltro, termoPesquisa, dataInicio, dataFim);
    
    console.log(`[ALERTA MODEL] Buscando alertas para a empresa ${fkEmpresa} - Termo: ${termoPesquisa}, Data Início: ${dataInicio}, Data Fim: ${dataFim}`);

    var instrucaoSql = `
        ${selectAlertasBase}
        WHERE M.fkEmpresa = ${fkEmpresa}
        ${clausulaWhere} 
        ORDER BY R.horario DESC
        LIMIT ${limite} OFFSET ${offset};
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function contarTotalAlertas(fkEmpresa, tipoFiltro, termoPesquisa, dataInicio, dataFim) {
    const clausulaWhere = construirClausulaWhere(tipoFiltro, termoPesquisa, dataInicio, dataFim);
    
    console.log(`[ALERTA MODEL] Contando total de alertas para a empresa ${fkEmpresa} com filtro`);

    var instrucaoSql = `
        SELECT 
            COUNT(A.idAlerta) AS totalAlertas
        FROM Alerta AS A
        JOIN Registro AS R ON A.fkRegistro = R.idRegistro
        JOIN Componente AS C ON R.fkComponente = C.idComponente
        JOIN Maquina AS M ON C.fkMaquina = M.idMaquina
        JOIN Parametro AS P ON A.fkParametro = P.idParametro
        JOIN TipoComponente AS TC ON P.fkTipoComponente = TC.idTipoComponente
        WHERE M.fkEmpresa = ${fkEmpresa}
        ${clausulaWhere};
    `;
    
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function obterTodosAlertasParaExportacao(fkEmpresa, tipoFiltro, termoPesquisa, dataInicio, dataFim) {
    const clausulaWhere = construirClausulaWhere(tipoFiltro, termoPesquisa, dataInicio, dataFim);
    
    console.log(`[ALERTA MODEL] Obtendo TODOS os alertas para exportação (sem paginação) para a empresa ${fkEmpresa}`);

    var instrucaoSql = `
        ${selectAlertasBase}
        WHERE M.fkEmpresa = ${fkEmpresa}
        ${clausulaWhere} 
        ORDER BY R.horario DESC;
    `;

    console.log("Executando a instrução SQL de EXPORTAÇÃO: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}


module.exports = {
    getFkEmpresa,
    verAlertas,
    contarTotalAlertas,
    obterTodosAlertasParaExportacao,
    limitePagina
};