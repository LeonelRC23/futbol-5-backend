const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware.js');
const {
    getFieldCategories,
    getFieldCategoryById,
    createFieldCategory,
    updateFieldCategory,
    deleteFieldCategory
} = require('../controllers/fieldCategoryController.js');

router.get('/', verifyToken, getFieldCategories);
router.get('/:id', verifyToken, getFieldCategoryById);
router.post('/', verifyToken, createFieldCategory);
router.put('/:id', verifyToken, updateFieldCategory);
router.delete('/:id', verifyToken, deleteFieldCategory);

module.exports = router;