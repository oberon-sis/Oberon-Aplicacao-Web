var gerenciamentoUsuarioModel = require("../models/gerenciamentoUsuarioModel");
function autenticar(req, res) {
  var email = req.body.emailServer;
  var senha = req.body.senhaServer;

  if (email == undefined) {
    res.status(400).send("Seu email está undefined!");
  } else if (senha == undefined) {
    res.status(400).send("Sua senha está indefinida!");
  } else {
    usuarioModel
      .autenticar(email, senha)
      .then(function (resultadoAutenticar) {
        console.log(`\nResultados encontrados: ${resultadoAutenticar.length}`);
        console.log(`Resultados: ${JSON.stringify(resultadoAutenticar)}`);

        if (resultadoAutenticar.length == 1) {
          console.log(resultadoAutenticar);

          aquarioModel
            .buscarAquariosPorEmpresa(resultadoAutenticar[0].empresaId)
            .then((resultadoAquarios) => {
              if (resultadoAquarios.length > 0) {
                res.json({
                  id: resultadoAutenticar[0].id,
                  email: resultadoAutenticar[0].email,
                  nome: resultadoAutenticar[0].nome,
                  senha: resultadoAutenticar[0].senha,
                  aquarios: resultadoAquarios,
                });
              } else {
                res.status(204).send("Email e/ou senha inválido(s)");
              }
            });
        } else if (resultadoAutenticar.length == 0) {
          res.status(403).send("Email e/ou senha inválido(s)");
        } else {
          res.status(403).send("Mais de um usuário com o mesmo login e senha!");
        }
      })
      .catch(function (erro) {
        console.log(erro);
        console.log(
          "\nHouve um erro ao realizar o login! Erro: ",
          erro.sqlMessage
        );
        res.status(500).json(erro.sqlMessage);
      });
  }
}

function cadastrar(req, res) {
  var nome = req.body.nomeServer;
  var email = req.body.emailServer;
  var cpf = req.body.cpfServer;
  // var fkEmpresa = req.body.fkEmpresaServer;
  var fkEmpresa = 0;
  var fkTipoUsuario = req.body.fkTipoUsuarioServer;
  var senha = req.body.senhaServer;
  var idFuncionario = req.body.idFuncionarioServer


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
  autenticar,
  cadastrar,
};
