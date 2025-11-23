const express = require('express');
const router = express.Router();
const controller = require('../controllers/dashboardEstrategicaController');

// Rotas da Dashboard Estratégica
router.get('/kpis', controller.getKpis);
router.get('/tendencia-desgaste', controller.getTendenciaDesgaste);
router.get('/progressao-alertas', controller.getProgressaoAlertas);
router.get('/ranking-intervencao', controller.getRankingIntervencao);
router.get('/mapa-risco', controller.getMapaRisco);

module.exports = router;
