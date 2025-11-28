var database = require('../database/config');

function getMediaLatencia(fkMaquina) {
     console.log("Model: getAnaliseRede()");

    var instrucaoSql = `
  SELECT 
    ROUND(AVG(r.valor), 2) AS mediaThroughput
FROM Registro r
JOIN Componente c ON r.fkComponente = c.idComponente
JOIN TipoComponente tc ON c.fkTipoComponente = tc.idTipoComponente
WHERE tc.funcaoMonitorar = 'rede_throughput'
  AND c.fkMaquina =  ${fkMaquina};`;
    console.log('Executando a instrução SQL: \n' + instrucaoSql);
    return database.executar(instrucaoSql);
}

function getSomaAlertas(fkMaquina) {
     console.log("Model: getAnaliseRede()");

    var instrucaoSql = `
    SELECT COUNT(*) AS qtdAlertasRede
FROM Alerta a
JOIN Registro r 
      ON a.fkRegistro = r.idRegistro
JOIN Componente c 
      ON r.fkComponente = c.idComponente
JOIN TipoComponente tc
      ON c.fkTipoComponente = tc.idTipoComponente
WHERE c.fkMaquina = ${fkMaquina}
  AND tc.funcaoMonitorar LIKE 'rede%';
   
    `;
    console.log('Executando a instrução SQL: \n' + instrucaoSql);
    return database.executar(instrucaoSql);
}


function getPerdaPacote(fkMaquina) {
     console.log("Model: getPerdaPacote()");

    var instrucaoSql = `
   SELECT 
    r.valor AS perdaPacotes,
    r.horario AS momento
FROM Registro r
JOIN Componente c ON r.fkComponente = c.idComponente
JOIN TipoComponente tc ON c.fkTipoComponente = tc.idTipoComponente
WHERE tc.funcaoMonitorar = 'rede_perda'
  AND c.fkMaquina = ${fkMaquina}
ORDER BY r.horario DESC
LIMIT 50;
   
    `;
    console.log('Executando a instrução SQL: \n' + instrucaoSql);
    return database.executar(instrucaoSql);
}


function getDisponibilidade(fkMaquina) {
     console.log("Model: getDisponibilidade()");

    var instrucaoSql = `
SELECT 
    ROUND(100 - AVG(r.valor), 2) AS disponibilidadePercent
FROM Registro r
JOIN Componente c 
    ON r.fkComponente = c.idComponente
JOIN TipoComponente tc
    ON c.fkTipoComponente = tc.idTipoComponente
WHERE c.fkMaquina = ${fkMaquina}
  AND tc.funcaoMonitorar = 'rede_perda';
   
    `;
    console.log('Executando a instrução SQL: \n' + instrucaoSql);
    return database.executar(instrucaoSql);
}
function getJitter(fkMaquina) {
    const instrucaoSql = `
SELECT 
    ROUND(AVG(ABS(r.valor - r_prev.prev_valor)), 2) AS jitter_medio_ms
FROM Registro r
JOIN (
    SELECT 
        idRegistro,
        LAG(valor) OVER (ORDER BY horario) AS prev_valor
    FROM Registro
    WHERE fkComponente IN (
        SELECT idComponente 
        FROM Componente 
        WHERE fkMaquina = ${fkMaquina}
        AND fkTipoComponente = (
            SELECT idTipoComponente 
            FROM TipoComponente 
            WHERE funcaoMonitorar = 'rede_throughput'
        )
    )
) r_prev ON r_prev.idRegistro = r.idRegistro
WHERE r_prev.prev_valor IS NOT NULL;

    `;
    console.log('Executando SQL: \n' + instrucaoSql);
    return database.executar(instrucaoSql);
}

function getLatenciaUltimas24h(fkMaquina) {
    const instrucaoSql = `
SELECT 
    r.valor AS throughput,
    r.horario
FROM Registro r
JOIN Componente c 
    ON r.fkComponente = c.idComponente
JOIN TipoComponente tc
    ON c.fkTipoComponente = tc.idTipoComponente
WHERE c.fkMaquina = ${fkMaquina}
  AND tc.funcaoMonitorar = 'rede_throughput'
  AND r.horario >= NOW() - INTERVAL 24 HOUR
ORDER BY r.horario ASC;
    `;
    console.log('Executando SQL: \n' + instrucaoSql);
    return database.executar(instrucaoSql);
}

function getPacotesEnviados(fkMaquina) {
    const sql = `
       SELECT 
            ROUND(AVG(r.valor), 2) AS mediaEnviados
        FROM Registro r
        JOIN Componente c ON r.fkComponente = c.idComponente
        JOIN TipoComponente tc ON c.fkTipoComponente = tc.idTipoComponente
        WHERE tc.funcaoMonitorar = 'rede_enviada'
        AND c.fkMaquina = ${fkMaquina}
        ORDER BY r.horario DESC
        LIMIT 5;
    `;
    return database.executar(sql);
}

function getPacotesRecebidos(fkMaquina) {
    const sql = `
       SELECT 
            ROUND(AVG(r.valor), 2) AS mediaRecebidos
        FROM Registro r
        JOIN Componente c ON r.fkComponente = c.idComponente
        JOIN TipoComponente tc ON c.fkTipoComponente = tc.idTipoComponente
        WHERE tc.funcaoMonitorar = 'rede_recebida'
        AND c.fkMaquina = ${fkMaquina}
        ORDER BY r.horario DESC
        LIMIT 5;
    `;
    return database.executar(sql);
}




module.exports = {
    getMediaLatencia,getSomaAlertas,getPerdaPacote, getDisponibilidade, getLatenciaUltimas24h, getJitter,getPacotesEnviados,getPacotesRecebidos
};
