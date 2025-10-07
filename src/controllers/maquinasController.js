const maquinasModel = require("../models/maquinasModel");
const bcrypt = require("bcryptjs");

async function getParametrosPadrao(req, res) {
  const idFuncionario = req.params.idFuncionario;

  if (!idFuncionario) {
    return res
      .status(400)
      .send("ID do funcionário é obrigatório para buscar os parâmetros.");
  }

  try {
    const resultadoBusca = await maquinasModel.getFkEmpresa(idFuncionario);
    if (resultadoBusca.length === 0) {
      return res.status(404).send("Empresa não encontrada para o funcionário.");
    }
    const fkEmpresa = resultadoBusca[0].fkEmpresa;

    const resultadosParametros =
      await maquinasModel.getParametrosPadrao(fkEmpresa);

    res.status(200).json(resultadosParametros);
  } catch (erro) {
    console.error(
      `Houve um erro ao buscar os parâmetros padrão. Erro: ${erro.message}`
    );
    res.status(500).json({
      mensagem: "Erro interno ao buscar os parâmetros da empresa.",
      detalhe: erro.message,
    });
  }
}

async function salvarPadrao(req, res) {
  const { fkFuncionario, limites } = req.body;

  if (!fkFuncionario || !limites || limites.length === 0) {
    return res
      .status(400)
      .send("Dados de configuração inválidos ou incompletos.");
  }

  try {
    const resultadoBusca = await maquinasModel.getFkEmpresa(fkFuncionario);
    if (resultadoBusca.length === 0) {
      return res.status(404).send("Empresa não encontrada para o funcionário.");
    }
    const fkEmpresa = resultadoBusca[0].fkEmpresa;

    const COMPONENTES_MAP = {
      CPU: 1,
      RAM: 2,
      "Disco Duro": 3,
      PlacaRede: 4,
    };

    const promises = limites.map((limite) => {
      const fkComponente = COMPONENTES_MAP[limite.tipo];

      if (!fkComponente) {
        console.warn(`Tipo de componente não mapeado: ${limite.tipo}`);
        return Promise.resolve();
      }

      return maquinasModel.cadastrarParametroPadrao(
        limite.limite,
        fkEmpresa,
        fkComponente
      );
    });

    await Promise.all(promises);

    res.status(200).json({
      mensagem: "Parâmetros padrão da empresa atualizados com sucesso.",
    });
  } catch (erro) {
    console.error(
      `\nHouve um erro ao salvar os parâmetros padrão. Erro: ${erro.sqlMessage || erro.message}`
    );
    res.status(500).json({
      mensagem: "Erro interno no servidor ao salvar a configuração.",
      detalhe: erro.sqlMessage || erro.message,
    });
  }
}

async function cadastrarMaquina(req, res) {
  const {
    idFuncionario: idFuncionario,
    nome: nome,
    modelo: modelo,
    macAddress: macAddress,
    origemParametro: origemParametro,
    limites: limites,
  } = req.body;

  try {
    const resultadoBusca = await maquinasModel.getFkEmpresa(idFuncionario);
    if (resultadoBusca.length === 0) {
      return res
        .status(404)
        .send("Empresa não encontrada para o funcionário informado.");
    }
    const fkEmpresa = resultadoBusca[0].fkEmpresa;

    const resultadoMaquina = await maquinasModel.cadastrarMaquina(
      nome,
      modelo,
      macAddress,
      fkEmpresa
    );
    const fkMaquina = resultadoMaquina.insertId;

    const COMPONENTES_MAP = {
      CPU: 1,
      RAM: 2,
      "Disco Duro": 3,
      PlacaRede: 4,
    };
    const componentesDoFront = limites.map((l) => l.tipo);

    const componentesParaCadastro = [
      COMPONENTES_MAP["CPU"],
      COMPONENTES_MAP["RAM"],
      COMPONENTES_MAP["Disco Duro"],
      COMPONENTES_MAP["PlacaRede"],
    ];

    let componentesCadastrados = [];

    for (const fkComponente of componentesParaCadastro) {
      const resultadoMC = await maquinasModel.cadastrarMaquinaComponente(
        fkMaquina,
        fkComponente,
        origemParametro
      );
      componentesCadastrados.push({
        fkComponente: fkComponente,
        fkMaquinaComponente: resultadoMC.insertId,
      });
    }

    if (origemParametro === "ESPECIFICO" && limites.length > 0) {
      const promisesLimites = limites.map((limiteFront) => {
        const fkComponenteId = COMPONENTES_MAP[limiteFront.tipo];
        const componenteCadastrado = componentesCadastrados.find(
          (c) => c.fkComponente === fkComponenteId
        );

        if (componenteCadastrado) {
          return maquinasModel.cadastrarParametroEspecifico(
            limiteFront.limite,
            componenteCadastrado.fkMaquinaComponente
          );
        }
        return Promise.resolve();
      });
      await Promise.all(promisesLimites);
    }

    res.status(201).json({
      mensagem: "Máquina, componentes e parâmetros cadastrados com sucesso!",
    });
  } catch (erro) {
    console.error(
      `\nHouve um erro ao realizar o cadastro da máquina. Erro: ${erro.sqlMessage || erro.message}`
    );
    res.status(500).json({
      mensagem: "Erro interno no servidor ao cadastrar a máquina.",
      detalhe: erro.sqlMessage || erro.message,
    });
  }
}

