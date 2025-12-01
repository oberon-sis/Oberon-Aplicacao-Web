var database = require('../database/config');
const limitePagina = 15;

function construirClausulaWhere(tipoFiltro, termoPesquisa, dataInicio, dataFim) {
  let clausulaWhere = '';
  if (termoPesquisa) {
    const termoSql = termoPesquisa.replace(/'/g, "''");
    const termoLike = `'%${termoSql}%'`;
    switch (tipoFiltro) {
      case 'maquina':
        clausulaWhere += `AND VHA.maquinaAfetada LIKE ${termoLike} `;
        break;
      case 'componente':
        clausulaWhere += `AND VHA.tipoComponente LIKE ${termoLike} `;
        break;
      case 'descricao':
      default:
        clausulaWhere += `AND VHA.motivoAlerta LIKE ${termoLike} `;
        break;
    }
  }
  if (dataInicio) {
    clausulaWhere += `AND VHA.horarioRegistro >= '${dataInicio}' `;
  }
  if (dataFim) {
    clausulaWhere += `AND VHA.horarioRegistro <= '${dataFim}' `;
  }

  return clausulaWhere;
}

function getFkEmpresa(idFuncionario) {
  console.log('[ALERTA MODEL] Buscando fkEmpresa para o funcionário:', idFuncionario);
  var instrucaoSql = `
    SELECT fkEmpresa FROM Funcionario WHERE idFuncionario = ${idFuncionario};
  `;
  return database.executar(instrucaoSql);
}

const selectAlertasBase = `
    SELECT 
        A.idAlerta,
        VHA.motivoAlerta AS descricao,
        VHA.nivelAlerta AS nivel,
        VHA.horarioRegistro AS horarioRegistro, -- Mantido apenas o Registro
        VHA.maquinaAfetada AS nomeMaquina,
        VHA.tipoComponente,
        TC.funcaoMonitorar
        -- REMOVIDOS: horarioFinal e duracaoSegundos
    FROM vw_HistoricoAlertasAtivos AS VHA
    JOIN Alerta AS A ON VHA.fkRegistro = A.fkRegistro 
    JOIN Registro AS R ON A.fkRegistro = R.idRegistro
    JOIN Componente AS C ON R.fkComponente = C.idComponente
    JOIN Maquina AS M ON C.fkMaquina = M.idMaquina
    JOIN Parametro AS P ON A.fkParametro = P.idParametro
    JOIN TipoComponente AS TC ON P.fkTipoComponente = TC.idTipoComponente
`;

function verAlertas(fkEmpresa, pagina, tipoFiltro, termoPesquisa, dataInicio, dataFim) {
  const limite = limitePagina;
  const offset = (pagina - 1) * limite;
  const clausulaWhere = construirClausulaWhere(tipoFiltro, termoPesquisa, dataInicio, dataFim);

  console.log(`[ALERTA MODEL] Buscando alertas para a empresa ${fkEmpresa}`);

  var instrucaoSql = `
    ${selectAlertasBase}
    WHERE M.fkEmpresa = ${fkEmpresa} 
    ${clausulaWhere} 
    ORDER BY VHA.horarioRegistro DESC
    LIMIT ${limite} OFFSET ${offset};
  `;

  console.log('Executando a instrução SQL: \n' + instrucaoSql);
  return database.executar(instrucaoSql);
}

function contarTotalAlertas(fkEmpresa, tipoFiltro, termoPesquisa, dataInicio, dataFim) {
  const clausulaWhere = construirClausulaWhere(tipoFiltro, termoPesquisa, dataInicio, dataFim);
  console.log(`[ALERTA MODEL] Contando total de alertas para a empresa ${fkEmpresa} com filtro`);
  var instrucaoSql = `
    SELECT 
        COUNT(A.idAlerta) AS totalAlertas
    FROM vw_HistoricoAlertasAtivos AS VHA
    JOIN Alerta AS A ON VHA.fkRegistro = A.fkRegistro
    JOIN Registro AS R ON A.fkRegistro = R.idRegistro
    JOIN Componente AS C ON R.fkComponente = C.idComponente
    JOIN Maquina AS M ON C.fkMaquina = M.idMaquina
    WHERE M.fkEmpresa = ${fkEmpresa}
    ${clausulaWhere};
  `;
  console.log('Executando a instrução SQL: \n' + instrucaoSql);
  return database.executar(instrucaoSql);
}

function obterTodosAlertasParaExportacao(
  fkEmpresa,
  tipoFiltro,
  termoPesquisa,
  dataInicio,
  dataFim,
) {
  const clausulaWhere = construirClausulaWhere(tipoFiltro, termoPesquisa, dataInicio, dataFim);
  console.log(
    `[ALERTA MODEL] Obtendo TODOS os alertas para exportação (sem paginação) para a empresa ${fkEmpresa}`,
  );
  var instrucaoSql = `
    ${selectAlertasBase}
    WHERE M.fkEmpresa = ${fkEmpresa}
    ${clausulaWhere} 
    ORDER BY VHA.horarioRegistro DESC;
  `;
  console.log('Executando a instrução SQL de EXPORTAÇÃO: \n' + instrucaoSql);
  return database.executar(instrucaoSql);
}

function listarFeedAlertas(idEmpresa) {
  console.log(`[ALERTA MODEL] Contando total de alertas para a empresa ${idEmpresa} com filtro`);
  var instrucaoSql = `SELECT  A.idAlerta AS id, M.nome AS maquina,
            CASE 
                WHEN A.nivel = 'CRITICO' THEN 'Crítico'
                WHEN A.nivel = 'ATENÇÃO' THEN 'Alerta'
                ELSE 'Atenção'
            END AS tipo,
            A.descricao AS mensagem,
            CASE
                WHEN TIMESTAMPDIFF(SECOND, R.horario, NOW()) < 60 THEN 'Agora mesmo'
                WHEN TIMESTAMPDIFF(MINUTE, R.horario, NOW()) < 60 THEN CONCAT(TIMESTAMPDIFF(MINUTE, R.horario, NOW()), ' min atrás')
                WHEN TIMESTAMPDIFF(HOUR, R.horario, NOW()) < 24 THEN CONCAT(TIMESTAMPDIFF(HOUR, R.horario, NOW()), 'h atrás')
                WHEN TIMESTAMPDIFF(DAY, R.horario, NOW()) = 1 THEN 'Ontem'
                ELSE CONCAT(TIMESTAMPDIFF(DAY, R.horario, NOW()), ' dias atrás')
            END AS timestamp
        FROM Alerta AS A
        JOIN Registro AS R ON A.fkRegistro = R.idRegistro
        JOIN Componente AS C ON R.fkComponente = C.idComponente
        JOIN Maquina AS M ON C.fkMaquina = M.idMaquina
        WHERE M.fkEmpresa = ${idEmpresa}
        ORDER BY R.horario DESC
        LIMIT 10;
  `;
  console.log('Executando a instrução SQL: \n' + instrucaoSql);
  return database.executar(instrucaoSql);
}

module.exports = {
  getFkEmpresa,
  verAlertas,
  contarTotalAlertas,
  obterTodosAlertasParaExportacao,
  limitePagina,
  listarFeedAlertas,
};
