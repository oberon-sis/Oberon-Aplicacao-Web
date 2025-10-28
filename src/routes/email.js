const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');

// Rota 1: POST /auth/esqueci-senha (Solicita o link)
router.post('/esqueci-senha', emailController.esqueciSenha);

// Rota 2: POST /auth/redefinir-senha (Redefine a senha com o token)
router.post('/redefinir-senha', emailController.redefinirSenha);

module.exports = router;
