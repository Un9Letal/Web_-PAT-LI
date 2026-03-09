const express = require('express');
const router = express.Router();
const controller = require('../controllers/productosController');

router.get('/', controller.getProductos);

module.exports = router;