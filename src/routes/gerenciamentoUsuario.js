var express = require("express");
var router = express.Router();

var gerenciamentoUsuarioController = require("../controllers/gerenciamentoUsuarioController");

router.post("/cadastrar", function (req, res) {
  gerenciamentoUsuarioController.cadastrar(req, res);
});

router.get("/getUsuariobyID/:idFuncionarioServer", function (req, res) {
  gerenciamentoUsuarioController.getUsuariobyID(req, res);
});

router.get("/getTipoUsuario", function (req, res) {
    gerenciamentoUsuarioController.getTipoUsuario(req, res);
});



module.exports = router;