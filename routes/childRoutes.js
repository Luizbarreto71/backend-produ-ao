const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const controller = require('../controllers/childController');

// Sempre com auth para preencher req.userId
router.get('/',  auth, controller.listChildren);
router.post('/', auth, controller.createChild);

module.exports = router;
