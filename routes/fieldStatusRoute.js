const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware.js');
const {
    getFieldStatuses,
    getFieldStatusById,
    createFieldStatus,
    updateFieldStatus,
    deleteFieldStatus
} = require('../controllers/fieldStatusesController.js');

router.get('/', verifyToken, getFieldStatuses);
router.get('/:id', verifyToken, getFieldStatusById);
router.post('/', verifyToken, createFieldStatus);
router.put('/:id', verifyToken, updateFieldStatus);
router.delete('/:id', verifyToken, deleteFieldStatus);

module.exports = router;