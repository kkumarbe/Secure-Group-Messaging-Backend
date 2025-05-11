const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const authMiddleware = require('../middleware/authMiddleware');

// Group routes
router.post('/', authMiddleware, groupController.createGroup);
router.post('/:groupId/join', authMiddleware, groupController.joinGroup);
router.post('/:groupId/leave', authMiddleware, groupController.leaveGroup);
router.post('/:groupId/banish', authMiddleware, groupController.banishUser);
router.post('/:groupId/approve', authMiddleware, groupController.approveRequest);

module.exports = router;


