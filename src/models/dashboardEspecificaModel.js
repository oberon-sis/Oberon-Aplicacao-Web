const database = require('../database/config');

function ultimo_eventos_maquina_especifica(idMaquina) {
  console.log('[MODEL] Últimos eventos - Máquina:', idMaquina);

  const instrucaoSql = `
        SELECT
            R.horario AS hora,
            TC.tipoComponete AS componente,
            A.nivel AS nivel,
            CONCAT(R.valor, '%') AS valor
            FROM Alerta A
            JOIN Registro R ON A.fkRegistro = R.idRegistro
            JOIN Componente C ON R.fkComponente = C.idComponente
            JOIN TipoComponente TC ON C.fkTipoComponente = TC.idTipoComponente
            WHERE C.fkMaquina = ${idMaquina}
            AND R.horario >= DATE_SUB(NOW(), INTERVAL 300 HOUR)
            ORDER BY R.horario DESC
            LIMIT 5;
    `;

  return database.executar(instrucaoSql, [idMaquina]);
}

// KPI 1 – Disponibilidade (30 dias)

function calcular_taxa_disponibilidade(idMaquina) {
  console.log('[MODEL] Disponibilidade 30 dias - Máquina:', idMaquina);

  const instrucaoSql = `
       SELECT
    fkMaquina,
    
    -- Tempo total da última semana (semana atual)
    SEC_TO_TIME(SUM(
        CASE
            WHEN tipoAcesso = 'AgenteJava'
             AND WEEK(horarioInicio, 1) = WEEK(NOW(), 1)
             AND YEAR(horarioInicio) = YEAR(NOW())
            THEN TIMESTAMPDIFF(SECOND, horarioInicio, COALESCE(horarioFinal, NOW()))
            ELSE 0
        END
    )) AS tempoLigadoUltimaSemana,
    
    -- Tempo total da semana passada
    SEC_TO_TIME(SUM(
        CASE
            WHEN tipoAcesso = 'AgenteJava'
             AND WEEK(horarioInicio, 1) = WEEK(NOW(), 1) - 1
             AND YEAR(horarioInicio) = YEAR(NOW())
            THEN TIMESTAMPDIFF(SECOND, horarioInicio, COALESCE(horarioFinal, horarioInicio)) -- se ainda estiver aberta, ignora
            ELSE 0
        END
    )) AS tempoLigadoSemanaPassada

FROM LogSistema
 where fkMaquina = ${idMaquina}
GROUP BY fkMaquina;

    `;

  return database.executar(instrucaoSql, [idMaquina]);
}

// KPI 2 e KPI 3 → total de alertas e críticos (30 dias)

function buscar_kpi_alertas_30_dias(idMaquina) {
  console.log('[MODEL] KPIs Alertas 30 dias - Máquina:', idMaquina);

  const instrucaoSql = `
        SELECT
            COUNT(a.idAlerta) AS totalAlertas30dias,
            SUM(CASE WHEN a.nivel = 'CRITICO' THEN 1 ELSE 0 END) AS totalCriticos30dias
            FROM Maquina m
            JOIN Componente c ON m.idMaquina = c.fkMaquina
            JOIN Registro r ON c.idComponente = r.fkComponente
            LEFT JOIN Alerta a ON r.idRegistro = a.fkRegistro
            WHERE m.idMaquina = ${idMaquina}
            AND r.horario >= DATE_SUB(NOW(), INTERVAL 30 DAY);
    `;

  return database.executar(instrucaoSql, [idMaquina]);
}

function buscar_kpi_componente_critico(idMaquina) {
  console.log('[MODEL] KPIs Alertas 30 dias - Máquina:', idMaquina);

  const instrucaoSql = `
        SELECT 
        c.idComponente,
        tc.tipoComponete AS tipoComponente,
        COUNT(a.idAlerta) AS total_alertas_criticos
        FROM Componente c
        JOIN Registro r 
        ON r.fkComponente = c.idComponente
        JOIN Alerta a 
        ON a.fkRegistro = r.idRegistro
        JOIN TipoComponente tc
        ON c.fkTipoComponente = tc.idTipoComponente
        WHERE c.fkMaquina = ${idMaquina}
        AND a.nivel = 'CRÍTICO'
        GROUP BY c.idComponente, tc.tipoComponete
        ORDER BY total_alertas_criticos DESC
        LIMIT 1;`;

  return database.executar(instrucaoSql, [idMaquina]);
}

