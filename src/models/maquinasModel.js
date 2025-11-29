var database = require('../database/config');

function cadastrarMaquina(nome, modelo, macAddress, fkEmpresa) {
  console.log('[MODEL] - function cadastrarMaquina():', nome, modelo, macAddress, fkEmpresa);

  var instrucaoSql = `
        INSERT INTO Maquina (nome, modelo, macAddress, status, fkEmpresa) VALUES 
        ('${nome}', null, '${macAddress}', 'Aguardando' , ${fkEmpresa})
    `;
  console.log('Executando a instrução SQL: \n' + instrucaoSql);
  return database.executar(instrucaoSql);
}
function cadastrarMaquinaComponente(fkMaquina, fkComponente, origemParametro) {
  console.log(
    '[MODEL] - function cadastrarMaquinaComponente():',
    fkMaquina,
    fkComponente,
    origemParametro,
  );

  var instrucaoSql = `
        INSERT INTO MaquinaComponente (fkMaquina, fkComponente, origemParametro) VALUES 
        (${fkMaquina}, ${fkComponente}, '${origemParametro}')
    `;
  console.log('Executando a instrução SQL: \n' + instrucaoSql);
  return database.executar(instrucaoSql);
}
function cadastrarParametroEspecifico(limite, fkMaquinaComponente) {
  console.log('[MODEL] - function cadastrarParametroEspecifico():', limite, fkMaquinaComponente);

  var instrucaoSql = `
        INSERT INTO ParametroEspecifico (limite, fkMaquinaComponente) VALUES 
        (${limite}, ${fkMaquinaComponente})
    `;
  console.log('Executando a instrução SQL: \n' + instrucaoSql);
  return database.executar(instrucaoSql);
}
function cadastrarParametroPadrao(limite, fkEmpresa, fkComponente) {
  console.log('[MODEL] - function cadastrarParametro():', limite, fkEmpresa, fkComponente);

  var instrucaoSql = `
        REPLACE INTO ParametroPadrao (limite, fkEmpresa, fkComponente)
         VALUES (${limite}, ${fkEmpresa}, ${fkComponente})
    `;
  console.log('Executando a instrução SQL: \n' + instrucaoSql);
  return database.executar(instrucaoSql);
}

function getFkMaquinaComponente(fkMaquina) {
  console.log('[MODEL] - function getFkMaquinaComponente():', fkMaquina);
  var instrucaoSql = `
        SELECT idMaquinaComponente from MaquinaComponente where fkMaquina = ${fkMaquina};
    `;
  console.log('Executando a instrução SQL: \n' + instrucaoSql);
  return database.executar(instrucaoSql);
}
function getComponentesPorMaquina(idMaquina) {
  console.log('[MODEL] - function getComponentesPorMaquina():', idMaquina);
  var instrucaoSql = `
        SELECT
            MC.idComponente,
            C.tipoComponete,
            MC.origemParametro
        FROM Componente AS MC
        JOIN TipoComponente AS C ON MC.fkTipoComponente = C.idTipoComponente
        WHERE MC.fkMaquina = ${idMaquina};
    `;

  console.log('Executando a instrução SQL: \n' + instrucaoSql);
  return database.executar(instrucaoSql);
}

function getFkEmpresa(idFuncionario) {
  console.log('[MODEL] - function getFkEmpresa():', idFuncionario);
  var instrucaoSql = `
        SELECT fkEmpresa FROM Funcionario WHERE idFuncionario = ${idFuncionario};
    `;
  console.log('Executando a instrução SQL: \n' + instrucaoSql);
  return database.executar(instrucaoSql);
}

function getSenha(idFuncionario) {
  console.log('[MODEL] - function getSenha():', idFuncionario);
  var instrucaoSql = `
        SELECT senha from Funcionario where idFuncionario = ${idFuncionario};
    `;
  console.log('Executando a instrução SQL: \n' + instrucaoSql);
  return database.executar(instrucaoSql);
}
function getParametrosPadrao(fkEmpresa) {
  console.log('[MODEL] - function getParametrosPadrao():', fkEmpresa);

  var instrucaoSql = `
SELECT
    P.idParametro,
    P.fkEmpresa,
    P.origemParametro,
    TC.tipoComponete,
    P.identificador,
    P.limite
FROM
    Parametro AS P
JOIN
    TipoComponente AS TC ON P.fkTipoComponente = TC.idTipoComponente
WHERE
    P.fkComponente IS NULL
    AND (
        (P.origemParametro = 'EMPRESA' AND P.fkEmpresa = 2)
    )
UNION ALL
SELECT
    P.idParametro,
    P.fkEmpresa,
    P.origemParametro,
    TC.tipoComponete,
    P.identificador,
    P.limite
FROM
    Parametro AS P
JOIN
    TipoComponente AS TC ON P.fkTipoComponente = TC.idTipoComponente
WHERE
    P.fkComponente IS NULL
    
    AND P.origemParametro = 'OBERON' AND P.fkEmpresa = 1;
    -- NOTA: Se OBERON tiver um ID fixo, use: AND P.fkEmpresa = 1
    `;

  console.log('Executando a instrução SQL de busca de Parâmetros Padrão: \n' + instrucaoSql);
  return database.executar(instrucaoSql);
}

