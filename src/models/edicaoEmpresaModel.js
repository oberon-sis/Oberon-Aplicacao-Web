var database = require("../database/config");

function getDadosEmpresaBd(idFuncionario) {
  console.log(
    "ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function entrar(): ",
    idFuncionario,
  );
  var instrucaoSql = `
    SELECT Empresa.razaosocial, Empresa.cnpj, Funcionario.nome, Funcionario.fkTipoUsuario
    from Empresa join funcionario
        on funcionario.fkempresa = Empresa.idempresa
        where idfuncionario = ${idFuncionario} ;`;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}




function atualizarEmpresa(fkEmpresa, razaoSocial, cnpj) {
  var instrucaoSql = `
    UPDATE Empresa
    SET razaoSocial = '${razaoSocial}', cnpj = '${cnpj}'
    WHERE idEmpresa = ${fkEmpresa};
  `;
  console.log("Atualizando empresa:", instrucaoSql);
  return database.executar(instrucaoSql);
}

function getFkEmpresa(idFuncionario) {
  var instrucaoSql = `
    SELECT fkEmpresa FROM Funcionario WHERE idFuncionario = ${idFuncionario};
  `;
  console.log("Buscando fkEmpresa:", instrucaoSql);
  return database.executar(instrucaoSql);
}



function getSenha(idFuncionario) {
  var instrucaoSql = `
    SELECT senha FROM Funcionario WHERE idFuncionario = ${idFuncionario};
  `;
  console.log("Buscando fkEmpresa:", instrucaoSql);
  return database.executar(instrucaoSql);
}


function EliminarAlertaEmpresa(fkEmpresa){
   console.log("[MODEL] - function EliminarAlertaEmpresa():", fkEmpresa);
  
  var instrucaoSql = `
    DELETE Alerta
    FROM Alerta
    JOIN MaquinaComponente AS maqComp ON Alerta.fkMaquinaComponente = maqComp.idMaquinaComponente
    JOIN Maquina AS m ON maqComp.fkMaquina = m.idMaquina
    WHERE m.fkEmpresa = ${fkEmpresa};
  `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function eliminarRegistrosEmpresa(fkEmpresa) {
  console.log("[MODEL] - function eliminarRegistrosEmpresa():", fkEmpresa);
  
 
  var instrucaoSql = `
    DELETE Registro
    FROM Registro
    JOIN MaquinaComponente AS maqComp ON Registro.fkMaqCompuinaComponente = maqComp.idMaquinaComponente
    JOIN Maquina AS m ON maqComp.fkMaquina = m.idMaquina
    WHERE m.fkEmpresa = ${fkEmpresa};
  `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}


function eliminarParEspeEmpresa(fkEmpresa) {
  console.log("[MODEL] - function eliminarParEspeEmpresa():", fkEmpresa);
  
  var instrucaoSql = `
    DELETE ParametroEspecifico
    FROM ParametroEspecifico
    JOIN MaquinaComponente AS maqComp ON ParametroEspecifico.fkMaquinaComponente = maqComp.idMaquinaComponente JOIN Maquina AS m ON maqComp.fkMaquina = m.idMaquina
    WHERE m.fkEmpresa = ${fkEmpresa};
  `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function eliminarMaqCompEmpresa(fkEmpresa) {
  console.log("[MODEL] - function eliminarMaqCompEmpresa():", fkEmpresa);
  

  var instrucaoSql = `
    DELETE MaquinaComponente
    FROM MaquinaComponente
    JOIN Maquina AS m ON MaquinaComponente.fkMaquina = m.idMaquina
    WHERE m.fkEmpresa = ${fkEmpresa};
  `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}


function eliminarFuncionarios(fkEmpresa) {
  console.log("[MODEL] - function eliminarFuncionarios():", fkEmpresa);
  
  var instrucaoSql = `
    DELETE FROM Funcionario
    WHERE fkEmpresa = ${fkEmpresa};
  `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}


function eliminarParametrosPadrao(fkEmpresa) {
  console.log("[MODEL] - function eliminarParametrosPadrao():", fkEmpresa);
  
  var instrucaoSql = `
    DELETE FROM ParametroPadrao
    WHERE fkEmpresa = ${fkEmpresa};
  `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}


function eliminarMaquinas(fkEmpresa) {
  console.log("[MODEL] - function eliminarMaquinas():", fkEmpresa);
  
  
  var instrucaoSql = `
    DELETE FROM Maquina
    WHERE fkEmpresa = ${fkEmpresa};
  `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function eliminarEmpresa(idEmpresa) {
  console.log("[MODEL] - function eliminarEmpresa():", idEmpresa);
  
  
  var instrucaoSql = `
    DELETE FROM Empresa
    WHERE idEmpresa = ${idEmpresa};
  `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

  module.exports = {
    //     // Exportamos a função com o nome que o controller está chamando
    getDadosEmpresaBd,
    atualizarEmpresa,
    getFkEmpresa,
    getSenha,

    EliminarAlertaEmpresa,
    eliminarRegistrosEmpresa,
    eliminarParEspeEmpresa,
    eliminarMaqCompEmpresa,
    eliminarFuncionarios,
    eliminarParametrosPadrao,
    eliminarMaquinas,
    eliminarEmpresa
  };