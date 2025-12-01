var express = require('express');
var router = express.Router();

var painelController = require('../controllers/painelController');

router.get('/procurar_informacoes_maquina/:idMaquina', function (req, res) {
  painelController.procurar_informacoes_maquina(req, res);
});
router.get('/procurar_cards_painel_dinamico', function (req, res) {
  painelController.procurar_cards_painel_dinamico(req, res);
});
router.get('/procurar_dados_iniciais_painel', function (req, res) {
  painelController.procurar_dados_iniciais_painel(req, res);
});

module.exports = router;