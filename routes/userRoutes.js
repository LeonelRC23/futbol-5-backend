const express = require('express');
const router = express.Router();
const { loginUser } = require('../controllers/authController.js');
const { verifyToken } = require('../middlewares/authMiddleware.js');
const userController = require('../controllers/userController.js');

router.post('/login', loginUser);
router.post('/', userController.createUser);

router.get('/', verifyToken, userController.getUsers);
router.get('/:id', verifyToken, userController.getUserById);

module.exports = router;
