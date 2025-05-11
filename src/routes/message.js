const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');

// Message routes
router.post('/:groupId/messages', authMiddleware, messageController.sendMessage);
router.get('/:groupId/messages', authMiddleware, messageController.getMessages);

module.exports = router;