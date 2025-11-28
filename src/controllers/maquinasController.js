const maquinasModel = require('../models/maquinasModel');
const bcrypt = require('bcryptjs');

async function getParametrosPadrao(req, res) {
  const idFuncionario = req.params.idFuncionario;

  if (!idFuncionario) {
    return res.status(400).send('ID do funcionário é obrigatório para buscar os parâmetros.');
  }

  try {
    const resultadoBusca = await maquinasModel.getFkEmpresa(idFuncionario);
    if (resultadoBusca.length === 0) {
      return res.status(404).send('Empresa não encontrada para o funcionário.');
    }
    const fkEmpresa = resultadoBusca[0].fkEmpresa;

    const resultadosParametros = await maquinasModel.getParametrosPadrao(fkEmpresa);

    const dadosReestruturados = processarParametros(resultadosParametros);

    res.status(200).json(dadosReestruturados);
  } catch (erro) {
    console.error(`Houve um erro ao buscar os parâmetros padrão. Erro: ${erro.message}`);
    res.status(500).json({
      mensagem: 'Erro interno ao buscar os parâmetros da empresa.',
      detalhe: erro.message,
    });
  }
}

function processarParametros(resultadosDB) {
  const dados = {
    oberon: {},
    empresa: {},
  };

  resultadosDB.forEach((parametro) => {
    const origem = parametro.origemParametro.toLowerCase();

    const chaveInterna = `${parametro.tipoComponete}_${parametro.identificador}`
      .toUpperCase()
      .replace(/\s+/g, '_');

    if (dados.hasOwnProperty(origem)) {
      dados[origem][chaveInterna] = {
        limite: parametro.limite,
        idParametro: parametro.idParametro,
        fkEmpresa: parametro.fkEmpresa,
        tipoComponete: parametro.tipoComponete,
        identificador: parametro.identificador,
      };
    }
  });

  return dados;
}

async function salvarPadrao(req, res) {
  const { fkFuncionario, limites } = req.body;

  if (!fkFuncionario || !limites || limites.length === 0) {
    return res.status(400).send('Dados de configuração inválidos ou incompletos.');
  }

  try {
    const resultadoBusca = await maquinasModel.getFkEmpresa(fkFuncionario);
    if (resultadoBusca.length === 0) {
      return res.status(404).send('Empresa não encontrada para o funcionário.');
    }
    const fkEmpresa = resultadoBusca[0].fkEmpresa;

    const COMPONENTES_MAP = {
      CPU: 1,
      RAM: 2,
      'Disco Duro': 3,
      PlacaRede: 4,
    };

    const promises = limites.map((limite) => {
      const fkComponente = COMPONENTES_MAP[limite.tipo];

      if (!fkComponente) {
        console.warn(`Tipo de componente não mapeado: ${limite.tipo}`);
        return Promise.resolve();
      }

      return maquinasModel.cadastrarParametroPadrao(limite.limite, fkEmpresa, fkComponente);
    });

    await Promise.all(promises);

    res.status(200).json({
      mensagem: 'Parâmetros padrão da empresa atualizados com sucesso.',
    });
  } catch (erro) {
    console.error(
      `\nHouve um erro ao salvar os parâmetros padrão. Erro: ${erro.sqlMessage || erro.message}`,
    );
    res.status(500).json({
      mensagem: 'Erro interno no servidor ao salvar a configuração.',
      detalhe: erro.sqlMessage || erro.message,
    });
  }
}

async function cadastrarMaquina(req, res) {
  const {
    idFuncionario: idFuncionario,
    nome: nome,
    macAddress: macAddress,
    origemParametro: origemParametro,
    cpu_parametros: cpu_parametros,
    ram_parametros: ram_parametros,
    disco_parametros: disco_parametros,
    rede_parametros: rede_parametros,
  } = req.body;

  try {
    const resultadoBusca = await maquinasModel.getFkEmpresa(idFuncionario);

    if (resultadoBusca.length === 0) {
      return res.status(404).send('Empresa não encontrada para o funcionário informado.');
    }
    const fkEmpresa = resultadoBusca[0].fkEmpresa;
    if (origemParametro === 'ESPECÍFICO') {
      const resultadoMaquina = await maquinasModel.cadastrarMaquinaEspecifica(
        fkEmpresa,
        idFuncionario,
        nome,
        macAddress,
        cpu_parametros,
        ram_parametros,
        disco_parametros,
        rede_parametros,
      );
    } else {
      const resultadoMaquina = await maquinasModel.cadastrarMaquinaPadrao(
        fkEmpresa,
        idFuncionario,
        nome,
        macAddress,
        origemParametro,
      );
    }
    res.status(201).json({
      mensagem: 'Máquina, componentes e parâmetros cadastrados com sucesso!',
    });
  } catch (erro) {
    console.error(
      `\nHouve um erro ao realizar o cadastro da máquina. Erro: ${erro.sqlMessage || erro.message}`,
    );
    res.status(500).json({
      mensagem: 'Erro interno no servidor ao cadastrar a máquina.',
      detalhe: erro.sqlMessage || erro.message,
    });
  }
}

