var express = require('express');
var router = express.Router();

var menuController = require('../controllers/menuController');

router.get('/getMenu/:idUsuario', function (req, res) {
  menuController.getMenu(req, res);
});

module.exports = router;
