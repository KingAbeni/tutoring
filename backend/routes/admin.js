const express = require('express');
const Admin = require('../models/Admin');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Course = require('../models/Course');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = 'yourSecretKey';

function isStrongPassword(password) {
  const minLength = 7;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  return password.length >= minLength && hasUppercase && hasSpecial;
}

// Admin login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', { email });

  const admin = await Admin.findOne({ email });
  if (!admin) {
    console.log('Login failed: Email not found:', email);
    return res.status(400).json({ error: 'Admin not found' });
  }

  // Log the hashed password for debugging
  console.log('Admin:', admin.name, 'is connected with email:', email);


  const isMatch = await bcrypt.compare(password, admin.password);
  console.log('bcrypt.compare result:', isMatch);
  if (!isMatch) {
    console.log('Login failed: Wrong password for email:', email);
    return res.status(400).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: admin._id, role: 'admin' }, JWT_SECRET, { expiresIn: '2h' });
  console.log('Admin login successful:', email);
  res.json({ token, role: 'admin', name: admin.name });
});

// Create another admin (only admins can do this)
router.post('/create', auth('admin'), async (req, res) => {
  const { email, name, surname, password } = req.body;

  if (!isStrongPassword(password)) {
    return res.status(400).json({
      error: 'Password must be at least 7 characters, include an uppercase letter and a special character.'
    });
  }

  const existing = await Admin.findOne({ email });
  if (existing) return res.status(400).json({ error: 'Email already exists' });

  const newAdmin = new Admin({ email, name, surname, password });
  await newAdmin.save();
  res.status(201).json({ message: 'Admin created' });
});

// List all admins
router.get('/all', auth('admin'), async (req, res) => {
  const admins = await Admin.find({}, '-password');
  res.json(admins);
});

// Update admin (self or others)
router.put('/:id', auth('admin'), async (req, res) => {
  const { id } = req.params;
  const update = { ...req.body };
  if (update.password) {
    if (!isStrongPassword(update.password)) {
      return res.status(400).json({
        error: 'Password must be at least 7 characters, include an uppercase letter and a special character.'
      });
    }
    update.password = await bcrypt.hash(update.password, 10);
  }
  const admin = await Admin.findByIdAndUpdate(id, update, { new: true, runValidators: true, context: 'query' });
  if (!admin) return res.status(404).json({ error: 'Admin not found' });
  res.json({ message: 'Admin updated', admin: { ...admin.toObject(), password: undefined } });
});

// Delete admin
router.delete('/:id', auth('admin'), async (req, res) => {
  const { id } = req.params;
  if (req.user.id === id) return res.status(400).json({ error: "You can't delete yourself" });
  const admin = await Admin.findByIdAndDelete(id);
  if (!admin) return res.status(404).json({ error: 'Admin not found' });
  res.json({ message: 'Admin deleted' });
});

// --- Admin control over Teachers ---
router.get('/teachers', auth('admin'), async (req, res) => {
  const teachers = await Teacher.find({}, '-password');
  res.json(teachers);
});

router.delete('/teachers/:id', auth('admin'), async (req, res) => {
  const teacher = await Teacher.findByIdAndDelete(req.params.id);
  if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
  res.json({ message: 'Teacher deleted' });
});

// --- Admin control over Students ---
router.get('/students', auth('admin'), async (req, res) => {
  const students = await Student.find({}, '-password');
  res.json(students);
});

router.delete('/students/:id', auth('admin'), async (req, res) => {
  const student = await Student.findByIdAndDelete(req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  res.json({ message: 'Student deleted' });
});

// --- Admin control over Courses ---
router.get('/courses', auth('admin'), async (req, res) => {
  const courses = await Course.find({}).populate('instructor', 'name surname').populate('enrolledStudents', 'name surname');
  res.json(courses);
});

router.delete('/courses/:id', auth('admin'), async (req, res) => {
  const course = await Course.findByIdAndDelete(req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  res.json({ message: 'Course deleted' });
});

module.exports = router;