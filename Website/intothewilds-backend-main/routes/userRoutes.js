const express = require('express');
const userController = require('../controller/userController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Allow a logged-in user to act on their own account, or an admin to act on
// any account. Anonymous requests are already rejected by authenticateToken.
const requireSelfOrAdmin = (req, res, next) => {
  const requesterId = req.user && (req.user.id || req.user.userId);
  if (req.user && (req.user.role === 'admin' || requesterId === req.params.id)) {
    return next();
  }
  return res.status(403).json({ message: 'Access forbidden: Insufficient privileges' });
};

// Route to edit user
router.put('/edit/:id', authenticateToken, requireSelfOrAdmin, userController.editUser);
//get user by id
router.get('/:id', authenticateToken, requireSelfOrAdmin, userController.getUser);
router.delete('/:id', authenticateToken, requireSelfOrAdmin, userController.deleteUser);

module.exports = router;
