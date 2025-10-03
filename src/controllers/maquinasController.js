const maquinasModel = require("../models/maquinasModel");

const ID_CPU = 1;
const ID_MEMORIA = 2;
const ID_DISCO = 3;
const ID_REDE = 4;

async function getParametrosPadrao(req, res) {
  const idFuncionarioServer = req.params.idFuncionario;
  if (!idFuncionarioServer) {
    return res.status(400).send("O ID do funcionario (idFuncionarioServer) é obrigatório!");
  }
  try {
    const resultadoBusca = await maquinasModel.getFkEmpresa(idFuncionario);
    if (resultadoBusca.length === 0) {
      return res.status(404).send("Empresa não encontrada.");
    }
    const fkEmpresa = resultadoBusca[0].fkEmpresa;

    const resultado = await maquinasModel.getParametrosPadrao(fkEmpresa);

    if (resultado.length === 0) {
      return res.status(204).send("Nenhum parâmetro padrão encontrado para esta empresa.");
    }
    res.status(200).json(resultado);

  } catch (erro) {
    console.error(`\nHouve um erro ao buscar os parâmetros padrão. Erro: ${erro.sqlMessage || erro.message}`);
    res.status(500).json({
      mensagem: "Erro interno no servidor ao buscar parâmetros.",
      detalhe: erro.sqlMessage || erro.message
    });
  }
}

async function cadastrarMaquina(req, res) {

  const {
    nomeServer: nome,
    modeloServer: modelo,
    macAdressServer: macAdress,
    idFuncionarioServer: idFuncionario
  } = req.body;

  const limiteParametro = req.body.limiteParametroServer;

  try {
    const resultadoBusca = await maquinasModel.getFkEmpresa(idFuncionario);
    if (resultadoBusca.length === 0) {
      return res.status(404).send("Empresa não encontrada.");
    }
    const fkEmpresa = resultadoBusca[0].fkEmpresa;

    const resultadoMaquina = await maquinasModel.cadastrarMaquina(nome, modelo, macAdress, fkEmpresa);

    const fkMaquina = resultadoMaquina.insertId;

    const componentesACadastrar = [ID_CPU, ID_MEMORIA, ID_DISCO, ID_REDE];

    const promisesComponentes = componentesACadastrar.map(fkComponente => {
      return maquinasModel.cadastrarMaquinaComponente(fkMaquina, fkComponente);
    });

    const resultadosComponentes = await Promise.all(promisesComponentes);

    if (limiteParametro && resultadosComponentes.length > 0) {

      const fkMaquinaComponente = resultadosComponentes[0].insertId;

      await maquinasModel.cadastrarParametro(
        limiteParametro,
        fkEmpresa,
        fkMaquinaComponente
      );
    }
    res.status(201).json({ mensagem: "Máquina, componentes e parâmetros cadastrados com sucesso!" });

  } catch (erro) {
    console.error(`\nHouve um erro ao realizar o cadastro da máquina. Erro: ${erro.sqlMessage || erro.message}`);
    res.status(500).json({
      mensagem: "Erro interno no servidor ao cadastrar a máquina.",
      detalhe: erro.sqlMessage || erro.message
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
    return res.status(400).send("O ID do gerente é obrigatório no corpo da requisição.");
  }
  if (!senhaServer) {
    return res.status(400).send("A senha é obrigatória.");
  }

  try {
    const resultadoBusca = await maquinasModel.getFkEmpresa(idGerenteServer);
    
    if (resultadoBusca.length === 0) {
      return res.status(403).send("Gerente não encontrado ou sem permissão de acesso à empresa.");
    }
    const fkEmpresa = resultadoBusca[0].fkEmpresa;
    
    const senhaBanco = await maquinasModel.getSenha(idGerenteServer);

    if (!senhaBanco || senhaBanco.length === 0) {
      return res.status(404).send("Dados do gerente inválidos ou incompletos.");
    }

    const senhaBancoHash = senhaBanco[0].senha; 

    if (senhaBancoHash !== senhaServer) { 
      return res.status(401).send("Credenciais inválidas. Senha não confere.");
    }

    const maquinasComponentes = await maquinasModel.getFkMaquinaComponente(idMaquinaServer); 
    
    const promisesExclusao = [];
    
    const promisesBuscaParametros = maquinasComponentes.map(async ID => {
        const parametroEspecifico = await maquinasModel.getParametrosEspecificos(ID.idMaquinaComponente); 

        promisesExclusao.push(maquinasModel.eliminarRegistros(ID.idMaquinaComponente)); 
        promisesExclusao.push(maquinasModel.eliminarAlertas(ID.idMaquinaComponente));

        if (parametroEspecifico && parametroEspecifico.length > 0) {
            promisesExclusao.push(maquinasModel.excluirParametroEspecifico(ID.idMaquinaComponente));
        }
    });

    await Promise.all(promisesBuscaParametros);

    await Promise.all(promisesExclusao);

    const resultadoExclusao = await maquinasModel.eliminarMaquina(idMaquinaServer);
    
    if (resultadoExclusao.affectedRows === 0) {
      return res.status(500).send("A máquina não foi excluída, mas os dados relacionados foram.");
    }

    return res.status(200).send(`Máquina de ID ${idMaquinaServer} excluída com sucesso!`);

  } catch (erro) {
    console.error(`\nHouve um erro ao excluir a máquina. Erro: ${erro.sqlMessage || erro.message}`);
    res.status(500).json({
      mensagem: "Erro interno no servidor ao excluir a máquina.",
      detalhe: erro.sqlMessage || erro.message
    });
  }
}

module.exports = {
  getParametrosPadrao,
  cadastrarMaquina,
  excluirMaquina
};