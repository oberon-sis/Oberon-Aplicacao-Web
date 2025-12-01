var database = require("../database/config");

// KPIs
function buscarKpis(idEmpresa) {
    const query = `
        SELECT
            (SELECT COUNT(*) FROM Incidente i
             JOIN LogDetalheEvento lde ON lde.idLogDetalheEvento = i.fkLogDetalheEvento
             JOIN LogSistema ls ON lde.fkLogSistema = ls.idLogSistema
             JOIN Maquina m ON ls.fkMaquina = m.idMaquina
             WHERE m.fkEmpresa = ${idEmpresa}
               AND i.severidade = 'Critica'
               AND i.dataCriacao >= DATE_SUB(NOW(), INTERVAL 60 DAY)
            ) AS kpi_incidentes_criticos,

            (SELECT COUNT(DISTINCT m.idMaquina)
             FROM Maquina m
             JOIN Componente c ON c.fkMaquina = m.idMaquina
             JOIN TipoComponente tc ON c.fkTipoComponente = tc.idTipoComponente
             JOIN Registro r ON r.fkComponente = c.idComponente
             WHERE m.fkEmpresa = ${idEmpresa}
               AND tc.tipoComponete IN ('CPU','RAM')
               AND r.horario >= DATE_SUB(NOW(), INTERVAL 30 DAY)
               AND r.valor > 85
            ) AS kpi_maquinas_saturacao,

            (SELECT 
                CASE WHEN total = 0 THEN 0 ELSE ROUND(stable / total * 100,2) END
             FROM (
                SELECT 
                    (SELECT COUNT(*) FROM LogSistema ls2 
                     JOIN Maquina m2 ON ls2.fkMaquina = m2.idMaquina
                     WHERE m2.fkEmpresa = ${idEmpresa}
                       AND ls2.horarioInicio >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                    ) AS total,
                    (SELECT COUNT(*) FROM LogSistema ls3 
                     JOIN Maquina m3 ON ls3.fkMaquina = m3.idMaquina
                     WHERE m3.fkEmpresa = ${idEmpresa}
                       AND ls3.horarioInicio >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                       AND ls3.horarioFinal IS NOT NULL
                    ) AS stable
             ) q
            ) AS kpi_comunicacao_estavel,

            (SELECT COUNT(*) FROM LogDetalheEvento lde
             JOIN LogSistema ls ON lde.fkLogSistema = ls.idLogSistema
             JOIN Maquina m ON ls.fkMaquina = m.idMaquina
             WHERE m.fkEmpresa = ${idEmpresa}
               AND lde.horario >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            ) AS kpi_integridade_logs,

            (SELECT ROUND(AVG(cnt),2) FROM (
                SELECT COUNT(*) AS cnt
                FROM Alerta a
                JOIN Registro r ON a.fkRegistro = r.idRegistro
                JOIN Componente c ON r.fkComponente = c.idComponente
                JOIN Maquina m ON c.fkMaquina = m.idMaquina
                WHERE m.fkEmpresa = ${idEmpresa}
                  AND r.horario >= DATE_SUB(NOW(), INTERVAL 60 DAY)
                GROUP BY m.idMaquina
            ) t
            ) AS kpi_score_risco;
    `;
    return database.executar(query);
}

// Tendência
function buscarTendencia(idEmpresa) {
    const query = `
       SELECT 
            DATE_FORMAT(r.horario, '%Y-%m') AS periodo,
            SUM(CASE WHEN a.nivel = 'CRÍTICO' THEN 1 ELSE 0 END) AS critico,
            SUM(CASE WHEN a.nivel = 'ATENÇÃO' THEN 1 ELSE 0 END) AS atencao,
            SUM(CASE WHEN a.nivel = 'OCIOSO' THEN 1 ELSE 0 END) AS ocioso
        FROM Alerta a
        JOIN Registro r ON a.fkRegistro = r.idRegistro
        JOIN Componente c ON r.fkComponente = c.idComponente
        JOIN Maquina m ON c.fkMaquina = m.idMaquina
        WHERE m.fkEmpresa = ${idEmpresa}
        GROUP BY DATE_FORMAT(r.horario, '%Y-%m')
        ORDER BY periodo ASC;
    `;
    return database.executar(query);
}