async function excluirMaquina(req, res) {
  const idMaquinaServer = req.params.idMaquina;
  const idGerenteServer = req.body.idGerente;
  const senhaServer = req.body.senha;

  if (!idMaquinaServer) {
    return res.status(400).send('O ID da máquina é obrigatório na rota.');
  }
  if (!idGerenteServer) {
    return res.status(400).send('O ID do gerente é obrigatório no corpo da requisição.');
  }
  if (!senhaServer) {
    return res.status(400).send('A senha é obrigatória.');
  }

  try {
    const resultadoBusca = await maquinasModel.getFkEmpresa(idGerenteServer);

    if (resultadoBusca.length === 0) {
      return res.status(403).send('Gerente não encontrado ou sem permissão de acesso à empresa.');
    }
    const fkEmpresa = resultadoBusca[0].fkEmpresa;

    const senhaBanco = await maquinasModel.getSenha(idGerenteServer);

    if (!senhaBanco || senhaBanco.length === 0) {
      return res.status(401).send('Credenciais inválidas.');
    }

    const senhaCorreta = await bcrypt.compare(senhaServer, senhaBanco[0].senha);

    if (!senhaCorreta) {
      return res.status(401).send('Credenciais inválidas.');
    }

    const resultadoExclusao = await maquinasModel.eliminarMaquina(idMaquinaServer, idGerenteServer);

    return res.status(200).send(`Máquina de ID ${idMaquinaServer} excluída com sucesso!`);
  } catch (erro) {
    console.error(`\nHouve um erro ao excluir a máquina. Erro: ${erro.sqlMessage || erro.message}`);
    res.status(500).json({
      mensagem: 'Erro interno no servidor ao excluir a máquina.',
      detalhe: erro.sqlMessage || erro.message,
    });
  }
}

async function listarMaquinas(req, res) {
  const idGerenteServer = req.query.idGerente;
  const pagina = parseInt(req.query.pagina);
  const limite = parseInt(req.query.limite);
  const termoDePesquisa = req.query.termoDePesquisa;
  const condicao = req.query.valorParametro;

  if (!idGerenteServer) {
    return res.status(400).send('O ID do gerente é obrigatório na URL (Query String).');
  }

  try {
    const resultadoBusca = await maquinasModel.getFkEmpresa(idGerenteServer);
    if (resultadoBusca.length === 0) {
      return res.status(403).send('Gerente não encontrado ou sem permissão de acesso.');
    }
    const fkEmpresa = resultadoBusca[0].fkEmpresa;

    const offset = (pagina - 1) * limite;

    const [dadosResultado, countResultado] = await Promise.all([
      maquinasModel.listarMaquinasPorEmpresa(fkEmpresa, limite, offset, condicao, termoDePesquisa),
      maquinasModel.contarMaquinasPorEmpresa(fkEmpresa, condicao, termoDePesquisa),
    ]);

    const totalRegistros = countResultado.length > 0 ? countResultado[0].totalRegistros : 0;

    const dados = dadosResultado || [];

    const totalPaginas = Math.ceil(totalRegistros / limite);

    return res.status(200).json({
      dados,
      paginaAtual: pagina,
      totalRegistros,
      totalPaginas,
      limite,
    });
  } catch (erro) {
    console.error(
      `\nHouve um erro ao listar as máquinas. Erro: ${erro.sqlMessage || erro.message}`,
    );
    res.status(500).json({
      mensagem: 'Erro interno no servidor ao listar máquinas.',
      detalhe: erro.sqlMessage || erro.message,
    });
  }
}

