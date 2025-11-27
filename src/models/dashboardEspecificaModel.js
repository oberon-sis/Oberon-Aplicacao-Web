const database = require('../database/config');

// ======================================================
// FUNÇÕES PARA LISTA DETALHADA (ÚLTIMOS EVENTOS)
// CORRIGIDO: Adicionando aliases para bater com o frontend (hora, componente, nivel, valor)
// ======================================================

function ultimo_eventos_maquina_especifica(idMaquina) {
    console.log('[MODEL] Últimos eventos - Máquina:', idMaquina);

    const instrucaoSql = `
        SELECT
            R.horario AS hora,
            TC.tipoComponente AS componente,
            A.nivel AS nivel,
            CONCAT(R.valor, '%') AS valor
        FROM Alerta A
        JOIN Registro R ON A.fkRegistro = R.idRegistro
        JOIN Componente C ON R.fkComponente = C.idComponente
        JOIN TipoComponente TC ON C.fkTipoComponente = TC.idTipoComponente
        WHERE C.fkMaquina = ${idMaquina}
          AND R.horario >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        ORDER BY R.horario DESC
        LIMIT 5;
    `;

    return database.executar(instrucaoSql, [idMaquina]);
}

// ======================================================
// KPI 1 – Disponibilidade (30 dias)
// ======================================================

function calcular_taxa_disponibilidade(idMaquina) {
    console.log('[MODEL] Disponibilidade 30 dias - Máquina:', idMaquina);

    const instrucaoSql = `
        SELECT
            SUM(TIMESTAMPDIFF(MINUTE, i.dataCriacao, i.dataFim)) AS tempoTotalIndisponibilidadeMinutos,
            (30 * 24 * 60) AS tempoTotalPeriodoMinutos
        FROM Maquina m
        JOIN LogSistema ls ON m.idMaquina = ls.fkMaquina
        JOIN LogDetalheEvento lde ON ls.idLogSistema = lde.fkLogSistema
        LEFT JOIN Incidente i ON lde.idLogDetalheEvento = i.fkLogDetalheEvento
        WHERE m.idMaquina = ${idMaquina}
          AND i.dataCriacao >= DATE_SUB(NOW(), INTERVAL 30 DAY);
    `;

    return database.executar(instrucaoSql, [idMaquina]);
}

// ======================================================
// KPI 2 e KPI 3 → total de alertas e críticos (30 dias)
// ======================================================

function buscar_kpi_alertas_30_dias(idMaquina) {
    console.log('[MODEL] KPIs Alertas 30 dias - Máquina:', idMaquina);

    const instrucaoSql = `
        SELECT
            COUNT(A.idAlerta) AS totalAlertas30dias,
            SUM(CASE WHEN A.nivel = 'CRITICO' THEN 1 ELSE 0 END) AS totalCriticos30dias
        FROM Maquina m
        JOIN Componente c ON m.idMaquina = c.fkMaquina
        JOIN Registro r ON c.idComponente = r.fkComponente
        LEFT JOIN Alerta a ON r.idRegistro = a.fkRegistro
        WHERE m.idMaquina = ${idMaquina}
          AND r.horario >= DATE_SUB(NOW(), INTERVAL 30 DAY);
    `;

    return database.executar(instrucaoSql, [idMaquina]);
}

// ======================================================
//  KPI – Pico de uso + total de alertas 24h
// ======================================================

function buscar_dados_kpi(idMaquina) {
    console.log('[MODEL] KPI Pico 24h - Máquina:', idMaquina);

    const instrucaoSql = `
        SELECT
            TC.tipoComponente AS tipoRecurso,
            COUNT(A.idAlerta) AS totalAlertas24h,
            CONCAT(
                MAX(R.valor), '% - ',
                DATE_FORMAT(
                    SUBSTRING_INDEX(
                        GROUP_CONCAT(R.horario ORDER BY R.valor DESC SEPARATOR ','),
                        ',', 1
                    ),
                    '%H:%i'
                )
            ) AS maiorPicoUso
        FROM vw_ComponentesParaAtualizar AS TC
        LEFT JOIN Registro R 
                ON R.fkComponente = TC.idComponente
             AND R.horario >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        LEFT JOIN Alerta A 
                ON A.fkRegistro = R.idRegistro
        WHERE TC.fkMaquina = ${idMaquina}
        GROUP BY TC.tipoComponente;
    `;

    return database.executar(instrucaoSql, [idMaquina]);
}

// ======================================================
// Header – Info da máquina
// ======================================================

function buscar_info_maquina(idMaquina) {
    console.log('[MODEL] Info Máquina (Header) - Máquina:', idMaquina);

    const instrucaoSql = `
        SELECT nome, modelo, ip, sistemaOperacional
        FROM vw_DadosMaquina
        WHERE idMaquina = ${idMaquina};
    `;

    return database.executar(instrucaoSql, [idMaquina]);
}

// ======================================================
// Detalhes dos componentes
// ======================================================

function buscar_info_componentes(idMaquina) {
    console.log('[MODEL] Info Componentes - Máquina:', idMaquina);

    const instrucaoSql = `
        SELECT tipoComponente, valor
        FROM vw_Informacoes_Componentes
        WHERE fkMaquina = ${idMaquina};
    `;

    return database.executar(instrucaoSql, [idMaquina]);
}

// ======================================================
// Parâmetros para o gráfico
// ======================================================

function buscar_parametros(idMaquina) {
    console.log('[MODEL] Parâmetros - Máquina:', idMaquina);

    const instrucaoSql = `
        SELECT
            CONCAT(TC.tipoComponente, '_', P.identificador) AS nomeParametro,
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

// ======================================================
// Dados agregados – 24h para gráfico
// ======================================================

function buscar_info_24_horas_coleta(idMaquina) {
    console.log('[MODEL] Gráfico 24h - Máquina:', idMaquina);

    const instrucaoSql = `
        SELECT
            AVG(r.valor) AS valor_medio,
            DATE_FORMAT(
                FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(r.horario) / (30 * 60)) * (30 * 60)), 
                '%H:%i'
            ) AS intervaloTempo,
            TC.tipoComponente AS tipoRecurso
        FROM Registro r
        JOIN Componente C ON r.fkComponente = C.idComponente
        JOIN TipoComponente TC ON C.fkTipoComponente = TC.idTipoComponente
        WHERE C.fkMaquina = ${idMaquina}
          AND r.horario >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        GROUP BY intervaloTempo, TC.tipoComponente
        ORDER BY intervaloTempo ASC, TC.tipoComponente ASC;
    `;

    return database.executar(instrucaoSql, [idMaquina]);
}

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
    buscar_info_maquina,
    buscar_info_componentes,
    buscar_dados_kpi,
    buscar_parametros,
    buscar_info_24_horas_coleta,
    ultimo_eventos_maquina_especifica,
    calcular_taxa_disponibilidade,
    buscar_kpi_alertas_30_dias
};