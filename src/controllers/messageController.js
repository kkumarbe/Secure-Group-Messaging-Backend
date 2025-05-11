const crypto = require('crypto');
const Message = require('../models/Message');

const ALGORITHM = 'aes-128-cbc';
// const KEY = Buffer.from(process.env.AES_KEY, 'hex');
// const IV = Buffer.from(process.env.AES_IV, 'hex');
const KEY = process.env.AES_KEY?.trim();
const IV = process.env.AES_IV?.trim();

if (!KEY || KEY.length !== 16)
  throw new Error('KEY must be 16 bytes long');
if (!IV || IV.length !== 16)
  throw new Error('IV must be 16 bytes long');

function encrypt(text) {
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, IV);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decrypt(encryptedText) {
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, IV);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * @swagger
 * /groups/{groupId}/messages:
 *   post:
 *     summary: Send an encrypted message to a group
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: groupId
 *         in: path
 *         required: true
 *         description: ID of the group to send the message to
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: The plain text message to be encrypted and sent
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Message sent
 *                 id:
 *                   type: string
 *                   description: ID of the created message
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request (missing or invalid data)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
exports.sendMessage = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { text } = req.body;
    const encryptedText = encrypt(text);
    const message = await Message.create({ groupId, senderId: req.user.userId, encryptedText });
    res.status(201).json({ message: 'Message sent', id: message._id, timestamp: message.timestamp });
  } catch (err) { next(err); }
};

/**
 * @swagger
 * /groups/{groupId}/messages:
 *   get:
 *     summary: Get all messages from a group
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the group
 *     responses:
 *       200:
 *         description: List of messages in the group
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   sender:
 *                     type: string
 *                   timestamp:
 *                     type: string
 *                   content:
 *                     type: string
 *       403:
 *         description: User not authorized or not a group member
 *       500:
 *         description: Internal server error
 */
exports.getMessages = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const messages = await Message.find({ groupId }).sort({ timestamp: 1 });
    const decryptedMessages = messages.map(m => ({
      senderId: m.senderId,
      text: decrypt(m.encryptedText),
      timestamp: m.timestamp
    }));
    res.json(decryptedMessages);
  } catch (err) { next(err); }
};