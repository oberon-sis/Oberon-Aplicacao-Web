// IMPORTANTE: Este arquivo assume que você tem um 'database/config.js' com a função 'executar'.
var database = require("../database/config"); 

/**
 * Busca o total de alertas críticos e o total de máquinas da empresa.
 * @param {number} idEmpresa - ID da empresa.
 */
function buscarTotalAlertas(idEmpresa) {
    const instrucaoSql = `
        SELECT 
            (SELECT COUNT(idMaquina) FROM Maquina WHERE fkEmpresa = ${idEmpresa}) as totalMaquinas,
            (SELECT COUNT(a.idAlerta) 
             FROM Alerta a
             JOIN Registro r ON a.fkRegistro = r.idRegistro
             JOIN Componente c ON r.fkComponente = c.idComponente
             JOIN Maquina m ON c.fkMaquina = m.idMaquina
             WHERE m.fkEmpresa = ${idEmpresa}
             AND a.nivel = 'CRITICO'
             -- BUSCA DADOS DOS ÚLTIMOS 3 MESES
             AND r.horario >= DATE_SUB(NOW(), INTERVAL 3 MONTH)) as totalAlertas;
    `;
    return database.executar(instrucaoSql);
}

/**
 * Busca a evolução diária dos alertas críticos por tipo de componente (para o Gráfico de Tendência).
 * @param {number} idEmpresa - ID da empresa.
 */
function buscarEvolucaoAlertas(idEmpresa) {
    const instrucaoSql = `
        SELECT 
            DATE_FORMAT(r.horario, '%d/%m') as dia,
            tc.tipoComponete,
            COUNT(a.idAlerta) as qtd_alertas
        FROM Alerta a
        JOIN Registro r ON a.fkRegistro = r.idRegistro
        JOIN Componente c ON r.fkComponente = c.idComponente
        JOIN TipoComponente tc ON c.fkTipoComponente = tc.idTipoComponente
        JOIN Maquina m ON c.fkMaquina = m.idMaquina
        WHERE m.fkEmpresa = ${idEmpresa}
        AND a.nivel = 'CRITICO'
        -- BUSCA DADOS DOS ÚLTIMOS 3 MESES
        AND r.horario >= DATE_SUB(NOW(), INTERVAL 3 MONTH) 
        GROUP BY dia, tc.tipoComponete
        ORDER BY MIN(r.horario);
    `;
    return database.executar(instrucaoSql);
}

/**
 * Busca o ranking de máquinas com mais alertas (para a Tabela de Prioridade).
 * @param {number} idEmpresa - ID da empresa.
 */
function buscarRankingPrioridade(idEmpresa) {
    const instrucaoSql = `
        SELECT 
            m.nome as nomeMaquina,
            COUNT(a.idAlerta) as qtd_alertas
        FROM Alerta a
        JOIN Registro r ON a.fkRegistro = r.idRegistro
        JOIN Componente c ON r.fkComponente = c.idComponente
        JOIN Maquina m ON c.fkMaquina = m.idMaquina
        WHERE m.fkEmpresa = ${idEmpresa}
        AND a.nivel = 'CRITICO'
        -- BUSCA DADOS DOS ÚLTIMOS 3 MESES
        AND r.horario >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
        GROUP BY m.idMaquina, m.nome
        ORDER BY qtd_alertas DESC;
    `;
    return database.executar(instrucaoSql);
}

module.exports = {
    buscarTotalAlertas,
    buscarEvolucaoAlertas,
    buscarRankingPrioridade
};