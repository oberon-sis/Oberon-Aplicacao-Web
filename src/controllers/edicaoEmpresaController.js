var empresaModel = require("../models/edicaoEmpresaModel");
const bcrypt = require("bcryptjs");

function getDadosEmpresaBd(req, res) {
  var idFuncionario = req.params.idFuncionario;

  if (!idFuncionario) {
    return res.status(400).send("Não foi possível puxar o idFuncionario!");
  }

  empresaModel.getDadosEmpresaBd(idFuncionario)
    .then(function (resultado) {
      if (resultado.length > 0) {
        res.json(resultado);
      } else {
        res.status(404).send("Usuário não encontrado");
      }
    })
    .catch(function (erro) {
      console.log("Erro ao buscar o usuário:", erro);
      res.status(500).json(erro.sqlMessage || erro.message);
    });
}



function atualizarEmpresa(req, res) {
  console.log("\n[CONTROLLER] Requisição para atualizar empresa recebida.");

  var idFuncionario = req.params.idFuncionario;
  var { razaoSocialServer, cnpjServer, senhaServer } = req.body;

  if (!idFuncionario || !razaoSocialServer || !cnpjServer || !senhaServer) {
    return res.status(400).send("Dados incompletos para atualização!");
  }


  empresaModel.getSenha(idFuncionario)
    .then(resultado => {
      if (resultado.length === 0) {
          return res.status(404).send("Funcionário não encontrado.");
      }

      bcrypt.compare(senhaServer, resultado[0].senha)
        .then(senhaCorreta => {
          if (senhaCorreta) {
            empresaModel.getFkEmpresa(idFuncionario)
              .then(resultado => {
                if (resultado.length > 0) {
                  var fkEmpresa = resultado[0].fkEmpresa;

                  empresaModel.atualizarEmpresa(fkEmpresa, razaoSocialServer, cnpjServer)
                    .then(() => res.status(200).send("Dados atualizados com sucesso!"))
                    .catch(erro => {
                      console.error("Erro ao atualizar:", erro);
                      res.status(500).send("Erro ao atualizar empresa.");
                    });
                } else {
                  res.status(404).send("Funcionário sem empresa vinculada.");
                }
              })
              .catch(erro => {
                console.error("Erro ao buscar fkEmpresa:", erro);
                res.status(500).send("Erro interno ao buscar a empresa do funcionário.");
              });
          }
          else
          {
            res.status(401).send("Credenciais inválidas.");
          }
        })
        .catch(erro => {
            console.error("Erro ao comparar senha:", erro);
            res.status(500).send("Erro interno ao validar credenciais.");
        });
    })
    .catch(erro => {
      console.error("Erro ao buscar senha do funcionário:", erro);
      res.status(500).send("Erro interno ao buscar a senha do funcionário.");
    });
}


async function atualizarEmpresa(req, res) { // << Adicionar 'async' aqui
  console.log("\n[CONTROLLER] Requisição para atualizar empresa recebida.");

  var idFuncionario = req.params.idFuncionario;
  var { razaoSocialServer, cnpjServer, senhaServer } = req.body;

  if (!idFuncionario || !razaoSocialServer || !cnpjServer || !senhaServer) {
    return res.status(400).send("Dados incompletos para atualização!");
  }

  try { // Bloco try/catch para lidar com as Promises de forma síncrona
    const resultadoSenha = await empresaModel.getSenha(idFuncionario);

    if (resultadoSenha.length === 0) {
        return res.status(404).send("Funcionário não encontrado.");
    }

    // AQUI ESTÁ A CORREÇÃO PRINCIPAL
    const senhaCorreta = await bcrypt.compare(senhaServer, resultadoSenha[0].senha);

    if (senhaCorreta) {
      const resultadoEmpresa = await empresaModel.getFkEmpresa(idFuncionario);

      if (resultadoEmpresa.length > 0) {
        var fkEmpresa = resultadoEmpresa[0].fkEmpresa;

        await empresaModel.atualizarEmpresa(fkEmpresa, razaoSocialServer, cnpjServer);
        res.status(200).send("Dados atualizados com sucesso!");
      } else {
        res.status(404).send("Funcionário sem empresa vinculada.");
      }
    } else {
      res.status(401).send("Credenciais inválidas.");
    }
  } catch (erro) {
    console.error("Erro no processamento da atualização:", erro);
    res.status(500).send("Erro interno do servidor.");
  }
}

module.exports = { getDadosEmpresaBd, atualizarEmpresa };

