const express = require('express');
const router = express.Router();
const empresaController = require('../controllers/EmpresaController');

// Rota para verificar os dados da empresa
router.post('/verificar', empresaController.verificar);

module.exports = router;