function excluirParametroEspecifico(fkMaquinaComponente) {
  console.log('[MODEL] - function getParametrosEspecifico():', fkEmpresa);
  var instrucaoSql = `
        DELETE from MaquinaComponente where fkMaquinaComponente = ${fkMaquinaComponente}
    `;
  console.log('Executando a instrução SQL: \n' + instrucaoSql);
  return database.executar(instrucaoSql);
}

function eliminarMaquina(idMaquina, idFuncionario) {
  console.log('[MODEL] - function eliminarMaquina():', idMaquina);
  var instrucaoSql = `
        SET @USUARIO_LOGADO = ${idFuncionario};
        Delete from Maquina where idMaquina = ${idMaquina};
    `;
  console.log('Executando a instrução SQL: \n' + instrucaoSql);
  return database.executar(instrucaoSql);
}

function eliminarRegistros(fkMaquinaComponente) {
  console.log('[MODEL] - function eliminarRegistros():', fkMaquinaComponente);

  var instrucaoSql = `
        Delete from Registro where fkMaquinaComponente = ${fkMaquinaComponente};
    `;
  console.log('Executando a instrução SQL: \n' + instrucaoSql);
  return database.executar(instrucaoSql);
}

function eliminarAlertas(fkMaquinaComponente) {
  console.log('[MODEL] - function eliminarAlertas():', fkMaquinaComponente);

  var instrucaoSql = `
        Delete from Alerta where fkMaquinaComponente = ${fkMaquinaComponente};
    `;
  console.log('Executando a instrução SQL: \n' + instrucaoSql);
  return database.executar(instrucaoSql);
}

