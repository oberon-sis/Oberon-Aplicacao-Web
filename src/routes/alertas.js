var express = require("express");
var router = express.Router();
var alertasController = require("../controllers/alertasController");

router.get("/listar/:idUsuario/:pagina", function (req, res) {
  alertasController.listarAlertas(req, res);
});

module.exports = router