const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.post('/generate-description', aiController.generateDescription);

module.exports = router;
