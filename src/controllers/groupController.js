const Group = require('../models/Group');
const cooldowns = {}; // In-memory cooldown tracking

/**
 * @swagger
 * /groups:
 *   post:
 *     summary: Create a new group
 *     description: Allows an authenticated user to create a private or open group.
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - maxMembers
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the group
 *               type:
 *                 type: string
 *                 enum: [private, open]
 *                 description: Group type - 'private' or 'open'
 *               maxMembers:
 *                 type: integer
 *                 minimum: 2
 *                 description: Maximum number of members allowed in the group
 *     responses:
 *       201:
 *         description: Group created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 type:
 *                   type: string
 *                 maxMembers:
 *                   type: integer
 *                 ownerId:
 *                   type: string
 *                 members:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Validation error or bad input
 *       401:
 *         description: Unauthorized – JWT missing or invalid
 */
exports.createGroup = async (req, res, next) => {
  try {
    const { name, type, maxMembers } = req.body;
    const group = await Group.create({ name, type, maxMembers, ownerId: req.user.userId, members: [req.user.userId] });
    res.status(201).json(group);
  } catch (err) { next(err); }
};

/**
 * @swagger
 * /groups/{groupId}/join:
 *   post:
 *     summary: Request to join a group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: groupId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Join request submitted or user added
 *       400:
 *         description: Invalid group or already a member
 */
exports.joinGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const userId = req.user.userId;

    if (group.banishedUsers.includes(userId)) return res.status(403).json({ message: 'You are banished. Re-request required.' });

    if (group.members.includes(userId)) return res.status(400).json({ message: 'Already a member' });

    if (group.type === 'open') {
      group.members.push(userId);
      await group.save();
      return res.json({ message: 'Joined group' });
    }

    if (cooldowns[group._id]?.[userId] && Date.now() - cooldowns[group._id][userId] < 48 * 60 * 60 * 1000) {
      return res.status(403).json({ message: 'Cooldown in effect' });
    }

    if (!group.joinRequests.includes(userId)) {
      group.joinRequests.push(userId);
      await group.save();
    }
    res.json({ message: 'Join request submitted' });
  } catch (err) { next(err); }
};

/**
 * @swagger
 * /groups/{groupId}/leave:
 *   post:
 *     summary: Leave a group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: groupId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Left the group successfully
 *       403:
 *         description: Not a member or owner must transfer ownership
 */
exports.leaveGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const userId = req.user.userId;

    if (!group.members.includes(userId)) return res.status(400).json({ message: 'Not a group member' });

    if (String(group.ownerId) === userId) return res.status(403).json({ message: 'Owner must transfer ownership first' });

    group.members = group.members.filter(id => id.toString() !== userId);
    if (!cooldowns[group._id]) cooldowns[group._id] = {};
    cooldowns[group._id][userId] = Date.now();
    await group.save();
    res.json({ message: 'Left group' });
  } catch (err) { next(err); }
};

/**
 * @swagger
 * /groups/{groupId}/banish:
 *   post:
 *     summary: Banish a user from a group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: groupId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: userId
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User banished successfully
 *       403:
 *         description: Not authorized
 */
exports.banishUser = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.query;
    const group = await Group.findById(groupId);

    if (String(group.ownerId) !== req.user.userId) return res.status(403).json({ message: 'Only owner can banish' });

    group.members = group.members.filter(id => id.toString() !== userId);
    group.banishedUsers.push(userId);
    await group.save();
    res.json({ message: 'User banished' });
  } catch (err) { next(err); }
};

/**
 * @swagger
 * /groups/{groupId}/approve:
 *   post:
 *     summary: Approve a join request for a private group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: groupId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: userId
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User approved
 *       403:
 *         description: Not authorized
 */
exports.approveRequest = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.query;
    const group = await Group.findById(groupId);

    if (String(group.ownerId) !== req.user.userId) return res.status(403).json({ message: 'Only owner can approve' });

    if (!group.joinRequests.includes(userId)) return res.status(400).json({ message: 'No such join request' });

    group.joinRequests = group.joinRequests.filter(id => id.toString() !== userId);
    group.members.push(userId);
    group.banishedUsers = group.banishedUsers.filter(id => id.toString() !== userId);
    await group.save();
    res.json({ message: 'Request approved' });
  } catch (err) { next(err); }
};