/**
 * AUTH CONTROLLER
 * Supports registration and login for the SMM panel.
 */

const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/User');
const WalletService = require('../services/WalletService');

const authSchema = Joi.object({
  username: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    }
  );
};

class AuthController {
  static async register(req, res, next) {
    try {
      const { error, value } = authSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ success: false, error: error.details[0].message });
      }

      const existingUser = await User.findOne({ $or: [{ email: value.email }, { username: value.username }] });
      if (existingUser) {
        return res.status(400).json({ success: false, error: 'User already exists' });
      }

      const user = new User(value);
      await user.save();
      await WalletService.createWallet(user._id);

      const token = generateToken(user);
      return res.json({ success: true, token, user: { id: user._id, username: user.username, email: user.email, role: user.role } });
    } catch (err) {
      next(err);
    }
  }

  static async login(req, res, next) {
    try {
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ success: false, error: error.details[0].message });
      }

      const user = await User.findOne({ email: value.email });
      if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      const isMatch = await user.comparePassword(value.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      const token = generateToken(user);
      return res.json({ success: true, token, user: { id: user._id, username: user.username, email: user.email, role: user.role } });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;
