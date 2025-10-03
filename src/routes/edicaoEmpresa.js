const express = require('express');
const router = express.Router();
const edicaoEmpresaController = require('../controllers/edicaoEmpresaController');

router.post("/cadastrarMaquina", function (req, res) {
  edicaoEmpresaController.cadastrarMaquina(req, res);
});

module.exports = router;