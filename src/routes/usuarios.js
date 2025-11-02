var express = require('express');
var router = express.Router();

var usuarioController = require('../controllers/CadastroController');

router.post('/cadastrar', function (req, res) {
  usuarioController.cadastrar(req, res);
});

router.post('/autenticar', function (req, res) {
  usuarioController.autenticar(req, res);
});

router.get('/getMenu/:idUsuario', function (req, res) {
  usuarioController.getMenu(req, res);
});
router.post('/finalizar', function (req, res) {
  usuarioController.finalizarCadastro(req, res);
});

module.exports = router;
