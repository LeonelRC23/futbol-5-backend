const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middlewares/authMiddleware.js');
const {
    getFields,
    getFieldById,
    createField,
    updateField,
    deleteField
} = require('../controllers/fieldController.js');

router.get('/', verifyToken, getFields);
router.get('/:id', verifyToken, getFieldById);
router.post('/', verifyToken, createField);
router.put('/:id', verifyToken, updateField);
router.delete('/:id', verifyToken, deleteField);

module.exports = router;