function buscar_dados_kpi(idMaquina) {
  console.log('[MODEL] KPI Pico 24h - Máquina:', idMaquina);

  let instrucaoSql = `
    SELECT
        DATE_FORMAT(R.horario, '%d/%m %H:%i') AS Hora,
        TC.tipoComponete AS Componente,
        A.nivel AS Alerta,
        CONCAT(R.valor, '%') AS Valor
        FROM Alerta A
        INNER JOIN Registro R ON A.fkRegistro = R.idRegistro
        INNER JOIN Componente C ON R.fkComponente = C.idComponente
        INNER JOIN TipoComponente TC ON C.fkTipoComponente = TC.idTipoComponente
        WHERE R.horario >= DATE_SUB(NOW(), INTERVAL 300 HOUR )
        AND C.fkMaquina = ${idMaquina}
        ORDER BY R.horario DESC;
    `;
  instrucaoSql = `
    SELECT
        TC.tipoComponete AS tipoRecurso,
        COUNT(A.idAlerta) AS totalAlertas24h
        FROM Componente C
        INNER JOIN TipoComponente TC 
        ON C.fkTipoComponente = TC.idTipoComponente
        LEFT JOIN Registro R 
        ON R.fkComponente = C.idComponente
        AND R.horario >= DATE_SUB(NOW(), INTERVAL 730 HOUR)
        LEFT JOIN Alerta A 
        ON A.fkRegistro = R.idRegistro
        WHERE C.fkMaquina = ${idMaquina}
        GROUP BY TC.tipoComponete
        ORDER BY totalAlertas24h DESC;`;

  return database.executar(instrucaoSql, [idMaquina]);
}

// Header – Info da máquina

function buscar_info_maquina(idMaquina) {
  console.log('[MODEL] Info Máquina (Header) - Máquina:', idMaquina);

  const instrucaoSql = `
        SELECT nome, modelo, ip, sistemaOperacional
        FROM vw_DadosMaquina
        WHERE idMaquina = ${idMaquina};
    `;

  return database.executar(instrucaoSql, [idMaquina]);
}

// Detalhes dos componentes

function buscar_info_componentes(idMaquina) {
  console.log('[MODEL] Info Componentes - Máquina:', idMaquina);

  const instrucaoSql = `
        SELECT tipoComponente, valor
        FROM vw_Informacoes_Componentes
        WHERE fkMaquina = ${idMaquina};
    `;

  return database.executar(instrucaoSql, [idMaquina]);
}

// Parâmetros para o gráfico

function buscar_parametros(idMaquina) {
  console.log('[MODEL] Parâmetros - Máquina:', idMaquina);

  const instrucaoSql = `
        SELECT
            CONCAT(TC.tipoComponete, '_', P.identificador) AS nomeParametro,
            P.limite
            FROM Parametro P
            LEFT JOIN Componente C 
            ON P.fkComponente = C.idComponente 
            AND P.origemParametro = 'ESPECÍFICO'
            JOIN TipoComponente TC 
            ON TC.idTipoComponente =
            (CASE
                WHEN P.origemParametro = 'ESPECÍFICO' THEN C.fkTipoComponente
                ELSE P.fkTipoComponente
                END)
        WHERE C.fkMaquina = ${idMaquina};
    `;

  return database.executar(instrucaoSql, [idMaquina]);
}

// Dados agregados – 24h para gráfico

function buscar_info_24_horas_coleta(idMaquina) {
  console.log('[MODEL] Gráfico 24h - Máquina:', idMaquina);

  const instrucaoSql = `
        SELECT
            AVG(r.valor) AS valor_medio,
            DATE_FORMAT(
            FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(r.horario) / (30 * 60)) * (30 * 60)), 
            '%H:%i'
            ) AS intervaloTempo,
            TC.tipoComponete AS tipoRecurso
            FROM Registro r
            JOIN Componente C ON r.fkComponente = C.idComponente
            JOIN TipoComponente TC ON C.fkTipoComponente = TC.idTipoComponente
            WHERE C.fkMaquina = ${idMaquina}
            AND r.horario >= DATE_SUB(NOW(), INTERVAL 300 HOUR)
            GROUP BY intervaloTempo, TC.tipoComponete
            ORDER BY intervaloTempo ASC, TC.tipoComponete ASC;
    `;

  return database.executar(instrucaoSql, [idMaquina]);
}

// EXPORTS

module.exports = {
  buscar_info_maquina,
  buscar_info_componentes,
  buscar_dados_kpi,
  buscar_parametros,
  buscar_info_24_horas_coleta,
  ultimo_eventos_maquina_especifica,
  calcular_taxa_disponibilidade,
  buscar_kpi_alertas_30_dias,
  buscar_kpi_componente_critico
};
