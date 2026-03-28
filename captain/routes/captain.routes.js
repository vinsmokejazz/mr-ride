const express = require('express');
const router = express.Router();
const captainController = require('../controllers/captain.controller');
const { captainAuth } = require('../middleware/authMiddleware');


router.post('/register', captainController.register);
router.post('/login', captainController.login);
router.post('/logout', captainAuth, captainController.logout);
router.get('/profile', captainAuth, captainController.getProfile);
router.put('/toggle-availability', captainAuth, captainController.toggleAvailability);


module.exports = router;