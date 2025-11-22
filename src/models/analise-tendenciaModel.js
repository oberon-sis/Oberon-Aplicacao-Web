var database = require('../database/config');

function buscar_total_alertas_e_criticos_atual_e_passado(dataInicio, dataFim, idEmpresa, idMaquina) {
  console.log('[MODEL] - Buscando total de alertas e total criticos dados atuais e passados:', dataInicio, dataFim, idEmpresa, idMaquina);

  var instrucaoSql = ` CALL sp_kpi_alertas('2025-10-01 00:00:00', NOW(), 6, NULL);`;
  console.log('Executando a instrução SQL: \n' + instrucaoSql);

  return database.executar(instrucaoSql);
}

function buscar_uptime_atual_e_passado(dataInicio, dataFim, idEmpresa, idMaquina) {
  console.log('[MODEL] - Buscando uptime total atual e passado:', dataInicio, dataFim, idEmpresa, idMaquina);

  var instrucaoSql = ` CALL sp_uptime_intervalo('2025-10-01 00:00:00', NOW(), 6, NULL);`;
  console.log('Executando a instrução SQL: \n' + instrucaoSql);

  return database.executar(instrucaoSql);
}

function buscar_alerta_moda_e_total(dataInicio, dataFim, idEmpresa, idMaquina) {
  console.log('[MODEL] - Buscando a metrica moda ou seja a mais frequente:', dataInicio, dataFim, idEmpresa, idMaquina);

  var instrucaoSql = `CALL sp_kpi_metrica_alerta('2025-10-01 00:00:00', NOW(), 6, NULL);`;
    
  console.log('Executando a instrução SQL: \n' + instrucaoSql);

  return database.executar(instrucaoSql);
}

function buscar_maquinas(idEmpresa) {
  console.log('[MODEL] - Buscando maquinas da idEmpresa:', idEmpresa);

  var instrucaoSql = `SELECT idMaquina, nome FROM Maquinas WHERE fkEmpresa = ${idEmpresa}`;
    
  console.log('Executando a instrução SQL: \n' + instrucaoSql);

  return database.executar(instrucaoSql);
}


function buscar_dados_brutos_atual_e_passado(dataInicio, dataFim, idEmpresa, idMaquina) {
  console.log('[MODEL] - Buscando maquina mais critica:', dataInicio, dataFim, idEmpresa, idMaquina);

  var instrucaoSql = ``;
    
  console.log('Executando a instrução SQL: \n' + instrucaoSql);

  return database.executar(instrucaoSql);
}


module.exports = {
buscar_uptime_atual_e_passado,
buscar_total_alertas_e_criticos_atual_e_passado,
buscar_alerta_moda_e_total,
buscar_dados_brutos_atual_e_passado,
buscar_maquinas, 
};
