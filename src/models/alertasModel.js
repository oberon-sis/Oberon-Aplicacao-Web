var database = require("../database/config");

const limitePagina = 15; 

// Função auxiliar para construir a cláusula WHERE de pesquisa E data
function construirClausulaWhere(tipoFiltro, termoPesquisa, dataInicio, dataFim) {
    let clausulaWhere = '';
    
    // 1. Filtro por Pesquisa de Texto
    if (termoPesquisa) {
        // Sanitize o termo de pesquisa (substitui ' por '')
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
    
    // 2. Filtro por Data Inicial (horarioInicio)
    if (dataInicio) {
        // O valor do input date vem como 'YYYY-MM-DD'
        clausulaWhere += `AND A.horarioInicio >= '${dataInicio}' `;
    }

    // 3. Filtro por Data Final (horarioInicio)
    if (dataFim) {
        // O controller já adiciona ' 23:59:59' em dataFim para pegar o dia inteiro
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

// Atualizado para incluir filtros de texto e data
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

// Atualizado para incluir filtros de texto e data
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

// NOVA FUNÇÃO: Obter todos os alertas para exportação (sem LIMIT/OFFSET)
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
    obterTodosAlertasParaExportacao, // Exporta a nova função
    limitePagina
};