var database = require('../database/config');
function buscar_info_maquina(idMaquina) {
  console.log('[MODEL] - Buscando dados de identificação da máquina:', idMaquina);

  var instrucaoSql = `
        SELECT nome, modelo, ip, sistemaOperacional from vw_DadosMaquina WHERE idMaquina = ${idMaquina};
    `;

  console.log('Executando a instrução SQL: \n' + instrucaoSql);

  return database.executar(instrucaoSql);
}

function buscar_info_componentes(idMaquina) {
  console.log('[MODEL] - Buscando dados de identificação da máquina:', idMaquina);

  var instrucaoSql = `
        select tipoComponente, valor from vw_Informacoes_Componentes where fkMaquina = ${idMaquina};
    `;
    
  console.log('Executando a instrução SQL: \n' + instrucaoSql);

  return database.executar(instrucaoSql);
}

function buscar_dados_kpi(idMaquina) {
  console.log('[MODEL] - Buscando dados de identificação da máquina:', idMaquina);

  var instrucaoSql = `
        SELECT
            TC.tipoComponente AS tipoRecurso,
            COUNT(A.idAlerta) AS totalAlertas24h,

            CONCAT(
                MAX(R.valor), '% - ',
                DATE_FORMAT(
                    SUBSTRING_INDEX(
                        GROUP_CONCAT(R.horario ORDER BY R.valor DESC SEPARATOR ','), 
                        ',', 
                        1
                    ),
                    '%H:%i'
                ),
                ' hrs'
            ) AS maiorPicoUso

        FROM
            vw_ComponentesParaAtualizar AS TC

        LEFT JOIN
            Registro AS R 
                ON R.fkComponente = TC.idComponente
                AND R.horario >= DATE_SUB(NOW(), INTERVAL 24 HOUR)

        LEFT JOIN
            Alerta AS A 
                ON A.fkRegistro = R.idRegistro

        WHERE
            TC.fkMaquina = ${idMaquina}

        GROUP BY
            TC.tipoComponente;
    `;
    
  console.log('Executando a instrução SQL: \n' + instrucaoSql);

  return database.executar(instrucaoSql);
}

function buscar_parametros(idMaquina) {
  console.log('[MODEL] - Buscando dados de identificação da máquina:', idMaquina);

  var instrucaoSql = `
        SELECT
            CONCAT(TC.tipoComponete, '_', P.identificador) AS nomeParametro,
            P.limite
        FROM
            Parametro AS P
        LEFT JOIN
            Componente AS C ON P.fkComponente = C.idComponente 
            AND P.origemParametro = 'ESPECÍFICO'
        JOIN
            TipoComponente AS TC ON 
            TC.idTipoComponente =
            (
                CASE
                    WHEN P.origemParametro = 'ESPECÍFICO' THEN C.fkTipoComponente
                    ELSE P.fkTipoComponente
                END
            )
        Where C.fkMaquina = ${idMaquina};
    `;
    
  console.log('Executando a instrução SQL: \n' + instrucaoSql);

  return database.executar(instrucaoSql);
}

function buscar_info_24_horas_coleta(idMaquina) {
  console.log('[MODEL] - Buscando dados de identificação da máquina:', idMaquina);

  var instrucaoSql = `
SELECT
    AVG(r.valor) AS valor_medio,
    DATE_FORMAT(
        FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(r.horario) / (30 * 60)) * (30 * 60)), 
        '%H:%i'
    ) AS intervaloTempo,
    
    c.tipoComponente AS tipoRecurso
FROM
    Registro AS r
JOIN
    vw_ComponentesParaAtualizar AS c
    ON r.fkComponente = c.idComponente
WHERE
    c.fkMaquina = ${idMaquina}
    AND r.horario >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
GROUP BY
    intervaloTempo,
    c.tipoComponente
ORDER BY
    intervaloTempo ASC,
    c.tipoComponente ASC;
    `;
    
  console.log('Executando a instrução SQL: \n' + instrucaoSql);

  return database.executar(instrucaoSql);
}

module.exports = {
    buscar_info_maquina,
    buscar_info_componentes,
    buscar_dados_kpi, 
    buscar_parametros,
    buscar_info_24_horas_coleta,
};
