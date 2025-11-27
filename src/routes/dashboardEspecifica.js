var express = require('express');
var router = express.Router();

var dashboardEspecificaController = require('../controllers/dashboardEspecificaController');

router.get('/procurar_informacoes_maquina/:idMaquina', function (req, res) {
  dashboardEspecificaController.procurar_informacoes_maquina(req, res);
});

module.exports = router;
