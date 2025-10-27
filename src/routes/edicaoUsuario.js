const express = require('express');
const router = express.Router();
const edicaoUsuarioController = require('../controllers/edicaoUsuarioController');

router.get('/getDadosEmpresaBd/:idFuncionario', function (req, res) {
  edicaoUsuarioController.getDadosEmpresaBd(req, res);
});

module.exports = router;
