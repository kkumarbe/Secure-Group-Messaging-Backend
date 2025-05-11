const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const validateEmail = require('../utils/validateEmail');

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid email
 *       409:
 *         description: Email already in use
 */
exports.register = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!validateEmail(email)) return res.status(400).json({ message: 'Invalid email' });
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(409).json({ message: 'Email already in use' });
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({ email, passwordHash });
      res.status(201).json({ message: 'User registered', userId: user._id });
    } catch (err) { next(err); }
  };
  
  /**
   * @swagger
   * /auth/login:
   *   post:
   *     summary: Log in a user
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [email, password]
   *             properties:
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: Login successful
   *       401:
   *         description: Invalid credentials
   */
  exports.login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) return res.status(401).json({ message: 'Invalid credentials' });
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    } catch (err) { next(err); }
  };
  