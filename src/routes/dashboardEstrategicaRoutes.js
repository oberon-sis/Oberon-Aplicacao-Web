var express = require("express");
var router = express.Router();
// O caminho abaixo assume que o Controller está em src/controllers/
var dashboardController = require("../controllers/dashboardEstrategicaController"); 

console.log("✅ Roteador /dashboardEstrategicaRoutes carregado.");

// Rota principal da Visão Bimestral de Risco e Tendência.
// O caminho completo é /dashboard/risco/:idEmpresa, mapeado em app.js
router.get("/risco/:idEmpresa", function (req, res) {
    console.log(`[ROUTE HIT] Rota /risco/${req.params.idEmpresa} alcançada.`);
    dashboardController.getDadosRisco(req, res);
});

// Rota de compatibilidade (GERAL) - Mantida por segurança
router.get("/geral/:idEmpresa", function (req, res) {
    console.warn("[ROUTE WARN] A rota /dashboard/geral está obsoleta. Redirecionando para a lógica de Risco.");
    dashboardController.getDadosRisco(req, res);
});

module.exports = router;