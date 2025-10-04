var database = require("../database/config");

function cadastrarMaquina(nome, modelo, macAddress, fkEmpresa) {
  console.log(
    "[MODEL] - function cadastrarMaquina():",
    nome,
    modelo,
    macAddress,
    fkEmpresa
  );

  var instrucaoSql = `
        INSERT INTO Maquina (nome, modelo, macAddress, status, fkEmpresa) VALUES 
        ('${nome}', '${modelo}', '${macAddress}', 'Aguardando' , ${fkEmpresa})
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}
function cadastrarMaquinaComponente(fkMaquina, fkComponente, origemParametro) {
  console.log(
    "[MODEL] - function cadastrarMaquinaComponente():",
    fkMaquina,
    fkComponente,
    origemParametro
  );

  var instrucaoSql = `
        INSERT INTO MaquinaComponente (fkMaquina, fkComponente, origemParametro) VALUES 
        (${fkMaquina}, ${fkComponente}, '${origemParametro}')
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}
function cadastrarParametroEspecifico(limite, fkMaquinaComponente) {
  console.log(
    "[MODEL] - function cadastrarParametroEspecifico():",
    limite,
    fkMaquinaComponente
  );

  var instrucaoSql = `
        INSERT INTO ParametroEspecifico (limite, fkMaquinaComponente) VALUES 
        (${limite}, ${fkMaquinaComponente})
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}
function cadastrarParametro(limite, fkEmpresa, fkMaquinaComponente) {
  console.log(
    "[MODEL] - function cadastrarParametro():",
    limite,
    fkEmpresa,
    fkMaquinaComponente
  );

  var instrucaoSql = `
        INSERT INTO Parametro (limite, fkEmpresa, fkMaquinaComponente) VALUES 
        (${limite}, ${fkEmpresa}, ${fkMaquinaComponente})
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function getFkAlerta(fkMaquina) {
  console.log("[MODEL] - function getFkAlerta():", fkMaquina);

  var instrucaoSql = `
        SELECT idAlerta from Alerta WHERE fkMaquina = ${fkMaquina};
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function getFkMaquinaComponente(fkMaquina) {
  console.log("[MODEL] - function getFkMaquinaComponente():", fkMaquina);
  var instrucaoSql = `
        SELECT idMaquinaComponente from MaquinaComponente where fkMaquina = ${fkMaquina};
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function getParametrosEspecificos(fkMaquinaComponente) {
  console.log(
    "[MODEL] - function getParametrosEspecificos():",
    fkMaquinaComponente
  );
  var instrucaoSql = `
        SELECT idParametro from Parametro where fkMaquinaComponente = ${fkMaquinaComponente};
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function getFkEmpresa(idFuncionario) {
  console.log("[MODEL] - function getFkEmpresa():", idFuncionario);
  var instrucaoSql = `
        SELECT fkEmpresa FROM Funcionario WHERE idFuncionario = ${idFuncionario};
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function getSenha(idFuncionario) {
  console.log("[MODEL] - function getSenha():", idFuncionario);
  var instrucaoSql = `
        SELECT senha from Funcionario where idFuncionario = ${idFuncionario};
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}
function getParametrosPadrao(fkEmpresa) {
  console.log("[MODEL] - function getParametrosPadrao():", fkEmpresa);
  var instrucaoSql = `
        SELECT limite from Parametro where fkEmpresa = ${fkEmpresa};
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function excluirParametroEspecifico(fkMaquinaComponente) {
  console.log("[MODEL] - function getParametrosEspecifico():", fkEmpresa);
  var instrucaoSql = `
        DELETE from MaquinaComponente where fkMaquinaComponente = ${fkMaquinaComponente}
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function atualizarMaquina(nome, modelo, macAddress, status, fkEmpresa) {
  console.log(
    "[MODEL] - function atualizarMaquina():",
    nome,
    modelo,
    macAddress,
    status,
    fkEmpresa
  );

  var instrucaoSql = `
        UPDATE Maquina SET 
          nome = '${nome}', 
          modelo = '${modelo}',
          macAddress = '${macAddress}', 
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
    fkMaquinaComponente
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
  console.log("[MODEL] - function atualizarAlerta():", horarioFinal, fkAlerta);

  var instrucaoSql = `
        UPDATE Alerta SET horarioFinal = '${horarioFinal}'
        WHERE idAlerta = ${fkAlerta};
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function eliminarMaquina(idMaquina) {
  console.log("[MODEL] - function eliminarMaquina():", idMaquina);

  var instrucaoSql = `
        Delete from Maquina where idMaquina = ${idMaquina};
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function eliminarMaquinaComponente(idMaquina) {
  console.log("[MODEL] - function eliminarMaquinaComponente():", idMaquina);

  var instrucaoSql = `
        Delete from Parametro where fkMaquina = ${idMaquina};
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function eliminarRegistros(fkMaquinaComponente) {
  console.log("[MODEL] - function eliminarRegistros():", fkMaquinaComponente);

  var instrucaoSql = `
        Delete from Registro where fkMaquinaComponente = ${fkMaquinaComponente};
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function eliminarAlertas(fkMaquinaComponente) {
  console.log("[MODEL] - function eliminarAlertas():", fkMaquinaComponente);

  var instrucaoSql = `
        Delete from Alerta where fkMaquinaComponente = ${fkMaquinaComponente};
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function listarMaquinasPorEmpresa(
  fkEmpresa,
  limite,
  offset,
  condicao,
  termoDePesquisa
) {
  console.log(
    "[MODEL] - function listarMaquinasPorEmpresa():",
    `Empresa: ${fkEmpresa}, Limite: ${limite}, Offset: ${offset}, Condicao: ${condicao}, termo:${termoDePesquisa}`
  );

  var instrucaoDadosSql = `
        SELECT 
            idMaquina, 
            nome, 
            IFNULL(hostname, 'Aguardando Captura') AS hostname, 
            IFNULL(modelo, 'Não Especificado') AS modelo, 
            IFNULL(status, 'Aguardando') AS status, 
            IFNULL(sistemaOperacional, 'Capturando SO') AS sistemaOperacional, 
            IFNULL(macAddress, 'MAC Ausente') AS macAddress, 
            IFNULL(ip, 'Aguardando IP') AS ip
        FROM Maquina 
        WHERE fkEmpresa = ${fkEmpresa}
          AND (${condicao} LIKE '%${termoDePesquisa}%' OR ${condicao} = '${termoDePesquisa}')
        ORDER BY idMaquina ASC
        LIMIT ${limite}
        OFFSET ${offset}
    `;

  console.log("Executando a instrução SQL de DADOS: \n" + instrucaoDadosSql);

  return database.executar(instrucaoDadosSql);
}

function contarMaquinasPorEmpresa(fkEmpresa, condicao, termoDePesquisa) {
  console.log(
    "[MODEL] - function contarMaquinasPorEmpresa():",
    `Empresa: ${fkEmpresa}`,
    `Termo: ${termoDePesquisa}`
  );

  var instrucaoCountSql = `
        SELECT COUNT(idMaquina) AS totalRegistros FROM Maquina
        WHERE fkEmpresa = ${fkEmpresa} AND (${condicao} LIKE '%${termoDePesquisa}%'
          OR ${condicao} = '${termoDePesquisa}')
    `;

  console.log("Executando a instrução SQL de COUNT: \n" + instrucaoCountSql);

  return database.executar(instrucaoCountSql);
}

module.exports = {
  cadastrarMaquina,
  cadastrarParametro,
  cadastrarMaquinaComponente,
  cadastrarParametroEspecifico,

  getFkAlerta,
  getFkMaquinaComponente,
  getFkEmpresa,
  getSenha,
  getParametrosPadrao,
  getParametrosEspecificos,

  atualizarMaquina,
  atualizarParametro,
  atualizarAlerta,

  eliminarMaquina,
  eliminarMaquinaComponente,
  eliminarRegistros,
  eliminarAlertas,
  excluirParametroEspecifico,

  listarMaquinasPorEmpresa,
  contarMaquinasPorEmpresa,
};
