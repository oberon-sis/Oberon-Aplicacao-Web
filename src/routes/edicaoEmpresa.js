const express = require('express');
const router = express.Router();
const edicaoEmpresaController = require('../controllers/edicaoEmpresaController');

// router.put('/atualizar/:fkEmpresa', (req, res) => {
//     edicaoEmpresaController.atualizarStatus(req, res);
// });

router.get("/getDadosEmpresaBd/:idFuncionario", function (req, res) {
  edicaoEmpresaController.getDadosEmpresaBd(req, res);
});


module.exports = router;