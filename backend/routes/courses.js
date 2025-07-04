const express = require('express');
const Course = require('../models/Course');
const auth = require('../middleware/auth');

const router = express.Router();
const allowedTags = ['business', 'computer', 'math', 'science', 'language'];

router.post('/', auth('teacher'), async (req, res) => {
  const { name, description, startDate, tags } = req.body;

  if (!tags.every(tag => allowedTags.includes(tag))) {
    return res.status(400).json({ error: 'Invalid tags' });
  }

  const course = new Course({
    name,
    description,
    startDate,
    tags,
    instructor: req.user.id
  });

  await course.save();
  res.status(201).json(course);
});

router.put('/:id', auth('teacher'), async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course || course.instructor.toString() !== req.user.id) {
    return res.sendStatus(403);
  }

  Object.assign(course, req.body);
  await course.save();
  res.json(course);
});

router.patch('/:id/archive', auth('teacher'), async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course || course.instructor.toString() !== req.user.id)
    return res.sendStatus(403);

  course.status = course.status === 'active' ? 'archived' : 'active';
  await course.save();
  res.json({ status: course.status });
});

router.post('/:id/enroll', auth('student'), async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course || course.status !== 'active') {
    return res.status(400).json({ error: 'Course not available' });
  }

  if (!course.enrolledStudents.includes(req.user.id)) {
    course.enrolledStudents.push(req.user.id);
    await course.save();
  }

  res.json({ message: 'Enrolled' });
});

router.post('/:id/unenroll', auth('student'), async (req, res) => {
  const course = await Course.findById(req.params.id);
  course.enrolledStudents = course.enrolledStudents.filter(
    id => id.toString() !== req.user.id
  );
  await course.save();
  res.json({ message: 'Unenrolled' });
});

router.post('/:id/review', auth('student'), async (req, res) => {
  const { rating, comment } = req.body;
  const course = await Course.findById(req.params.id);

  if (!course.enrolledStudents.includes(req.user.id)) {
    return res.status(403).json({ error: 'You must be enrolled' });
  }

  course.reviews.push({ student: req.user.id, rating, comment });
  await course.save();
  res.json({ message: 'Review posted' });
});

module.exports = router;
// This code defines the routes for managing courses in an educational platform.