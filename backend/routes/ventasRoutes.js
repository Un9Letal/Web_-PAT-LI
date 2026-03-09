const express = require('express');
const router = express.Router();
const controller = require('../controllers/ventasController');

router.get('/', controller.getVentas);

module.exports = router;