var empresaModel = require("../models/edicaoEmpresaModel");

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


// function getDadosEmpresaBd(req, res) {
//   var idFuncionario = req.params.idFuncionario; // <-- corrigido aqui

//   if (!idFuncionario) {
//     return res.status(400).send("Não foi possível puxar o idFuncionario!");
//   }

//   empresaModel.getDadosEmpresaBd(idFuncionario)
//     .then(function (resultado) {
//       if (resultado.length > 0) {
//         console.log("Usuário(s) encontrado(s):", resultado);
//         res.json(resultado);
//       } else {
//         res.status(404).send("Usuário não encontrado");
//       }
//     })
//     .catch(function (erro) {
//       console.log("\nHouve um erro ao buscar o usuário! Erro:", erro.sqlMessage || erro.message);
//       res.status(500).json(erro.sqlMessage || erro.message);
//     });
// }


// function atualizarStatus(req, res) {
//     console.log("\n[CONTROLLER - UPDATE empresa] PASSO 1: Cheguei na função 'atualizarStatus'.");
//     var idFuncionario = req.params.idFuncionarioServer;//ERROOOO

//     if (idFuncionario == undefined) {
//         console.log("[CONTROLLER - UPDATE empresa] ALERTA: ID da empresa está faltando (400 Bad Request).");
//         res.status(400).send("O ID da empresa está faltando!");
//         return;
//     }
//     console.log("[CONTROLLER - UPDATE empresa] DADO: ID da empresa a ser concluída: " + fkEmpresa);

//       empresaModel
//       .getFkEmpresa(idFuncionario)
//       .then(function (resultado) {


//         if (resultado.length > 0) {
//           fkEmpresa = resultado[0].fkEmpresa

//           empresaModel
//             .atualizar(fkEmpresa, razaoSocial, cnpj)
//             .then(function (resultado) {
//               res.json(resultado);
//             })
//             .catch(function (erro) {
//               console.log(erro);
//               console.log(
//                 "\nHouve um erro ao realizar a atualização! Erro: ",
//                 erro.sqlMessage
//               );
//               res.status(500).json(erro.sqlMessage);
//             });
//         }
//         else {
//           res.status(204).send("Não foi encontrado o fkEmpresa");

//         }
//       })
//       .catch(function (erro) {
//         console.log(erro);
//         console.log(
//           "\nHouve um erro ao buscar a fkEmpresa! Erro: ",
//           erro.sqlMessage
//         );
//         res.status(500).json(erro.sqlMessage);
//       });


//   }


module.exports = { getDadosEmpresaBd
 };

