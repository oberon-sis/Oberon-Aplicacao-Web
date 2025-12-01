var express = require('express');
var router = express.Router();
var alertasController = require('../controllers/alertasController');

router.get(
  '/listar/:idUsuario/:pagina/:tipoFiltro/:termoPesquisa/:dataInicio/:dataFim',
  function (req, res) {
    alertasController.listarAlertas(req, res);
  },
);

router.get(
  '/exportar/:idUsuario/:tipoFiltro/:termoPesquisa/:dataInicio/:dataFim',
  function (req, res) {
    alertasController.exportarAlertas(req, res);
  },
);
router.get('/listarFeedAlertas',
  function (req, res) {
    alertasController.listarFeedAlertas(req, res);
  },
);
module.exports = router;
