var express = require("express");
var router = express.Router();

var maquinasController = require("../controllers/maquinasController");

router.post("/cadastrarMaquina", function (req, res) {
  maquinasController.cadastrarMaquina(req, res);
});
router.post("/getParametrosPadrao/:idFuncionario", function (req, res) {
  maquinasController.getParametrosPadrao(req, res);
});

router.delete("/excluirMaquina/:idMaquina", function (req, res) {
  maquinasController.excluirMaquina(req, res);
});

router.get("/listarMaquinas", function (req, res) {
  maquinasController.listarMaquinas(req, res);
});

module.exports = router;