var express = require('express');
var router = express.Router();

var analiseRedeController = require('../controllers/analiseRedeController');

router.get('/throughput/:fkMaquina', function (req, res) {
     analiseRedeController.getMediaLatencia(req, res);
});

router.get('/alertas/:fkMaquina', function (req, res) { 
     analiseRedeController.getSomaAlertas(req, res);
});

router.get('/pacotesPerdidos/:fkMaquina', function (req, res) { 
     analiseRedeController.getPerdaPacote(req, res);
});

router.get('/disponibilidadePercent/:fkMaquina', function (req, res) { 
        analiseRedeController.getDisponibilidade(req, res);
});

router.get('/throughputUltimas24h/:fkMaquina', function(req, res) {
     analiseRedeController.getLatenciaUltimas24h(req, res);
});

router.get('/jitter_medio_ms/:fkMaquina', function(req, res) { 
     analiseRedeController.getJitter(req, res);
});

router.get('/enviados/:fkMaquina', function (req, res) { 
     analiseRedeController.getPacotesEnviados(req, res);
});

router.get('/recebidos/:fkMaquina', function (req, res) {
     analiseRedeController.getPacotesRecebidos(req, res);
});

router.get("/ranking/:fkEmpresa", function (req, res) {
     analiseRedeController.buscarRanking(req, res);
});

module.exports = router;