// Arquivo: src/models/riscoTendenciaModel.js

const database = require('../database/config'); 

// Constantes de Filtro e Cálculo
const DIAS_BIMESTRE = 60;
const DIAS_MENSAIS = 30;
const DIAS_SEMANA = 7;
const TOTAL_MAQUINAS_MONITORADAS = 30;
const REGISTROS_ESPERADOS = 30 * 3 * 1440 * DIAS_SEMANA; // 30 máquinas * 3 comp * 1440 reg/dia * 7 dias

function getKpisEstrategicos() {
    const consultaKpis = `
    -- ===================================================================================
    -- CTEs Auxiliares (Para Taxas)
    -- ===================================================================================
    WITH UltimoRegistro AS (
        SELECT C.fkMaquina, MAX(R.horario) AS UltimoHorario
        FROM Registro R JOIN Componente C ON R.fkComponente = C.idComponente
        GROUP BY C.fkMaquina
    ),
    UsoRAMAtual AS (
        SELECT C.fkMaquina
        FROM Registro R
        JOIN Componente C ON R.fkComponente = C.idComponente
        JOIN TipoComponente TC ON C.fkTipoComponente = TC.idTipoComponente
        JOIN UltimoRegistro UR ON C.fkMaquina = UR.fkMaquina AND R.horario = UR.UltimoHorario
        WHERE TC.tipoComponete = 'RAM' AND R.valor > 75 
        GROUP BY C.fkMaquina
    ),
    AlertasPorMaquinaDia AS (
        SELECT AVG(T.MaquinasEmAlerta) AS Media
        FROM (
            SELECT 
                DATE(A.horario) AS Dia,
                COUNT(DISTINCT C.fkMaquina) AS MaquinasEmAlerta
            FROM Alerta A
            JOIN Registro R ON A.fkRegistro = R.idRegistro
            JOIN Componente C ON R.fkComponente = C.idComponente
            WHERE A.nivel IN ('ATENÇÃO', 'CRITICO') AND A.horario >= DATE_SUB(NOW(), INTERVAL ${DIAS_BIMESTRE} DAY)
            GROUP BY Dia
        ) AS T
    ),
    TotalIncidentesBimestre AS (
        SELECT COUNT(idIncidente) AS Total
        FROM Incidente WHERE dataCriacao >= DATE_SUB(NOW(), INTERVAL ${DIAS_BIMESTRE} DAY)
    ),
    MediaUsoMensal AS (
        SELECT
            AVG(R.valor) AS Media_Uso,
            CASE WHEN R.horario >= DATE_SUB(NOW(), INTERVAL ${DIAS_MENSAIS} DAY) THEN 'MesAtual' ELSE 'MesAnterior' END AS Periodo
        FROM Registro R
        JOIN Componente C ON R.fkComponente = C.idComponente
        WHERE C.fkTipoComponente IN (1, 2) AND R.horario >= DATE_SUB(NOW(), INTERVAL ${DIAS_BIMESTRE} DAY)
        GROUP BY Periodo
    ),
    MediaDuracaoSessao AS (
        SELECT 
            AVG(TIMESTAMPDIFF(MINUTE, horarioInicio, horarioFinal)) AS Media_Minutos
        FROM LogSistema
        WHERE horarioInicio >= DATE_SUB(NOW(), INTERVAL ${DIAS_BIMESTRE} DAY)
    )
    
    -- ===================================================================================
    -- Seleção Final dos KPIs
    -- ===================================================================================
    SELECT
        -- KPI 1: Média Diária de Máquinas em Alerta
        (SELECT Media FROM AlertasPorMaquinaDia) AS mediaDiariaMaquinasAlerta,

        -- KPI 2: Taxa de Crescimento de Uso
        (SELECT ((MA.Media_Uso - MB.Media_Uso) / NULLIF(MB.Media_Uso, 0)) * 100
        FROM MediaUsoMensal MA, MediaUsoMensal MB
        WHERE MA.Periodo = 'MesAtual' AND MB.Periodo = 'MesAnterior'
        ) AS taxaCrescimentoUso,

        -- KPI 3: % Incidentes Críticos/Altos
        (SELECT (COUNT(idIncidente) / NULLIF(TIB.Total, 0)) * 100
        FROM Incidente
        JOIN TotalIncidentesBimestre TIB
        WHERE severidade IN ('Critica', 'Alta') AND dataCriacao >= DATE_SUB(NOW(), INTERVAL ${DIAS_BIMESTRE} DAY)
        ) AS percIncidentesAltoRisco,
        
        -- KPI 4 (NOVO): Taxa Média de Indisponibilidade de Agentes (Proxy)
        (SELECT (5 - Media_Minutos) / 5 * 100 
         FROM MediaDuracaoSessao) AS taxaMediaIndisponibilidade, 
         -- Assumindo que 5 minutos é a duração ideal de uma sessão de log. Se for menor, a indisponibilidade é alta.

        -- KPI 5: Integridade de Logs (Últimos 7 dias)
        (SELECT (COUNT(idRegistro) / ${REGISTROS_ESPERADOS}) * 100
        FROM Registro
        WHERE horario >= DATE_SUB(NOW(), INTERVAL ${DIAS_SEMANA} DAY)
        ) AS percIntegridadeLogs;
    `;
    return database.executar(consultaKpis);
}