// Comparativo por Nível
function buscarComparativoPorNivel(idEmpresa) {
    const query = `
        SELECT
            a.nivel AS nivel_alerta,
            SUM(CASE WHEN r.horario >= DATE_SUB(CURDATE(), INTERVAL 60 DAY) THEN 1 ELSE 0 END) AS atual,
            SUM(CASE WHEN r.horario < DATE_SUB(CURDATE(), INTERVAL 60 DAY) 
                     AND r.horario >= DATE_SUB(CURDATE(), INTERVAL 120 DAY) THEN 1 ELSE 0 END) AS passado
        FROM Alerta a
        JOIN Registro r ON a.fkRegistro = r.idRegistro
        JOIN Componente c ON r.fkComponente = c.idComponente
        JOIN Maquina m ON c.fkMaquina = m.idMaquina
        WHERE m.fkEmpresa = ${idEmpresa}
          AND r.horario >= DATE_SUB(CURDATE(), INTERVAL 120 DAY)
        GROUP BY a.nivel;
    `;
    return database.executar(query);
}

// Comparativo de Demanda
function buscarComparativoDemanda(idEmpresa) {
    const query = `
        SELECT 
            tc.tipoComponete AS componente,
            ROUND(AVG(r.valor),2) AS quantidade
        FROM Registro r
        JOIN Componente c ON r.fkComponente = c.idComponente
        JOIN TipoComponente tc ON c.fkTipoComponente = tc.idTipoComponente
        JOIN Maquina m ON c.fkMaquina = m.idMaquina
        WHERE m.fkEmpresa = ${idEmpresa}
          AND r.horario >= DATE_SUB(NOW(), INTERVAL 7 DAY)
          AND tc.tipoComponete IN ('CPU','RAM','DISCO')
        GROUP BY tc.tipoComponete;
    `;
    return database.executar(query);
}

// Comparativo Severidade por Componente
function buscarComparativoSeveridadePorComponente(idEmpresa) {
    const query = `
        SELECT 
            tc.tipoComponete AS componente,
            i.severidade,
            SUM(CASE WHEN i.dataCriacao >= DATE_SUB(CURDATE(), INTERVAL 60 DAY) THEN 1 ELSE 0 END) AS atual,
            SUM(CASE WHEN i.dataCriacao < DATE_SUB(CURDATE(), INTERVAL 60 DAY) 
                     AND i.dataCriacao >= DATE_SUB(CURDATE(), INTERVAL 120 DAY) THEN 1 ELSE 0 END) AS passado
        FROM Incidente i
        JOIN LogDetalheEvento lde ON i.fkLogDetalheEvento = lde.idLogDetalheEvento
        JOIN LogSistema ls ON lde.fkLogSistema = ls.idLogSistema
        JOIN Maquina m ON ls.fkMaquina = m.idMaquina
        JOIN Componente c ON m.idMaquina = c.fkMaquina
        JOIN TipoComponente tc ON c.fkTipoComponente = tc.idTipoComponente
        WHERE m.fkEmpresa = ${idEmpresa}
          AND i.dataCriacao >= DATE_SUB(CURDATE(), INTERVAL 120 DAY)
        GROUP BY tc.tipoComponete, i.severidade;
    `;
    return database.executar(query);
}

// Ranking
function buscarRanking(idEmpresa) {
    const query = `
        SELECT 
            m.nome AS maquina,
            COUNT(a.idAlerta) AS total_alertas,
            ROUND(AVG(CASE WHEN tc.tipoComponete = 'CPU' THEN r.valor END),1) AS cpuMedia,
            ROUND(AVG(CASE WHEN tc.tipoComponete = 'RAM' THEN r.valor END),1) AS ramMedia,
            ROUND(AVG(CASE WHEN tc.tipoComponete = 'DISCO' THEN r.valor END),1) AS discoUso,
            COUNT(DISTINCT i.idIncidente) AS totalIncidentes,
            MAX(i.severidade) AS severidadeMedia,
            m.status
        FROM Maquina m
        LEFT JOIN Componente c ON c.fkMaquina = m.idMaquina
        LEFT JOIN TipoComponente tc ON c.fkTipoComponente = tc.idTipoComponente
        LEFT JOIN Registro r ON r.fkComponente = c.idComponente
        LEFT JOIN Alerta a ON a.fkRegistro = r.idRegistro
        LEFT JOIN Incidente i ON i.fkLogDetalheEvento IN 
        (
            SELECT lde.idLogDetalheEvento FROM LogDetalheEvento lde
                JOIN LogSistema ls ON lde.fkLogSistema = ls.idLogSistema
                WHERE ls.fkMaquina = m.idMaquina
        )
        WHERE m.fkEmpresa = ${idEmpresa}
          AND r.horario >= DATE_SUB(NOW(), INTERVAL 60 DAY)
        GROUP BY m.idMaquina
        ORDER BY total_alertas DESC
        LIMIT 4;
    `;
    return database.executar(query);
}

module.exports = {
    buscarKpis,
    buscarTendencia,
    buscarComparativoPorNivel,
    buscarComparativoDemanda,
    buscarComparativoSeveridadePorComponente,
    buscarRanking
};
