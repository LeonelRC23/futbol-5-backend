const express = require('express');
const router = express.Router();
const { loginUser, registerUser } = require('../controllers/authController.js');
const { verifyToken } = require('../middlewares/authMiddleware.js');
const {
  getUsers,
  getUserById,
  updateUser,
  createUser,
  deleteUser,
} = require('../controllers/userController.js');

router.post('/login', loginUser);
router.post('/register', registerUser);

router.get('/', verifyToken, getUsers);
router.get('/:id', verifyToken, getUserById);
router.post('/', verifyToken, createUser);
router.put('/', verifyToken, updateUser);
router.delete('/:id', verifyToken, deleteUser);

module.exports = router;
