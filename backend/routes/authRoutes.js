const express = require('express');
const router = express.Router();
const { register, login, getProfile, forgotPassword, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { registerValidation, loginValidation, profileUpdateValidation } = require('../middleware/validator');

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/admin/login', loginValidation, login); // same handler, role checked client-side
router.get('/profile', protect, getProfile);
router.put('/profile', protect, profileUpdateValidation, updateProfile);
router.post('/forgot-password', forgotPassword);

module.exports = router;