function getGraficosEstrategicos() {
    // G1. Tendência de Risco (Colunas Empilhadas)
    const tendenciaRisco = `
        SELECT
            DATE_FORMAT(A.horario, '%Y-%m') AS Mes,
            A.nivel AS Nivel,
            COUNT(A.idAlerta) AS Contagem
        FROM Alerta A
        WHERE A.nivel IN ('ATENÇÃO', 'CRITICO') 
            AND A.horario >= DATE_SUB(NOW(), INTERVAL ${DIAS_BIMESTRE} DAY)
        GROUP BY Mes, Nivel
        ORDER BY Mes, Nivel;
    `;

    // G2. Comparativo de Demanda de Recursos (Colunas Agrupadas)
    const comparativoDemanda = `
        SELECT
            AVG(CASE WHEN TC.tipoComponete = 'CPU' THEN R.valor END) AS media_cpu,
            AVG(CASE WHEN TC.tipoComponete = 'RAM' THEN R.valor END) AS media_ram,
            CASE
                WHEN R.horario >= DATE_SUB(NOW(), INTERVAL ${DIAS_MENSAIS} DAY) THEN 'MesAtual'
                ELSE 'MesAnterior'
            END AS Periodo
        FROM Registro R
        JOIN Componente C ON R.fkComponente = C.idComponente
        JOIN TipoComponente TC ON C.fkTipoComponente = TC.idTipoComponente
        WHERE TC.tipoComponete IN ('CPU', 'RAM')
            AND R.horario >= DATE_SUB(NOW(), INTERVAL ${DIAS_BIMESTRE} DAY)
        GROUP BY Periodo;
    `;

    // G3 (NOVO): Evolução Semanal da Indisponibilidade
    const evolucaoIndisponibilidade = `
        SELECT
            DATE_FORMAT(horarioInicio, '%Y-%u') AS Semana,
            AVG(TIMESTAMPDIFF(MINUTE, horarioInicio, horarioFinal)) AS Media_Duracao_Min
        FROM LogSistema
        WHERE horarioInicio >= DATE_SUB(NOW(), INTERVAL ${DIAS_BIMESTRE} DAY)
        GROUP BY Semana
        ORDER BY Semana;
    `;

    // G4. Evolução da Integridade da Coleta (Linha - Registros Semanais)
    const integridadeEvolucao = `
        SELECT
            DATE_FORMAT(horario, '%Y-%u') AS Semana,
            COUNT(idRegistro) AS RegistrosColetados
        FROM Registro
        WHERE horario >= DATE_SUB(NOW(), INTERVAL ${DIAS_BIMESTRE} DAY)
        GROUP BY Semana
        ORDER BY Semana;
    `;

    // G5. Ranking de Máquinas por Prioridade de Intervenção (Tabela)
    const rankingPrioridade = `
        SELECT
            M.nome AS Maquina,
            MAX(I.severidade) AS Severidade_Max,
            COUNT(A.idAlerta) AS Alertas_Bimestre
        FROM Maquina M
        LEFT JOIN Componente C ON M.idMaquina = C.fkMaquina
        LEFT JOIN Registro R ON C.idComponente = R.fkComponente
        LEFT JOIN Alerta A ON R.idRegistro = A.fkRegistro
        LEFT JOIN LogDetalheEvento LDE ON LDE.horario = R.horario
        LEFT JOIN Incidente I ON LDE.idLogDetalheEvento = I.fkLogDetalheEvento AND I.dataCriacao >= DATE_SUB(NOW(), INTERVAL ${DIAS_BIMESTRE} DAY)
        WHERE A.horario >= DATE_SUB(NOW(), INTERVAL ${DIAS_BIMESTRE} DAY) OR I.idIncidente IS NOT NULL
        GROUP BY M.nome
        HAVING COUNT(A.idAlerta) > 0 OR MAX(I.severidade) IS NOT NULL
        ORDER BY
            CASE MAX(I.severidade)
                WHEN 'Critica' THEN 1
                WHEN 'Alta' THEN 2
                WHEN 'Média' THEN 3
                ELSE 4
            END,
            Alertas_Bimestre DESC
        LIMIT 5;
    `;

    return Promise.all([
        database.executar(tendenciaRisco),
        database.executar(comparativoDemanda),
        database.executar(evolucaoIndisponibilidade),
        database.executar(integridadeEvolucao),
        database.executar(rankingPrioridade)
    ]);
}

module.exports = {
    getKpisEstrategicos,
    getGraficosEstrategicos
};