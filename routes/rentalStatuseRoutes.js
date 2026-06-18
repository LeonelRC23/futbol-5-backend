const express = require('express');
const router = express.Router();

const rentalStatusController = require('../controllers/rentalStatusController.js');

router.get('/', rentalStatusController.getRentalStatuses);
router.get('/:id', rentalStatusController.getRentalStatusById);
router.post('/', rentalStatusController.createRentalStatus);

module.exports = router;