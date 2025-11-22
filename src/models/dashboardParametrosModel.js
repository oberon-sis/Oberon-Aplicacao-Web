var database = require('../database/config');

function getDadosBrutos(idEmpresa, tipoComponente) {
  var instrucaoSql = `
        SELECT 
            R.valor
        FROM 
            Registro R
        JOIN 
            vw_Componentes_Por_Empresa CPE ON R.fkComponente = CPE.idComponente
        WHERE 
            CPE.fkEmpresa = ${idEmpresa}
            AND CPE.tipoComponente = '${tipoComponente}'
            AND R.horario >= DATE_SUB(NOW(), INTERVAL 30 DAY) -- Últimos 30 dias
        ORDER BY 
            R.valor ASC;
    `;
  return database.executar(instrucaoSql);
}

function getKpisAgregados(idEmpresa, tipoComponente) {
  var instrucaoSql = `
        SELECT
            CAST(COALESCE(AVG(R.valor), 0) AS DECIMAL(10, 2)) AS media,
            CAST(COALESCE(STDDEV(R.valor), 0) AS DECIMAL(10, 2)) AS desvioPadrao,
            
            -- Total de Alertas (Último mês)
            (
                SELECT COUNT(A.idAlerta)
                FROM Alerta A
                JOIN Registro R_ALERTA ON A.fkRegistro = R_ALERTA.idRegistro
                JOIN vw_Componentes_Por_Empresa CPE_ALERTA ON R_ALERTA.fkComponente = CPE_ALERTA.idComponente
                WHERE CPE_ALERTA.fkEmpresa = ${idEmpresa}
                  AND CPE_ALERTA.tipoComponente = '${tipoComponente}'
                  AND R_ALERTA.horario >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            ) AS totalAlertas,
            (
                SELECT 
                    ROUND(COALESCE(COUNT(DISTINCT M.idMaquina) * 100.0 / NULLIF((SELECT COUNT(idMaquina) FROM Maquina WHERE fkEmpresa = ${idEmpresa}), 0), 0), 2)
                FROM 
                    Alerta AL
                JOIN 
                    Registro R_MAQ ON AL.fkRegistro = R_MAQ.idRegistro
                JOIN
                    Componente C ON R_MAQ.fkComponente = C.idComponente
                JOIN
                    Maquina M ON C.fkMaquina = M.idMaquina
                JOIN
                    TipoComponente TC ON C.fkTipoComponente = TC.idTipoComponente
                WHERE
                    M.fkEmpresa = ${idEmpresa}
                    AND TC.tipoComponete = '${tipoComponente}'
                    AND AL.nivel IN ('CRITICO', 'OCIOSO')
                    AND R_MAQ.horario >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            ) AS percCriticoOcioso
        FROM
            Registro R
        LEFT JOIN
            vw_Componentes_Por_Empresa CPE ON R.fkComponente = CPE.idComponente
        WHERE
            CPE.fkEmpresa = ${idEmpresa}
            AND CPE.tipoComponente = '${tipoComponente}'
            AND R.horario >= DATE_SUB(NOW(), INTERVAL 30 DAY);
    `;
  return database.executar(instrucaoSql);
}

function getDistribuicaoAlertas(idEmpresa, tipoComponente) {
  var instrucaoSql = `
        SELECT
            DATE_FORMAT(R.horario, '%b') AS label, 
            SUM(CASE WHEN A.nivel = 'CRITICO' THEN 1 ELSE 0 END) AS critico,
            SUM(CASE WHEN A.nivel = 'ATENÇÃO' THEN 1 ELSE 0 END) AS atencao,
            SUM(CASE WHEN A.nivel = 'OCIOSO' THEN 1 ELSE 0 END) AS ocioso
        FROM
            Registro R
        JOIN
            Alerta A ON R.idRegistro = A.fkRegistro
        JOIN
            vw_Componentes_Por_Empresa CPE ON R.fkComponente = CPE.idComponente
        WHERE
            CPE.fkEmpresa = ${idEmpresa}
            AND CPE.tipoComponente = '${tipoComponente}'
            AND R.horario >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY
            label, MONTH(R.horario)
        ORDER BY
            MONTH(R.horario);
    `;
  return database.executar(instrucaoSql);
}

function getParametros(idEmpresa, tipoComponente) {
  var instrucaoSql = `
        SELECT
            identificador,
            SUBSTRING_INDEX(
                GROUP_CONCAT(limite ORDER BY rank_origem ASC, dataCriacao DESC),
                ',', 
                1
            ) AS limite_atual
        FROM
            vw_Parametros_Atuais
        WHERE
            fkEmpresa = ${idEmpresa}
            AND tipoComponete = '${tipoComponente}'
        GROUP BY
            identificador
        ORDER BY
            limite_atual DESC; 
    `;
  return database.executar(instrucaoSql);
}

module.exports = {
  getDadosBrutos,
  getKpisAgregados,
  getDistribuicaoAlertas,
  getParametros,
};
