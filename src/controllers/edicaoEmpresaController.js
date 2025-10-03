var empresaModel = require("../models/EmpresaModel");

function getFkempresa(req, res) {
  var idFuncionario = req.body.idFuncionario;

  empresaModel.getFkempresa(idFuncionario).then((resultado) => {
    res.status(200).json(resultado);
  });
}

module.exports = { getFkempresa };

