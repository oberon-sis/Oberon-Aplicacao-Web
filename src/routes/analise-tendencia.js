var express = require('express');
var router = express.Router();

var analiseController = require('../controllers/analise-tendenciaController');

router.get('/procurar_dados_pagina', function (req, res) {
  analiseController.procurar_dados_pagina(req, res);
});

router.get('/procurar_maquinas', function (req, res) {
  analiseController.procurar_maquinas(req, res);
});

module.exports = router;