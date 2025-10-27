var express = require('express');
var router = express.Router();

var maquinasController = require('../controllers/maquinasController');

router.post('/cadastrarMaquina', function (req, res) {
  maquinasController.cadastrarMaquina(req, res);
});
router.post('/salvarPadrao', function (req, res) {
  maquinasController.salvarPadrao(req, res);
});

router.get('/getParametrosPadrao/:idFuncionario', function (req, res) {
  maquinasController.getParametrosPadrao(req, res);
});
router.get('/buscarDadosParaEdicao/:idMaquina', function (req, res) {
  maquinasController.buscarDadosParaEdicao(req, res);
});
router.get('/listarMaquinas', function (req, res) {
  maquinasController.listarMaquinas(req, res);
});

router.put('/atualizarMaquina/:idMaquina', function (req, res) {
  maquinasController.atualizarMaquina(req, res);
});

router.delete('/excluirMaquina/:idMaquina', function (req, res) {
  maquinasController.excluirMaquina(req, res);
});

module.exports = router;
