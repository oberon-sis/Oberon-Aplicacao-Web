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
        ('${nome}', null, '${macAddress}', 'Aguardando' , ${fkEmpresa})
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
function cadastrarParametroPadrao(limite, fkEmpresa, fkComponente) {
  console.log(
    "[MODEL] - function cadastrarParametro():",
    limite,
    fkEmpresa,
    fkComponente
  );

  var instrucaoSql = `
        REPLACE INTO ParametroPadrao (limite, fkEmpresa, fkComponente)
         VALUES (${limite}, ${fkEmpresa}, ${fkComponente})
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
function getComponentesPorMaquina(idMaquina) {
  console.log("[MODEL] - function getComponentesPorMaquina():", idMaquina);
  var instrucaoSql = `
        SELECT
            MC.idMaquinaComponente,
            C.tipoComponente,
            MC.origemParametro
        FROM MaquinaComponente AS MC
        JOIN Componente AS C ON MC.fkComponente = C.idComponente
        WHERE MC.fkMaquina = ${idMaquina};
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
        SELECT
            C.tipoComponente,
            CONCAT(COALESCE(PP.limite, 0), ' ', C.unidadeMedida) AS valorFormatado
        FROM Componente AS C
        LEFT JOIN ParametroPadrao AS PP 
            ON C.idComponente = PP.fkComponente AND PP.fkEmpresa = ${fkEmpresa};
    `;

  console.log(
    "Executando a instrução SQL de busca de Parâmetros Padrão: \n" +
      instrucaoSql
  );
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

function eliminarMaquina(idMaquina) {
  console.log("[MODEL] - function eliminarMaquina():", idMaquina);

  var instrucaoSql = `
        Delete from Maquina where idMaquina = ${idMaquina};
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
        M.idMaquina, 
        M.nome, 
        IFNULL(M.hostname, 'Aguardando Captura') AS hostname, 
        IFNULL(M.modelo, 'Não Especificado') AS modelo, 
        IFNULL(M.status, 'Aguardando') AS status, 
        IFNULL(M.sistemaOperacional, 'Capturando SO') AS sistemaOperacional, 
        IFNULL(M.macAddress, 'MAC Ausente') AS macAddress, 
        IFNULL(M.ip, 'Aguardando IP') AS ip,
        MAX(MC.origemParametro) AS origemParametro 
    FROM Maquina AS M
    LEFT JOIN MaquinaComponente AS MC ON M.idMaquina = MC.fkMaquina
    WHERE M.fkEmpresa = ${fkEmpresa}
      AND (M.${condicao} LIKE '%${termoDePesquisa}%' OR M.${condicao} = '${termoDePesquisa}')
    GROUP BY M.idMaquina
    ORDER BY M.idMaquina ASC
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
function buscarMaquinaPorId(idMaquina) {
  console.log(
    "[MODEL] - Buscando dados de identificação da máquina:",
    idMaquina
  );

  var instrucaoSql = `
        SELECT
            idMaquina,
            nome,
            IFNULL(modelo, 'Não Especificado') AS modelo,
            IFNULL(macAddress, 'MAC Ausente') AS macAddress
        FROM Maquina
        WHERE idMaquina = ${idMaquina};
    `;

  console.log("Executando a instrução SQL: \n" + instrucaoSql);

  return database.executar(instrucaoSql);
}

function buscarComponentesComParametros(idMaquina) {
  console.log(
    "[MODEL] - Buscando componentes e parâmetros da máquina:",
    idMaquina
  );

  var instrucaoSql = `
        SELECT
            MC.idMaquinaComponente,
            MC.origemParametro,
            C.tipoComponente,
            C.unidadeMedida,
            PE.limite AS limiteNumerico
        FROM MaquinaComponente AS MC
        JOIN Componente AS C 
            ON MC.fkComponente = C.idComponente
        LEFT JOIN ParametroEspecifico AS PE 
            ON MC.idMaquinaComponente = PE.fkMaquinaComponente
        WHERE MC.fkMaquina = ${idMaquina};
    `;

  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function atualizarDadosMaquina(idMaquina, nome, macAddress) {
  console.log(
    "[MODEL] - function atualizarDadosMaquina():",
    idMaquina,
    nome,
    macAddress
  );

  var instrucaoSql = `
        UPDATE Maquina SET 
          nome = '${nome}', 
          macAddress = '${macAddress}'
        WHERE idMaquina = ${idMaquina};
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function atualizarOrigemComponente(fkMaquinaComponente, novaOrigem) {
  console.log(
    "[MODEL] - function atualizarOrigemComponente():",
    fkMaquinaComponente,
    novaOrigem
  );

  var instrucaoSql = `
        UPDATE MaquinaComponente SET 
          origemParametro = '${novaOrigem}'
        WHERE idMaquinaComponente = ${fkMaquinaComponente};
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function atualizarParametroEspecifico(limite, fkMaquinaComponente) {
  console.log(
    "[MODEL] - function atualizarParametroEspecifico(): (UPSERT)",
    limite,
    fkMaquinaComponente
  );

  var instrucaoSql = `
        REPLACE INTO ParametroEspecifico (fkMaquinaComponente, limite) VALUES 
        (${fkMaquinaComponente}, ${limite})
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function removerParametroEspecifico(fkMaquinaComponente) {
  console.log(
    "[MODEL] - function removerParametroEspecifico():",
    fkMaquinaComponente
  );

  var instrucaoSql = `
        DELETE FROM ParametroEspecifico 
        WHERE fkMaquinaComponente = ${fkMaquinaComponente};
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

module.exports = {
  cadastrarMaquina,
  cadastrarParametroPadrao,
  cadastrarMaquinaComponente,
  cadastrarParametroEspecifico,

  getFkMaquinaComponente,
  getFkEmpresa,
  getSenha,
  getParametrosPadrao,
  getComponentesPorMaquina,
  listarMaquinasPorEmpresa,
  contarMaquinasPorEmpresa,
  buscarMaquinaPorId,
  buscarComponentesComParametros,

  atualizarDadosMaquina,
  atualizarOrigemComponente,
  atualizarParametroEspecifico,

  removerParametroEspecifico,
  eliminarMaquina,
  eliminarRegistros,
  eliminarAlertas,
  excluirParametroEspecifico,
};
