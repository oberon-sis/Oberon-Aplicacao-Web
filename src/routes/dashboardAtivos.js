var express = require("express");
var router = express.Router();
var dashboardController = require("../controllers/dashboardAtivosController");


router.post("/geral/:idEmpresa", function (req, res) {
    dashboardController.getDadosGerais(req, res);
});

module.exports = router;