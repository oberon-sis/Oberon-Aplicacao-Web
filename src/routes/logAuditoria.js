var express = require('express');
var router = express.Router();
var logAuditoriaController = require('../controllers/logAuditoriaController');

router.get('/:idEmpresa', function (req, res) {
  logAuditoriaController.buscarLogs(req, res);
});

router.get('/funcionarios/:idEmpresa', function (req, res) {
  logAuditoriaController.buscarFuncionarios(req, res);
});

router.get('/detalhes/:idLog', function (req, res) {
  logAuditoriaController.buscarDetalhesLog(req, res);
});

router.get('/exportar/:idEmpresa', function (req, res) {
  logAuditoriaController.exportarCSV(req, res);
});

module.exports = router;