var express = require("express");
var router = express.Router();

var maquinasController = require("../controllers/maquinasController");

router.post("/cadastrarMaquina", function (req, res) {
  maquinasController.cadastrarMaquina(req, res);
});

module.exports = router;