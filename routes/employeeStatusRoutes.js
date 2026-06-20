const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware.js');
const {
  getEmployeeStatuses,
  getEmployeeStatusById,
  createEmployeeStatus,
  updateEmployeeStatus,
  deleteEmployeeStatus,
} = require('../controllers/employeeStatusController');

router.get('/', verifyToken, getEmployeeStatuses);
router.get('/:id', verifyToken, getEmployeeStatusById);
router.post('/', verifyToken, createEmployeeStatus);
router.put('/:id', verifyToken, updateEmployeeStatus);
router.delete('/:id', verifyToken, deleteEmployeeStatus);

module.exports = router;
