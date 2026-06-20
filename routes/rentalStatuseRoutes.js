const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware.js');
const {
  getRentalStatuses,
  getRentalStatusById,
  createRentalStatus,
  updateRentalStatus,
  deleteRentalStatus,
} = require('../controllers/rentalStatusController.js');

router.get('/', verifyToken, getRentalStatuses);
router.get('/:id', verifyToken, getRentalStatusById);
router.post('/', verifyToken, createRentalStatus);
router.put('/:id', verifyToken, updateRentalStatus);
router.delete('/:id', verifyToken, deleteRentalStatus);

module.exports = router;
