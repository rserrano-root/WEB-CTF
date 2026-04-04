const express = require('express');
const router  = express.Router();

const { register, login, logout, getMe } = require('../controllers/authController');
const { isAuthenticated }                = require('../middleware/authMiddleware');
const { loginLimiter, registerLimiter }  = require('../middleware/rateLimiter');
const { registerRules, loginRules, validate } = require('../middleware/validators');

// Ordre : rate limiter → validation → contrôleur
router.post('/register', registerLimiter, registerRules, validate, register);
router.post('/login',    loginLimiter,    loginRules,    validate, login);
router.post('/logout',   isAuthenticated, logout);
router.get('/me',        isAuthenticated, getMe);

module.exports = router;
