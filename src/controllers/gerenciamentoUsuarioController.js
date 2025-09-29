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



function cadastrar(req, res) {

    var nome = req.body.nomeServer;
    var email = req.body.emailServer;
    var cpf = req.body.cpfServer; // Recebe o telefone
    var fkEmpresa = 0; // Inicializado para ser preenchido
    var fkTipoUsuario = req.body.fkTipoUsuarioServer;
    var senha = req.body.senhaServer;
    var idFuncionario = req.body.idFuncionarioServer; // ID do usuário logado


    if (nome == undefined) {
      res.status(400).send("Seu nome está undefined!");
    } else if (cpf == undefined) {
      res.status(400).send("Seu cpf está undefined!");
    } else if (fkEmpresa == undefined) {
      res.status(400).send("Sua empresa a vincular está undefined!");
    } else if (fkTipoUsuario == undefined) {
      res.status(400).send("Seu TipoUsuario a vincular está undefined!");
    } else if (senha == undefined) {
      res.status(400).send("Sua senha está undefined!");
    } else if (email == undefined) {
      res.status(400).send("Seu email está undefined!");
    } else if (idFuncionario == undefined) {
      res.status(400).send("Seu id não deu retorno está undefined!");
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
};
