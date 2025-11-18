const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

router.get('/top-criticas', homeController.getTopCriticas);

router.get('/scatter-data', homeController.getScatterData);

module.exports = router;