var gerenciamentoUsuarioModel = require("../models/gerenciamentoUsuarioModel");


// CADASTRO USÚARIO

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


// PEGAR DADOS ISOLADOS

//-----------------------------------------------------------------



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


// PAGINAÇÃO 


function listarFuncionarios(req, res) {
    var pagina = parseInt(req.query.page) || 1;
    var limite = 20;
    var offset = (pagina - 1) * limite;

    console.log(`📘 Requisição recebida: página ${pagina}, limite ${limite}, offset ${offset}`);

    gerenciamentoUsuarioModel
        .listarFuncionarios(limite, offset)
        .then((resultado) => {
            console.log(`${resultado.length} funcionários retornados`);
            res.status(200).json(resultado);
        })
        .catch((erro) => {
            console.error("Erro ao listar funcionários:", erro.sqlMessage || erro);
            res.status(500).json({
                erro: "Erro ao listar funcionários",
                detalhes: erro.sqlMessage || erro.message
            });
        });
}




// MODIFICAR DADOS DO USÚARIO


function salvarEdicao(req, res) {

  var idFuncionario = req.body.idFuncionarioServer;
  var nome = req.body.nomeServer;
  var email = req.body.emailServer;
  var senha = req.body.senhaServer;
  var fkTipoUsuario = req.body.fkTipoUsuarioServer;

  gerenciamentoUsuarioModel.salvarEdicao(nome, email, fkTipoUsuario, senha, idFuncionario)
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





function ExcluirUsuario(req, res) {

    var idFuncionario = req.params.idFuncionarioServer; // ID do funcionário a ser excluído
    var senhaGerente = req.body.senha; // Senha para autenticação (vem do corpo)
    var idGerente = req.body.idGerente; // ID para autenticação (vem do corpo)

    // 1. Validação inicial dos dados obrigatórios
    if (!idFuncionario) {
        return res.status(400).send("ID do funcionário a ser excluído não fornecido na URL!");
    }
    if (!idGerente || !senhaGerente) {
        return res.status(400).send("ID do Gerente e Senha são obrigatórios para a exclusão.");
    }
    
    // 2. Busca o Gerente no banco para verificar a senha
    // Mudei o nome da variável de 'res' para 'resultadoBusca' para evitar conflito com 'res' do Express.
    gerenciamentoUsuarioModel.getUsuariobyID(idGerente) 
        .then(function(resultadoBusca) {
            
            // Verifica se o Gerente foi encontrado
            if (resultadoBusca.length === 0) {
                return res.status(404).send("Gerente de autorização não encontrado.");
            }
            
            // 3. Verifica se a senha está correta
            // NOTA: Em produção, você DEVE usar hash (como bcrypt) para a senha!
            if (senhaGerente === resultadoBusca[0].senha) { 
                
                // Senha correta, prossegue com a exclusão
                gerenciamentoUsuarioModel.ExcluirUsuario(idFuncionario)
                    .then(function (resultadoExclusao) { 
                        if (resultadoExclusao.affectedRows > 0) {
                            console.log(`Funcionário de ID ${idFuncionario} excluído com sucesso.`);
                            // Usa 200 OK ou 204 No Content para sucesso de DELETE
                            res.status(200).send("Funcionário excluído com sucesso."); 
                        } else {
                            // Se affectedRows = 0, o ID não existe
                            res.status(404).send("Funcionário a ser excluído não encontrado ou já excluído.");
                        }
                    })
                    .catch(function (erro) {
                        // Erro durante a exclusão no banco de dados
                        console.log("\nHouve um erro ao tentar excluir o usuário! Erro: ", erro.sqlMessage || erro.message);
                        res.status(500).json(erro.sqlMessage || erro.message);
                    });

            } else {
                // 4. Senha incorreta
                console.log("Tentativa de exclusão falhou: Senha do gerente incorreta.");
                return res.status(403).send("Senha do gerente de autorização incorreta."); // 403 Forbidden
            }
        })
        .catch(function(erro) { 
            // 5. Erro durante a busca do Gerente no banco de dados
            console.log("\nHouve um erro ao buscar o Gerente para autenticação! Erro: ", erro.sqlMessage || erro.message);
            res.status(500).json(erro.sqlMessage || erro.message);
        });
}



module.exports = {
  getUsuariobyID,
  cadastrar,
  getTipoUsuario,
  salvarEdicao,
  ExcluirUsuario,
  listarFuncionarios,
};
