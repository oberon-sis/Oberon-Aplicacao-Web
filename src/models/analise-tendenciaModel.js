var database = require('../database/config');

function buscar_total_alertas_e_criticos_atual_e_passado(dataInicio, idEmpresa, idMaquina) {
  console.log('[MODEL] - Buscando total de alertas e total criticos dados atuais e passados:', dataInicio, idEmpresa, idMaquina);

  var instrucaoSql = ` CALL sp_kpi_alertas('${dataInicio}', NOW(), ${idEmpresa}, ${idMaquina});`;
  console.log('Executando a instrução SQL: \n' + instrucaoSql);

  return database.executar(instrucaoSql);
}

function buscar_uptime_atual_e_passado(dataInicio, idEmpresa, idMaquina) {
  console.log('[MODEL] - Buscando uptime total atual e passado:', dataInicio, idEmpresa, idMaquina);

  var instrucaoSql = `CALL sp_uptime_intervalo('${dataInicio}', NOW(), ${idEmpresa}, ${idMaquina});`;
  console.log('Executando a instrução SQL: \n' + instrucaoSql);

  return database.executar(instrucaoSql);
}

function buscar_alerta_moda_e_total(dataInicio, idEmpresa, idMaquina) {
  console.log('[MODEL] - Buscando a metrica moda ou seja a mais frequente:', dataInicio, idEmpresa, idMaquina);

  var instrucaoSql = `CALL sp_kpi_metrica_alerta('${dataInicio}', NOW(), ${idEmpresa}, ${idMaquina});`;
    
  console.log('Executando a instrução SQL: \n' + instrucaoSql);

  return database.executar(instrucaoSql);
}

function buscar_maquinas(idEmpresa) {
  console.log('[MODEL] - Buscando maquinas da idEmpresa:', idEmpresa);

  var instrucaoSql = `SELECT idMaquina, nome FROM Maquina WHERE fkEmpresa = ${idEmpresa}`;
    
  console.log('Executando a instrução SQL: \n' + instrucaoSql);

  return database.executar(instrucaoSql);
}


function buscar_dados_brutos_atual_e_passado(dataInicio, idEmpresa, idMaquina) {
  console.log('[MODEL] - Buscando maquina mais critica:', dataInicio, idEmpresa, idMaquina);

  var instrucaoSql = ``;
    
  console.log('Executando a instrução SQL: \n' + instrucaoSql);

  return database.executar(instrucaoSql);
}

function buscar_ranking_tabelas_desempenho(dataInicio, idEmpresa, limite_de_dados) {
  console.log('[MODEL] - Buscando maquina mais critica:', dataInicio, idEmpresa, limite_de_dados);

  var instrucaoSql = `CALL sp_dados_tabela('${dataInicio}', NOW(), ${idEmpresa}, ${limite_de_dados});`;
    
  console.log('Executando a instrução SQL: \n' + instrucaoSql);

  return database.executar(instrucaoSql);
}



module.exports = {
buscar_uptime_atual_e_passado,
buscar_total_alertas_e_criticos_atual_e_passado,
buscar_alerta_moda_e_total,
buscar_dados_brutos_atual_e_passado,
buscar_maquinas, 
buscar_ranking_tabelas_desempenho, 
};
