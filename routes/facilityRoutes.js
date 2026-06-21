const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware.js');
const {
    getFacilities,
    getFacilityById,
    createFacility,
    updateFacility,
    deleteFacility
} = require('../controllers/facilityController.js');

router.get('/', verifyToken, getFacilities);
router.get('/:id', verifyToken, getFacilityById);
router.post('/', verifyToken, createFacility);
router.put('/:id', verifyToken, updateFacility);
router.delete('/:id', verifyToken, deleteFacility);

module.exports = router;