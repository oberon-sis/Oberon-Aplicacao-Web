// Arquivo: src/routes/riscoTendenciaRoute.js

const express = require('express');
const router = express.Router();
const riscoTendenciaController = require('../controllers/dashboardEstrategicaController');

// Rota para buscar todos os dados do dashboard de Risco e Tendência
router.get('/dados-bimestrais', riscoTendenciaController.buscarDadosRiscoTendencia);

module.exports = router;