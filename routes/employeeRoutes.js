const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middlewares/authMiddleware.js');
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require('../controllers/employeeController.js');

router.get('/', verifyToken, getEmployees);
router.get('/:id', verifyToken, getEmployeeById);
router.post('/', verifyToken, createEmployee);
router.put('/:id', verifyToken, updateEmployee);
router.delete('/:id', verifyToken, deleteEmployee);

module.exports = router;
