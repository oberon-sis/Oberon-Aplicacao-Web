var database = require('../database/config');

function buscarLogs(idEmpresa, filtros = {}, pagina = 1, itensPorPagina = 20) {
  const {
    funcionarioId = 'todos',
    tipoMudanca = 'todos',
    dataInicio = null,
    dataFim = null,
  } = filtros;

  let condicoes = [`F.fkEmpresa = ${idEmpresa}`];

  if (funcionarioId !== 'todos') {
    condicoes.push(`LA.fkFuncionario = ${funcionarioId}`);
  }
  if (tipoMudanca !== 'todos') {
    condicoes.push(`LA.acao = '${tipoMudanca}'`);
  }
  if (dataInicio) {
    condicoes.push(`DATE(LA.horario) >= '${dataInicio}'`);
    console.log('Filtro Data Início aplicado:', dataInicio);
  }
  if (dataFim) {
    condicoes.push(`DATE(LA.horario) <= '${dataFim}'`);
    console.log('Filtro Data Fim aplicado:', dataFim);
  }

  const whereClause = condicoes.join(' AND ');
  const offset = (pagina - 1) * itensPorPagina;

  var instrucaoSql = `
    SELECT 
      LA.idLogAuditoria,
      DATE_FORMAT(LA.horario, '%d/%m/%Y %H:%i:%s') AS horarioFormatado,
      LA.acao,
      LA.descricao,
      LA.tabelaAfetada,
      LA.idAfetado,
      LA.valorAntigo,
      LA.valorNovo,
      F.nome AS usuarioResponsavel,
      F.idFuncionario
    FROM 
      LogAuditoria LA
    JOIN 
      Funcionario F ON LA.fkFuncionario = F.idFuncionario
    WHERE 
      ${whereClause}
    ORDER BY 
      LA.horario DESC
    LIMIT ${itensPorPagina}
    OFFSET ${offset};
  `;

  console.log('SQL Executado:', instrucaoSql);

  return database.executar(instrucaoSql);
}

function contarLogs(idEmpresa, filtros = {}) {
  const {
    funcionarioId = 'todos',
    tipoMudanca = 'todos',
    dataInicio = null,
    dataFim = null,
  } = filtros;

  let condicoes = [`F.fkEmpresa = ${idEmpresa}`];

  if (funcionarioId !== 'todos') {
    condicoes.push(`LA.fkFuncionario = ${funcionarioId}`);
  }
  if (tipoMudanca !== 'todos') {
    condicoes.push(`LA.acao = '${tipoMudanca}'`);
  }
  if (dataInicio) {
    condicoes.push(`DATE(LA.horario) >= '${dataInicio}'`);
  }
  if (dataFim) {
    condicoes.push(`DATE(LA.horario) <= '${dataFim}'`);
  }

  const whereClause = condicoes.join(' AND ');

  var instrucaoSql = `
    SELECT 
      COUNT(*) AS total
    FROM 
      LogAuditoria LA
    JOIN 
      Funcionario F ON LA.fkFuncionario = F.idFuncionario
    WHERE 
      ${whereClause};
  `;
  return database.executar(instrucaoSql);
}

function buscarFuncionarios(idEmpresa) {
  var instrucaoSql = `
    SELECT 
      F.idFuncionario,
      F.nome,
      F.email
    FROM 
      Funcionario F
    WHERE 
      F.fkEmpresa = ${idEmpresa}
    ORDER BY 
      F.nome ASC;
  `;

  return database.executar(instrucaoSql);
}

function buscarLogPorId(idLog) {
  var instrucaoSql = `
    SELECT 
      LA.idLogAuditoria,
      DATE_FORMAT(LA.horario, '%d/%m/%Y %H:%i:%s') AS horarioFormatado,
      LA.acao,
      LA.descricao,
      LA.tabelaAfetada,
      LA.idAfetado,
      LA.valorAntigo,
      LA.valorNovo,
      F.nome AS usuarioResponsavel,
      F.email AS emailUsuario
    FROM 
      LogAuditoria LA
    JOIN 
      Funcionario F ON LA.fkFuncionario = F.idFuncionario
    WHERE 
      LA.idLogAuditoria = ${idLog};
  `;

  return database.executar(instrucaoSql);
}

function exportarLogsCSV(idEmpresa, filtros = {}) {
  const {
    funcionarioId = 'todos',
    tipoMudanca = 'todos',
    dataInicio = null,
    dataFim = null,
  } = filtros;

  let condicoes = [`F.fkEmpresa = ${idEmpresa}`];

  if (funcionarioId !== 'todos') {
    condicoes.push(`LA.fkFuncionario = ${funcionarioId}`);
  }
  if (tipoMudanca !== 'todos') {
    condicoes.push(`LA.acao = '${tipoMudanca}'`);
  }
  if (dataInicio) {
    condicoes.push(`DATE(LA.horario) >= '${dataInicio}'`);
  }
  if (dataFim) {
    condicoes.push(`DATE(LA.horario) <= '${dataFim}'`);
  }

  const whereClause = condicoes.join(' AND ');

  var instrucaoSql = `
    SELECT 
      DATE_FORMAT(LA.horario, '%d/%m/%Y %H:%i:%s') AS Horario,
      LA.acao AS Acao,
      LA.descricao AS Descricao,
      LA.tabelaAfetada AS TabelaAfetada,
      LA.idAfetado AS IDAfetado,
      F.nome AS UsuarioResponsavel
    FROM 
      LogAuditoria LA
    JOIN 
      Funcionario F ON LA.fkFuncionario = F.idFuncionario
    WHERE 
      ${whereClause}
    ORDER BY 
      LA.horario DESC;
  `;

  return database.executar(instrucaoSql);
}

module.exports = {
  buscarLogs,
  contarLogs,
  buscarFuncionarios,
  buscarLogPorId,
  exportarLogsCSV,
};
