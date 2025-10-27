var usuarioModel = require('../models/edicaoUsuarioModel');

function getDadosEmpresaBd(req, res) {
  var idFuncionario = req.params.idFuncionario;

  if (!idFuncionario) {
    return res.status(400).send('Não foi possível puxar o idFuncionario!');
  }

  usuarioModel
    .getDadosEmpresaBd(idFuncionario)
    .then(function (resultado) {
      if (resultado.length > 0) {
        res.json(resultado);
      } else {
        res.status(404).send('Usuário não encontrado');
      }
    })
    .catch(function (erro) {
      console.log('Erro ao buscar o usuário:', erro);
      res.status(500).json(erro.sqlMessage || erro.message);
    });
}

module.exports = { getDadosEmpresaBd };
