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
                clausulaWhere += `AND C.tipoComponente LIKE ${termoLike} `;
                break;
            case 'descricao':
            default:
                clausulaWhere += `AND A.descricao LIKE ${termoLike} `;
                break;
        }
    }
    if (dataInicio) {
        clausulaWhere += `AND A.horarioInicio >= '${dataInicio}' `;
    }
    if (dataFim) {
        clausulaWhere += `AND A.horarioInicio <= '${dataFim}' `;
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

function verAlertas(fkEmpresa, pagina, tipoFiltro, termoPesquisa, dataInicio, dataFim) {
    const limite = limitePagina;
    const offset = (pagina - 1) * limite;
    const clausulaWhere = construirClausulaWhere(tipoFiltro, termoPesquisa, dataInicio, dataFim);
    
    console.log(`[ALERTA MODEL] Buscando alertas para a empresa ${fkEmpresa} - Termo: ${termoPesquisa}, Data Início: ${dataInicio}, Data Fim: ${dataFim}`);

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
        ${clausulaWhere} 
        ORDER BY A.horarioInicio DESC
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
        JOIN Maquina AS M ON A.fkMaquina = M.idMaquina
        JOIN MaquinaComponente AS MC ON A.fkMaquinaComponente = MC.idMaquinaComponente
        JOIN Componente AS C ON MC.fkComponente = C.idComponente
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
        ${clausulaWhere} 
        ORDER BY A.horarioInicio DESC;
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