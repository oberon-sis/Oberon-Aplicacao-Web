// /routes/dashboardEstrategica.js
var express = require("express");
var router = express.Router();
var controller = require("../controllers/dashboardEstrategicaController");

router.get("/geral/:idEmpresa", function (req, res) {
    controller.getDadosGerais(req, res);
});

module.exports = router;
