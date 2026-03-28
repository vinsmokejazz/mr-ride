const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { userAuth } = require('../middleware/authMiddleware');


router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/logout', userAuth, userController.logout);
router.get('/profile', userAuth, userController.getProfile);


module.exports = router;