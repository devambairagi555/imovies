
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User } = require('../models');

const send = (res, u) => res.json({
  token: jwt.sign(
    { id: u._id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  ),
  user: { name: u.name, email: u.email }
});

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password || password.length < 6) {
      return res.status(400).json({
        message: 'Enter a name, email and a password of 6+ characters'
      });
    }

    if (await User.findOne({ email })) {
      return res.status(409).json({
        message: 'That email is already registered'
      });
    }

    send(res, await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 10)
    }));
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const u = await User.findOne({ email: req.body.email });

    if (!u || !(await bcrypt.compare(req.body.password || '', u.password))) {
      return res.status(401).json({
        message: 'Email or password is incorrect'
      });
    }

    send(res, u);
  } catch (err) {
    next(err);
  }
});

// Request a password-reset token
router.post('/forgot-password', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();

    // Use the same response whether the account exists or not.
    const message =
      'If an account exists for this email, reset instructions will be sent.';

    if (!email) {
      return res.status(400).json({ message: 'Enter your email address' });
    }

    const user = await User.findOne({ email });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      user.resetPasswordToken = tokenHash;
      user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
      await user.save();

      // Temporary development-only output. Do not use this in production.
      console.log(`Password reset token for ${email}: ${resetToken}`);
    }

    res.json({ message });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