async function excluirMaquina(req, res) {
  const idMaquinaServer = req.params.idMaquina;
  const idGerenteServer = req.body.idGerente;
  const senhaServer = req.body.senha;

  if (!idMaquinaServer) {
    return res.status(400).send("O ID da máquina é obrigatório na rota.");
  }
  if (!idGerenteServer) {
    return res
      .status(400)
      .send("O ID do gerente é obrigatório no corpo da requisição.");
  }
  if (!senhaServer) {
    return res.status(400).send("A senha é obrigatória.");
  }

  try {
    const resultadoBusca = await maquinasModel.getFkEmpresa(idGerenteServer);

    if (resultadoBusca.length === 0) {
      return res
        .status(403)
        .send("Gerente não encontrado ou sem permissão de acesso à empresa.");
    }
    const fkEmpresa = resultadoBusca[0].fkEmpresa;

    const senhaBanco = await maquinasModel.getSenha(idGerenteServer);

    if (!senhaBanco || senhaBanco.length === 0) {
      return res.status(401).send("Credenciais inválidas.");
    }

    const senhaCorreta = await bcrypt.compare(senhaServer, senhaBanco[0].senha);

    if (!senhaCorreta) {
      return res.status(401).send("Credenciais inválidas.");
    }

    const maquinasComponentes =
      await maquinasModel.getFkMaquinaComponente(idMaquinaServer);

    const promisesExclusao = [];

    const promisesBuscaParametros = maquinasComponentes.map(async (ID) => {
      const parametroEspecifico = await maquinasModel.getParametrosEspecificos(
        ID.idMaquinaComponente
      );

      promisesExclusao.push(
        maquinasModel.eliminarRegistros(ID.idMaquinaComponente)
      );
      promisesExclusao.push(
        maquinasModel.eliminarAlertas(ID.idMaquinaComponente)
      );

      if (parametroEspecifico && parametroEspecifico.length > 0) {
        promisesExclusao.push(
          maquinasModel.excluirParametroEspecifico(ID.idMaquinaComponente)
        );
      }
    });

    await Promise.all(promisesBuscaParametros);

    await Promise.all(promisesExclusao);
    const resultadoExclusaoComponentes = await maquinasModel.eliminarMaquinaComponente(idMaquinaServer)

    const resultadoExclusao =
      await maquinasModel.eliminarMaquina(idMaquinaServer);

    if (resultadoExclusao.affectedRows === 0) {
      return res
        .status(500)
        .send("A máquina não foi excluída, mas os dados relacionados foram.");
    }

    return res
      .status(200)
      .send(`Máquina de ID ${idMaquinaServer} excluída com sucesso!`);
  } catch (erro) {
    console.error(
      `\nHouve um erro ao excluir a máquina. Erro: ${erro.sqlMessage || erro.message}`
    );
    res.status(500).json({
      mensagem: "Erro interno no servidor ao excluir a máquina.",
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
    return res
      .status(400)
      .send("O ID do gerente é obrigatório na URL (Query String).");
  }

  try {
    const resultadoBusca = await maquinasModel.getFkEmpresa(idGerenteServer);
    if (resultadoBusca.length === 0) {
      return res
        .status(403)
        .send("Gerente não encontrado ou sem permissão de acesso.");
    }
    const fkEmpresa = resultadoBusca[0].fkEmpresa;

    const offset = (pagina - 1) * limite;

    const [dadosResultado, countResultado] = await Promise.all([
      maquinasModel.listarMaquinasPorEmpresa(
        fkEmpresa,
        limite,
        offset,
        condicao,
        termoDePesquisa
      ),
      maquinasModel.contarMaquinasPorEmpresa(
        fkEmpresa,
        condicao,
        termoDePesquisa
      ),
    ]);

    const totalRegistros =
      countResultado.length > 0 ? countResultado[0].totalRegistros : 0;

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
      `\nHouve um erro ao listar as máquinas. Erro: ${erro.sqlMessage || erro.message}`
    );
    res.status(500).json({
      mensagem: "Erro interno no servidor ao listar máquinas.",
      detalhe: erro.sqlMessage || erro.message,
    });
  }
}

async function buscarDadosParaEdicao(req, res) {
  const idMaquina = req.params.idMaquina;

  if (!idMaquina) {
    return res.status(400).send("ID da máquina não fornecido.");
  }

  try {
    const maquina = await maquinasModel.buscarMaquinaPorId(idMaquina);
    const componentes =
      await maquinasModel.buscarComponentesComParametros(idMaquina);

    if (maquina.length === 0) {
      return res.status(404).send("Máquina não encontrada.");
    }

    res.status(200).json({
      maquina: maquina[0],
      componentes: componentes,
    });
  } catch (erro) {
    console.error(`Erro ao buscar dados para edição: ${erro.message}`);
    res.status(500).json({
      mensagem: "Erro interno ao buscar dados da máquina.",
      detalhe: erro.message,
    });
  }
}

async function atualizarMaquina(req, res) {
  const idMaquina = req.params.idMaquina;
  const { nome, macAddress, origemParametro, limites } = req.body;
  if (!nome || !macAddress || !idMaquina) {
    return res
      .status(400)
      .send("Nome, Mac Address e ID da Máquina são obrigatórios.");
  }

  if (origemParametro === "ESPECIFICO" && (!limites || limites.length !== 4)) {
    return res
      .status(400)
      .send(
        "Ao usar limites específicos, todos os 4 tipos de limites devem ser fornecidos."
      );
  }

  try {
    const maquinaAtualizada = await maquinasModel.atualizarDadosMaquina(
      idMaquina,
      nome,
      macAddress
    );

    if (!maquinaAtualizada) {
      return res
        .status(404)
        .send("Máquina não encontrada ou nenhuma alteração na identificação.");
    }

    const COMPONENTES_MAP = {
      CPU: 1,
      RAM: 2,
      DISCO: 3,
      REDE: 4,
    };

    const componentesMaquina =
      await maquinasModel.getComponentesPorMaquina(idMaquina);

    const promisesAtualizacao = [];

    for (const item of componentesMaquina) {
      const fkMaquinaComponente = item.idMaquinaComponente;
      const tipoComponente = item.tipoComponente;

      promisesAtualizacao.push(
        maquinasModel.atualizarOrigemComponente(
          fkMaquinaComponente,
          origemParametro
        )
      );

      if (origemParametro === "ESPECIFICO") {
        const limiteFront = limites.find((l) => l.tipo === tipoComponente);

        if (limiteFront) {
          promisesAtualizacao.push(
            maquinasModel.atualizarParametroEspecifico(
              limiteFront.limite,
              fkMaquinaComponente
            )
          );
        }
      } else {
        promisesAtualizacao.push(
          maquinasModel.removerParametroEspecifico(fkMaquinaComponente)
        );
      }
    }

    await Promise.all(promisesAtualizacao);

    res.status(200).json({
      mensagem: "Máquina e parâmetros de alerta atualizados com sucesso!",
      idMaquina: idMaquina,
    });
  } catch (erro) {
    console.error(
      `\nHouve um erro ao realizar a atualização da máquina ${idMaquina}. Erro: ${erro.sqlMessage || erro.message}`
    );
    res.status(500).json({
      mensagem: "Erro interno no servidor ao atualizar a máquina.",
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
