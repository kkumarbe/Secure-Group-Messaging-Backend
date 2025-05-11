const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const groupRoutes = require('./group');
const messageRoutes = require('./message');

router.use('/auth', authRoutes);
router.use('/groups', groupRoutes);
router.use('/groups', messageRoutes);

module.exports = router;
