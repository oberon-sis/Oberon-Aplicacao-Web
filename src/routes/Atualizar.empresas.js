var express = require("express");
var router = express.Router();
var empresaController = require("../controllers/AtualizarDadosController");

router.get("/buscarPorId/:idEmpresa", function (req, res) {
    empresaController.buscarPorId(req, res);
});

router.put("/editar", function (req, res) {
    empresaController.editar(req, res);
});

router.delete("/excluir/:idEmpresa", function (req, res) {
    empresaController.excluir(req, res);
});

module.exports = router;