async function buscarDadosParaEdicao(req, res) {
  const idMaquina = req.params.idMaquina;

  if (!idMaquina) {
    return res.status(400).send('ID da máquina não fornecido.');
  }

  try {
    const maquina = await maquinasModel.buscarMaquinaPorId(idMaquina);
    const componentes = await maquinasModel.buscarComponentesComParametros(idMaquina);

    if (maquina.length === 0) {
      return res.status(404).send('Máquina não encontrada.');
    }

    const parametrosComponentesProcessados = processarComponentes(componentes);

    res.status(200).json({
      maquina: maquina[0], // Dados da máquina
      parametros_por_componente: parametrosComponentesProcessados, // Parâmetros agrupados
    });
  } catch (erro) {
    console.error(`Erro ao buscar dados para edição: ${erro.message}`);
    res.status(500).json({
      mensagem: 'Erro interno ao buscar dados da máquina.',
      detalhe: erro.message,
    });
  }
}

function processarComponentes(componentes) {
  const parametrosAgrupados = {};

  componentes.forEach((componente) => {
    const tipoComponenteCru = componente.funcaoMonitorar.split(' ')[0];
    const tipoComponente = tipoComponenteCru.toUpperCase();

    const identificador = componente.identificador.toUpperCase();

    const parametroInfo = {
      limite: componente.limite,
      unidadeMedida: componente.unidadeMedida,
      idComponente: componente.idComponente,
    };

    if (!parametrosAgrupados[tipoComponente]) {
      parametrosAgrupados[tipoComponente] = {};
    }

    parametrosAgrupados[tipoComponente][identificador] = parametroInfo;
  });

  return parametrosAgrupados;
}

async function atualizarMaquina(req, res) {
  const {
    idMaquina,
    idFuncionario,
    nome,
    macAddress,
    origemParametro,
    cpu_parametros,
    ram_parametros,
    disco_parametros,
    rede_parametros,
  } = req.body;

  if (!nome || !macAddress || !idMaquina || !idFuncionario || !origemParametro) {
    return res
      .status(400)
      .send('Dados básicos (ID Máquina, Funcionário, Nome, MAC e Origem) são obrigatórios.');
  }

  try {
    const PARAMETROS_ENTRADA = {
      CPU: cpu_parametros,
      RAM: ram_parametros,
      DISCO: disco_parametros,
      REDE: rede_parametros,
    };

    await maquinasModel.atualizarDadosMaquina(idMaquina, nome, macAddress, idFuncionario);

    const componentesMaquina = await maquinasModel.getComponentesPorMaquina(idMaquina);
    const promisesAtualizacao = [];

    for (const item of componentesMaquina) {
      const fkComponente = item.idComponente;
      const tipoComponente = item.tipoComponete;
      const limitesDoComponente = PARAMETROS_ENTRADA[tipoComponente];

      promisesAtualizacao.push(
        maquinasModel.atualizarOrigemComponente(fkComponente, origemParametro, idFuncionario),
      );

      if (origemParametro === 'ESPECIFICO') {
        if (limitesDoComponente) {
          promisesAtualizacao.push(
            maquinasModel.atualizarParametrosEspecificos(
              fkComponente,
              idFuncionario,
              limitesDoComponente.aceitavel,
              limitesDoComponente.atencao,
              limitesDoComponente.critico,
            ),
          );
        }
      } else {
        promisesAtualizacao.push(maquinasModel.removerParametroEspecifico(fkComponente));
      }
    }

    await Promise.all(promisesAtualizacao);

    res.status(200).json({
      mensagem: `Máquina ${idMaquina} e parâmetros atualizados para o modelo ${origemParametro} com sucesso!`,
    });
  } catch (erro) {
    console.error(
      `\nHouve um erro ao realizar a atualização da máquina ${idMaquina}. Erro: ${erro.sqlMessage || erro.message}`,
    );
    res.status(500).json({
      mensagem: 'Erro interno no servidor ao atualizar a máquina.',
      detalhe: erro.sqlMessage || erro.message,
    });
  }
}

module.exports = {
  cadastrarMaquina,

  listarMaquinas,
  getParametrosPadrao,
  buscarDadosParaEdicao,

  salvarPadrao,
  atualizarMaquina,

  excluirMaquina,
};
