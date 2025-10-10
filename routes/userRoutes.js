const express = require('express');
const router = express.Router();

const {
  registerUser,
  checkUserStatus,
  loginUser,
  getUserProfile,
  verifyToken // Todas as funções estão importadas aqui
} = require('../controllers/userController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/status/:userId', checkUserStatus);

// CORREÇÃO: Removemos o 'userController.' pois getUserProfile e verifyToken 
// já foram desestruturados (importados individualmente) acima.
router.get('/profile', verifyToken, getUserProfile); 

module.exports = router;