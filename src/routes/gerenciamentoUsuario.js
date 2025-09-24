var express = require("express");
var router = express.Router();

var gerenciamentoUsuarioController = require("../controllers/gerenciamentoUsuarioController");

router.post("/cadastrar", function (req, res) {
  gerenciamentoUsuarioController.cadastrar(req, res);
});


module.exports = router;