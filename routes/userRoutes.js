const express = require('express');
const router = express.Router();

const {
  registerUser,
  checkUserStatus,
  loginUser,
  getUserProfile,
   verifyToken
  
} = require('../controllers/userController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/status/:userId', checkUserStatus);
router.get('/profile', verifyToken, userController.getUserProfile);

module.exports = router;
