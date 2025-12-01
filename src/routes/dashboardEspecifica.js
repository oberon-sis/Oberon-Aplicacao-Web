var express = require('express');
var router = express.Router();

var dashboardEspecificaController = require('../controllers/dashboardEspecificaController');

router.get('/procurar_informacoes_maquina/:idMaquina', function (req, res) {
  dashboardEspecificaController.procurar_informacoes_maquina(req, res);
});

router.get('/Maquinas_listagem/:idEmpresa', function (req, res) {
  dashboardEspecificaController.Maquinas_listagem(req, res);
});


module.exports = router;
