const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware.js');
const {
  getRentals,
  getRentalById,
  createRental,
  createRentalAdmin,
  updateRental,
  deleteRental,
  getRentalsByUserId,
} = require('../controllers/rentalController.js');

router.get('/', verifyToken, getRentals);
router.get('/rentals', verifyToken, getRentalsByUserId);
router.post('/', verifyToken, createRental);
router.post('/admin', verifyToken, createRentalAdmin);
router.put('/:id', verifyToken, updateRental);
router.get('/:id', verifyToken, getRentalById);
router.delete('/:id', verifyToken, deleteRental);

module.exports = router;
