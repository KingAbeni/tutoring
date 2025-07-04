const express = require('express');
const jwt = require('jsonwebtoken');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

const router = express.Router();
const JWT_SECRET = 'yourSecretKey';

function isStrongPassword(password) {
  const minLength = 7;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  return password.length >= minLength && hasUppercase && hasSpecial;
}

router.post('/signup/:role', async (req, res) => {
  const { role } = req.params;
  const data = req.body;

  if (!isStrongPassword(data.password)) {
    return res.status(400).json({
      error: 'Password must be at least 7 characters, include an uppercase letter and a special character.'
    });
  }

  const UserModel = role === 'teacher' ? Teacher : Student;
  const existing = await UserModel.findOne({ email: data.email });
  if (existing) return res.status(400).json({ error: 'Email already in use' });

  const user = new UserModel(data);
  await user.save();
  res.json({ message: `${role} registered successfully` });
});

router.post('/login/:role', async (req, res) => {
  const { role } = req.params;
  const { email, password } = req.body;

  const UserModel = role === 'teacher' ? Teacher : Student;
  const user = await UserModel.findOne({ email });
  if (!user) return res.status(400).json({ error: 'User not found' });

  const bcrypt = require('bcrypt');
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id, role }, JWT_SECRET, { expiresIn: '2h' });
  res.json({ token, name: user.name, role });
});

module.exports = router;
