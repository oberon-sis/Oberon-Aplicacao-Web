var express = require('express');
var router = express.Router();

var analiseRedeController = require('../controllers/analiseRedeController');

router.get('/analiseRede/throughput/:fkMaquina', function (req, res) {
    analiseRedeController.getMediaLatencia(req, res);
});

router.get('/analiseRede/alertas/:fkMaquina', function (req, res) {
    analiseRedeController.getSomaAlertas(req, res);
});

router.get('/analiseRede/pacotesPerdidos/:fkMaquina', function (req, res) {
    analiseRedeController.getPerdaPacote(req, res);
});

router.get('/analiseRede/disponibilidadePercent/:fkMaquina', function (req, res) {
    analiseRedeController.getDisponibilidade(req, res);
});

router.get('/analiseRede/throughputUltimas24h/:fkMaquina', function(req, res) {
    analiseRedeController.getLatenciaUltimas24h(req, res);
});

router.get('/analiseRede/jitter_medio_ms/:fkMaquina', function(req, res) {
    analiseRedeController.getJitter(req, res);
});

router.get('/analiseRede/enviados/:fkMaquina', function (req, res) {
    analiseRedeController.getPacotesEnviados(req, res);
});

router.get('/analiseRede/recebidos/:fkMaquina', function (req, res) {
    analiseRedeController.getPacotesRecebidos(req, res);
});


module.exports = router;