function listarMaquinasPorEmpresa(fkEmpresa, limite, offset, condicao, termoDePesquisa) {
  console.log(
    '[MODEL] - function listarMaquinasPorEmpresa():',
    `Empresa: ${fkEmpresa}, Limite: ${limite}, Offset: ${offset}, Condicao: ${condicao}, termo:${termoDePesquisa}`,
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
    LEFT JOIN Componente AS MC ON M.idMaquina = MC.fkMaquina
    WHERE M.fkEmpresa = ${fkEmpresa}
      AND (M.${condicao} LIKE '%${termoDePesquisa}%' OR M.${condicao} = '${termoDePesquisa}')
    GROUP BY M.idMaquina
    ORDER BY M.idMaquina ASC
    LIMIT ${limite}
    OFFSET ${offset}
`;

  console.log('Executando a instrução SQL de DADOS: \n' + instrucaoDadosSql);

  return database.executar(instrucaoDadosSql);
}

function contarMaquinasPorEmpresa(fkEmpresa, condicao, termoDePesquisa) {
  console.log(
    '[MODEL] - function contarMaquinasPorEmpresa():',
    `Empresa: ${fkEmpresa}`,
    `Termo: ${termoDePesquisa}`,
  );

  var instrucaoCountSql = `
        SELECT COUNT(idMaquina) AS totalRegistros FROM Maquina
        WHERE fkEmpresa = ${fkEmpresa} AND (${condicao} LIKE '%${termoDePesquisa}%'
          OR ${condicao} = '${termoDePesquisa}')
    `;

  console.log('Executando a instrução SQL de COUNT: \n' + instrucaoCountSql);

  return database.executar(instrucaoCountSql);
}
function buscarMaquinaPorId(idMaquina) {
  console.log('[MODEL] - Buscando dados de identificação da máquina:', idMaquina);

  var instrucaoSql = `
        SELECT
            idMaquina,
            nome,
            IFNULL(modelo, 'Não Especificado') AS modelo,
            IFNULL(macAddress, 'MAC Ausente') AS macAddress
        FROM Maquina
        WHERE idMaquina = ${idMaquina};
    `;

  console.log('Executando a instrução SQL: \n' + instrucaoSql);

  return database.executar(instrucaoSql);
}

function buscarComponentesComParametros(idMaquina) {
  console.log('[MODEL] - Buscando componentes e parâmetros da máquina:', idMaquina);

  var instrucaoSql = `
        select * from vw_ParametrosComponente where idMaquina = ${idMaquina};

    `;

  console.log('Executando a instrução SQL: \n' + instrucaoSql);
  return database.executar(instrucaoSql);
}

function atualizarDadosMaquina(idMaquina, nome, macAddress, idFuncionario) {
  console.log('[MODEL] - function atualizarDadosMaquina():', idMaquina, nome, macAddress);

  var instrucaoSql = `
        UPDATE Maquina SET 
          nome = '${nome}', 
          macAddress = '${macAddress}', 
          fkEditadoPor = ${idFuncionario}
        WHERE idMaquina = ${idMaquina};
    `;
  console.log('Executando a instrução SQL: \n' + instrucaoSql);
  return database.executar(instrucaoSql);
}

function atualizarOrigemComponente(fkMaquinaComponente, novaOrigem, idFuncionario) {
  console.log('[MODEL] - function atualizarOrigemComponente():', fkMaquinaComponente, novaOrigem);

  var instrucaoSql = `
        UPDATE Componente SET 
          origemParametro = '${novaOrigem}', 
          fkEditadoPor = ${idFuncionario}
        WHERE idComponente = ${fkMaquinaComponente};
    `;
  console.log('Executando a instrução SQL: \n' + instrucaoSql);
  return database.executar(instrucaoSql);
}

function atualizarParametroEspecifico(limite, fkMaquinaComponente) {
  console.log(
    '[MODEL] - function atualizarParametroEspecifico(): (UPSERT)',
    limite,
    fkMaquinaComponente,
  );

  var instrucaoSql = `
        REPLACE INTO ParametroEspecifico (fkMaquinaComponente, limite) VALUES 
        (${fkMaquinaComponente}, ${limite})
    `;
  console.log('Executando a instrução SQL: \n' + instrucaoSql);
  return database.executar(instrucaoSql);
}

function removerParametroEspecifico(fkMaquinaComponente) {
  console.log('[MODEL] - function removerParametroEspecifico():', fkMaquinaComponente);

  var instrucaoSql = `
        DELETE FROM Parametro 
        WHERE fkComponente = ${fkMaquinaComponente};
    `;
  console.log('Executando a instrução SQL: \n' + instrucaoSql);
  return database.executar(instrucaoSql);
}
function getParametrosEspecificos(fkMaquinaComponente) {
  console.log('[MODEL] - function getParametrosEspecificos():', fkMaquinaComponente);
  var instrucaoSql = `
        SELECT idParametro from ParametroEspecifico where fkMaquinaComponente = ${fkMaquinaComponente};
    `;
  console.log('Executando a instrução SQL: \n' + instrucaoSql);
  return database.executar(instrucaoSql);
}
function eliminarMaquinaComponente(idMaquina) {
  console.log('[MODEL] - function eliminarMaquinaComponente():', idMaquina);
  var instrucaoSql = `
       DELETE FROM MaquinaComponente where fkMaquina  = ${idMaquina};
    `;
  console.log('Executando a instrução SQL: \n' + instrucaoSql);
  return database.executar(instrucaoSql);
}

function cadastrarMaquinaEspecifica(
  fkEmpresa,
  idFuncionario,
  nome,
  macAddress,
  cpu_parametros,
  ram_parametros,
  disco_parametros,
  rede_parametros,
) {
  var instrucaoSql = `
       CALL sp_cadastro_especifico(
    ${fkEmpresa}, ${idFuncionario}, 
    '${nome}', '${macAddress}', 
    -- CPU (Aceitável, Atenção, Crítico)
    ${cpu_parametros.aceitavel}, ${cpu_parametros.atencao}, ${cpu_parametros.critico},
    -- RAM (Aceitável, Atenção, Crítico)
    ${ram_parametros.aceitavel}, ${ram_parametros.atencao}, ${ram_parametros.critico},
    -- DISCO (Aceitável, Atenção, Crítico)
    ${disco_parametros.aceitavel}, ${disco_parametros.atencao}, ${disco_parametros.critico},
    -- REDE (Aceitável, Atenção, Crítico)
    ${disco_parametros.aceitavel}, ${disco_parametros.atencao}, ${disco_parametros.critico});
    `;

  console.log('Executando a instrução SQL: \n' + instrucaoSql);
  return database.executar(instrucaoSql);
}

function cadastrarMaquinaPadrao(fkEmpresa, idFuncionario, nome, macAddress, origemParametro) {
  var instrucaoSql = `
       CALL sp_cadastro_padrao(
    ${fkEmpresa}, ${idFuncionario}, 
    '${nome}', '${macAddress}', 
    '${origemParametro}');
    `;

  console.log('Executando a instrução SQL: \n' + instrucaoSql);
  return database.executar(instrucaoSql);
}

function atualizarParametrosEspecificos(fkComponente, idFuncionario, aceitavel, atencao, critico) {
  var instrucaoSql = `
       CALL sp_atualizar_parametros_especificos(
    ${fkComponente}, ${idFuncionario}, 
    ${aceitavel}, ${atencao}, 
    ${critico});
    `;

  console.log('Executando a instrução SQL: \n' + instrucaoSql);
  return database.executar(instrucaoSql);
}

module.exports = {
  cadastrarMaquinaEspecifica,
  cadastrarMaquinaPadrao,
  atualizarParametrosEspecificos,

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
  getParametrosEspecificos,

  atualizarDadosMaquina,
  atualizarOrigemComponente,
  atualizarParametroEspecifico,

  removerParametroEspecifico,
  eliminarMaquina,
  eliminarRegistros,
  eliminarAlertas,
  excluirParametroEspecifico,
  eliminarMaquinaComponente,
};
