// routes/childRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { listChildren, createChild } = require('../controllers/childController');

router.get('/', auth, listChildren);
router.post('/', auth, createChild);

module.exports = router;
