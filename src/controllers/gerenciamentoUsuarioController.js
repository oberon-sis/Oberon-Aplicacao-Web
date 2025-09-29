var gerenciamentoUsuarioModel = require("../models/gerenciamentoUsuarioModel");


function getUsuariobyID(req, res) {
  var idFuncionario = req.params.idFuncionarioServer;

  if (!idFuncionario) {
    return res.status(400).send("Não foi possível puxar o idFuncionario!");
  }

  gerenciamentoUsuarioModel.getUsuariobyID(idFuncionario)
    .then(function (resultadoAutenticar) {
      if (resultadoAutenticar.length > 0) {
        console.log("Usuário(s) encontrado(s):", resultadoAutenticar);
        res.json(resultadoAutenticar);
      } else {
        res.status(404).send("Usuário não encontrado");
      }
    })
    .catch(function (erro) {
      console.log("\nHouve um erro ao buscar o usuário! Erro: ", erro.sqlMessage || erro.message);
      res.status(500).json(erro.sqlMessage || erro.message);
    });
}


function getTipoUsuario(req, res) {

  gerenciamentoUsuarioModel.getTipoUsuario()
    .then(function (resultado) {
      if (resultado.length > 0) {
        res.status(200).json(resultado);
      } else {
        res.status(204).send("Nenhum tipo de usuário encontrado!");
      }
    })
    .catch(function (erro) {
      console.error("Houve um erro ao listar os tipos de usuário! Erro: ", erro.sqlMessage);
      res.status(500).json(erro.sqlMessage);
    });
}



function salvarEdicao(req, res) {

  var nome = req.body.nomeServer;
  var cpf = req.body.cpfServer;
  var email = req.body.emailServer;
  var fkTipoUsuario = req.body.fkTipoUsuarioServer;
  var senha = req.body.senhaServer;
  var idFuncionario = req.body.idFuncionarioServer;


  gerenciamentoUsuarioModel.salvarEdicao(nome, cpf, email, fkTipoUsuario, senha, idFuncionario)
    .then(function (resultado) {
      if (resultado.affectedRows > 0) {
        res.status(200).json({ mensagem: "Alterações salvas com sucesso!" });
      } else {
        res.status(404).json({ mensagem: "Funcionário não encontrado ou nenhum dado alterado." });
      }
    })
    .catch(function (erro) {
      console.error("Houve um erro ao atualizar o funcionário! Erro: ", erro.sqlMessage);
      res.status(500).json({ erro: erro.sqlMessage });
    });
}



function cadastrar(req, res) {

  var nome = req.body.nomeServer;
  var email = req.body.emailServer;
  var cpf = req.body.cpfServer;
  var fkEmpresa = 0;
  var fkTipoUsuario = req.body.fkTipoUsuarioServer;
  var senha = req.body.senhaServer;
  var idFuncionario = req.body.idFuncionarioServer; // ID do usuário logado


  if (!nome) {
    return res.status(400).send("O campo Nome está vazio ou indefinido!");
  }
  else if (!cpf) {
    return res.status(400).send("O campo CPF/Telefone está vazio ou indefinido!");
  }
  else if (fkEmpresa === undefined) {
    return res.status(400).send("Sua fkEmpresa está indefinida!");
  }
  else if (!fkTipoUsuario) {
    return res.status(400).send("O campo Tipo de Usuário está vazio ou indefinido!");
  }
  else if (!senha) {
    return res.status(400).send("O campo Senha está vazio ou indefinido!");
  }
  else if (!email) {
    return res.status(400).send("O campo E-mail está vazio ou indefinido!");
  }
  else if (!idFuncionario) {
    return res.status(400).send("O ID do funcionário logado (idFuncionarioServer) não foi retornado!");
  }
  else {
    gerenciamentoUsuarioModel
      .getFkEmpresa(idFuncionario)
      .then(function (resultado) {


        if (resultado.length > 0) {
          fkEmpresa = resultado[0].fkEmpresa

          gerenciamentoUsuarioModel
            .cadastrar(nome, cpf, email, fkEmpresa, fkTipoUsuario, senha)
            .then(function (resultado) {
              res.json(resultado);
            })
            .catch(function (erro) {
              console.log(erro);
              console.log(
                "\nHouve um erro ao realizar o cadastro! Erro: ",
                erro.sqlMessage
              );
              res.status(500).json(erro.sqlMessage);
            });
        }
        else {
          res.status(204).send("Não foi encontrado o fkEmpresa");

        }
      })
      .catch(function (erro) {
        console.log(erro);
        console.log(
          "\nHouve um erro ao buscar a fkEmpresa! Erro: ",
          erro.sqlMessage
        );
        res.status(500).json(erro.sqlMessage);
      });


  }
}

module.exports = {
  getUsuariobyID,
  cadastrar,
  getTipoUsuario,
  salvarEdicao,
};
