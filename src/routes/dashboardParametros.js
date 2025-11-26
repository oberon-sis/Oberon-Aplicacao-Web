var express = require("express");
var router = express.Router();
var dashboardParametrosController = require("../controllers/dashboardParametrosController");

router.get("/dados/:idEmpresa/:componente", dashboardParametrosController.getDados);

router.post("/atualizar", dashboardParametrosController.atualizarParametros);

module.exports = router;