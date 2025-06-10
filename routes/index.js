const express = require('express');
const router = express.Router();
const identifyController = require('../controllers/identify');

// POST /api/identify
router.post('/identify', identifyController.handleIdentify);

module.exports = router; 