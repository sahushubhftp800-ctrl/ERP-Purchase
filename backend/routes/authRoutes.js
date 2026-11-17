const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/profile', authenticate, authController.getProfile);
router.get('/users', authenticate, authorize('admin'), authController.getAllUsers);
router.patch('/users/:id/role', authenticate, authorize('admin'), authController.updateUserRole);

module.exports = router;
