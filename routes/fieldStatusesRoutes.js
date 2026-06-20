const express = require('express');
const router = express.Router();
const {getFieldStatuses} = require('../controllers/fieldStatusesController.js');

router.get('/', getFieldStatuses);

module.exports = router;