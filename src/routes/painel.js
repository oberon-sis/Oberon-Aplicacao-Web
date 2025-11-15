var express = require('express');
var router = express.Router();

var painelController = require('../controllers/painelController');

router.get('/procurar_informacoes_maquina/:idMaquina', function (req, res) {
  painelController.procurar_informacoes_maquina(req, res);
});

module.exports = router;