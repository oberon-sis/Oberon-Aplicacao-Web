var database = require('../database/config');

var CAPACIDADE_MAXIMA_REDE = 12500;

function getDadosBrutos(idEmpresa, tipoComponente) {
  var instrucaoSql = `
    SELECT 
      ${
        tipoComponente === 'REDE'
          ? `ROUND((R.valor / ${CAPACIDADE_MAXIMA_REDE}) * 100, 2) AS valor`
          : 'R.valor'
      }
    FROM 
      Registro R
    JOIN 
      vw_Componentes_Por_Empresa CPE ON R.fkComponente = CPE.idComponente
    WHERE 
      CPE.fkEmpresa = ${idEmpresa}
      AND CPE.tipoComponente = '${tipoComponente}'
      AND R.horario >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    ORDER BY 
      R.valor ASC;
  `;
  return database.executar(instrucaoSql);
}

function getKpisAgregados(idEmpresa, tipoComponente) {
  var instrucaoSql = `
    SELECT
      ${
        tipoComponente === 'REDE'
          ? `CAST(COALESCE(AVG((R.valor / ${CAPACIDADE_MAXIMA_REDE}) * 100), 0) AS DECIMAL(10, 2)) AS media,
           CAST(COALESCE(STDDEV((R.valor / ${CAPACIDADE_MAXIMA_REDE}) * 100), 0) AS DECIMAL(10, 2)) AS desvioPadrao`
          : `CAST(COALESCE(AVG(R.valor), 0) AS DECIMAL(10, 2)) AS media,
           CAST(COALESCE(STDDEV(R.valor), 0) AS DECIMAL(10, 2)) AS desvioPadrao`
      },
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
      P.identificador,
      ${
        tipoComponente === 'REDE'
          ? `ROUND((P.limite / ${CAPACIDADE_MAXIMA_REDE}) * 100, 2) AS limite_atual`
          : 'P.limite AS limite_atual'
      }
    FROM Parametro P
    JOIN TipoComponente TC ON P.fkTipoComponente = TC.idTipoComponente
    WHERE TC.tipoComponete = '${tipoComponente}'
      AND P.fkComponente IS NULL
      AND (
        (P.origemParametro = 'EMPRESA' AND P.fkEmpresa = ${idEmpresa})
        OR
        (P.origemParametro = 'OBERON' AND P.fkEmpresa = 1 AND NOT EXISTS (
          SELECT 1 FROM Parametro P2
          WHERE P2.fkTipoComponente = P.fkTipoComponente
            AND P2.identificador = P.identificador
            AND P2.origemParametro = 'EMPRESA'
            AND P2.fkEmpresa = ${idEmpresa}
            AND P2.fkComponente IS NULL
        ))
      )
    ORDER BY 
      CASE P.origemParametro
        WHEN 'EMPRESA' THEN 1
        WHEN 'OBERON' THEN 2
      END,
      P.dataCriacao DESC
    LIMIT 3;
  `;
  return database.executar(instrucaoSql);
}

function atualizarParametros(
  idEmpresa,
  tipoComponente,
  limiteAceitavel,
  limiteAtencao,
  limiteCritico,
) {
  var sqlTipoComponente = `
    SELECT idTipoComponente 
    FROM TipoComponente 
    WHERE tipoComponete = '${tipoComponente}'
    LIMIT 1;
  `;

  return database.executar(sqlTipoComponente).then((resultado) => {
    if (!resultado || resultado.length === 0) {
      throw new Error('Tipo de componente não encontrado.');
    }
    var idTipoComponente = resultado[0].idTipoComponente;
    var limiteAceitavelFinal = limiteAceitavel;
    var limiteAtencaoFinal = limiteAtencao;
    var limiteCriticoFinal = limiteCritico;
    if (tipoComponente === 'REDE') {
      limiteAceitavelFinal = (limiteAceitavel / 100) * CAPACIDADE_MAXIMA_REDE;
      limiteAtencaoFinal = (limiteAtencao / 100) * CAPACIDADE_MAXIMA_REDE;
      limiteCriticoFinal = (limiteCritico / 100) * CAPACIDADE_MAXIMA_REDE;
    }
    var sqlDelete = `
      DELETE FROM Parametro 
      WHERE fkEmpresa = ${idEmpresa} 
        AND fkTipoComponente = ${idTipoComponente}
        AND origemParametro = 'EMPRESA'
        AND fkComponente IS NULL;
    `;
    return database.executar(sqlDelete).then(() => {
      var sqlInsert = `
        INSERT INTO Parametro (fkTipoComponente, fkEmpresa, limite, identificador, origemParametro, fkCriadoPor) 
        VALUES
          (${idTipoComponente}, ${idEmpresa}, ${limiteAceitavelFinal}, 'ACEITÁVEL', 'EMPRESA', 1),
          (${idTipoComponente}, ${idEmpresa}, ${limiteAtencaoFinal}, 'ATENÇÃO', 'EMPRESA', 1),
          (${idTipoComponente}, ${idEmpresa}, ${limiteCriticoFinal}, 'CRITICO', 'EMPRESA', 1);
      `;
      return database.executar(sqlInsert);
    });
  });
}

module.exports = {
  getDadosBrutos,
  getKpisAgregados,
  getDistribuicaoAlertas,
  getParametros,
  atualizarParametros,
};
