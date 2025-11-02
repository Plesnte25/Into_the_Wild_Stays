const express = require('express');
const userController = require('../controller/userController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Route to edit user
router.put('/edit/:id', userController.editUser);
//get user by id
router.get('/:id', userController.getUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;