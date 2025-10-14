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

router.get("/listarFuncionarios", function (req, res) {
    gerenciamentoUsuarioController.listarFuncionarios(req, res);
});

router.get("/PesquisarUsuario", function (req, res) {
    gerenciamentoUsuarioController.PesquisarUsuario(req, res);
});


router.delete("/ExcluirUsuario/:idFuncionarioServer", function (req, res) { 
    gerenciamentoUsuarioController.ExcluirUsuario(req, res);
});


router.put("/salvarEdicao", function (req, res) {
    gerenciamentoUsuarioController.salvarEdicao(req, res);
});


module.exports = router;
