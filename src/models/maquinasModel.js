var database = require("../database/config");

function cadastrarMaquina(nome, modelo, macAdress, fkEmpresa) {
  console.log(
    "[MODEL] - function cadastrarMaquina():",
    nome,
    modelo,
    macAdress,
    fkEmpresa,
  );

  var instrucaoSql = `
        INSERT INTO Maquina (nome, modelo, macAdress, status, fkEmpresa) VALUES 
        ('${nome}', '${modelo}', '${macAdress}', 'off-line' , ${fkEmpresa})
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function cadastrarParametro(limite, fkEmpresa, fkMaquinaComponente) {
  console.log(
    "[MODEL] - function cadastrarParametro():",
    limite,
    fkEmpresa,
    fkMaquinaComponente,
  );

  var instrucaoSql = `
        INSERT INTO Parametro (limite, fkEmpresa, fkMaquinaComponente) VALUES 
        (${limite}, ${fkEmpresa}, ${fkMaquinaComponente})
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}



function getFkAlerta(fkMaquina) {
  console.log(
    "[MODEL] - function getFkAlerta():",
    fkMaquina,
  );

  var instrucaoSql = `
        SELECT idAlerta from Alerta WHERE fkMaquina = ${fkMaquina};
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function getFkMaquinaComponente(fkMaquina) {
  console.log(
    "[MODEL] - function getFkMaquinaComponente():",
    fkMaquina,
  );
  var instrucaoSql = `
        SELECT idMaquinaComponente from MaquinaComponente where fkMaquina = ${fkMaquina};
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function getFkEmpresa(idFuncionario) {
  console.log(
    "[MODEL] - function getFkEmpresa():",
    idFuncionario,
  );
  var instrucaoSql = `
        SELECT fkEmpresa FROM funcionario WHERE idFuncionario = ${idFuncionario};
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function getSenha(idFuncionario) {
  console.log(
    "[MODEL] - function getSenha():",
    idFuncionario,
  );
  var instrucaoSql = `
        SELECT senha from funcionario where idFuncionario = ${idFuncionario};
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}



function atualizarMaquina(nome, modelo, macAdress, status, fkEmpresa) {
  console.log(
    "[MODEL] - function atualizarMaquina():",
    nome,
    modelo,
    macAdress,
    status,
    fkEmpresa,
  );

  var instrucaoSql = `
        UPDATE Maquina SET 
          nome = '${nome}', 
          modelo = '${modelo}',
          macAdress = '${macAdress}', 
          status = '${status}' 
        WHERE idMaquina = ${fkEmpresa};
        -- Nota: A FK Empresa está sendo usada como ID da Máquina no WHERE
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function atualizarParametro(limite, fkEmpresa, fkMaquinaComponente) {
  console.log(
    "[MODEL] - function atualizarParametro():",
    limite,
    fkEmpresa,
    fkMaquinaComponente,
  );

  var instrucaoSql = `
        UPDATE Parametro SET 
          limite = ${limite}, 
          fkEmpresa = ${fkEmpresa}
        WHERE fkMaquinaComponente = ${fkMaquinaComponente};
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function atualizarAlerta(horarioFinal, fkAlerta) {
  console.log(
    "[MODEL] - function atualizarAlerta():",
    horarioFinal,
    fkAlerta
  );

  var instrucaoSql = `
        UPDATE Alerta SET horarioFinal = '${horarioFinal}'
        WHERE idAlerta = ${fkAlerta};
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}



function eliminarMaquina(idMaquina) {
  console.log(
    "[MODEL] - function eliminarMaquina():",
    idMaquina,
  );

  var instrucaoSql = `
        Delete from Maquina where idMaquina = ${idMaquina};
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function eliminarMaquinaComponente(idMaquina) {
  console.log(
    "[MODEL] - function eliminarMaquinaComponente():",
    idMaquina,
  );

  var instrucaoSql = `
        Delete from MaquinaComponente where fkMaquina = ${idMaquina};
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function eliminarRegistros(fkMaquinaComponente) {
  console.log(
    "[MODEL] - function eliminarRegistros():",
    fkMaquinaComponente,
  );

  var instrucaoSql = `
        Delete from Registro where fkMaquinaComponente = ${fkMaquinaComponente};
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function eliminarAlertas(fkMaquinaComponente) {
  console.log(
    "[MODEL] - function eliminarAlertas():",
    fkMaquinaComponente,
  );

  var instrucaoSql = `
        Delete from Alerta where fkMaquinaComponente = ${fkMaquinaComponente};
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}


module.exports = {
    cadastrarMaquina,
    cadastrarParametro,
    
    getFkAlerta,
    getFkMaquinaComponente,
    getFkEmpresa, 
    getSenha,     

    atualizarMaquina,
    atualizarParametro,
    atualizarAlerta,
    
    eliminarMaquina,
    eliminarMaquinaComponente,
    eliminarRegistros,
    eliminarAlertas
};