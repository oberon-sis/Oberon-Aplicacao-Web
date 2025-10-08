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



// function atualizarEmpresa(req, res) {
//   console.log("\n[CONTROLLER] Requisição para atualizar empresa recebida.");

//   var idFuncionario = req.params.idFuncionario;
//   var { razaoSocialServer, cnpjServer } = req.body;

//   if (!idFuncionario || !razaoSocialServer || !cnpjServer) {
//     return res.status(400).send("Dados incompletos para atualização!");
//   }

//   empresaModel.getFkEmpresa(idFuncionario)
//     .then(resultado => {
//       if (resultado.length > 0) {
//         var fkEmpresa = resultado[0].fkEmpresa;

//         empresaModel.atualizarEmpresa(fkEmpresa, razaoSocialServer, cnpjServer)
//           .then(() => res.status(200).send("Dados atualizados com sucesso!"))
//           .catch(erro => {
//             console.error("Erro ao atualizar:", erro);
//             res.status(500).send("Erro ao atualizar empresa.");
//           });
//       } else {
//         res.status(404).send("Funcionário sem empresa vinculada.");
//       }
//     })
//     .catch(erro => {
//       console.error("Erro ao buscar fkEmpresa:", erro);
//       res.status(500).send("Erro interno ao buscar a empresa do funcionário.");
//     });
// }

 module.exports = { getDadosEmpresaBd };

