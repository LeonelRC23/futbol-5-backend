const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware.js');
const {
    getRentals,
    getRentalById,
    createRental,
    updateRental,
    deleteRental
} = require('../controllers/rentalController.js');

router.get('/', verifyToken, getRentals);
router.get('/:id', verifyToken, getRentalById);
router.post('/', verifyToken, createRental);
router.put('/:id', verifyToken, updateRental);
router.delete('/:id', verifyToken, deleteRental);

module.exports = router;