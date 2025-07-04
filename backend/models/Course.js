const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  startDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'archived'], default: 'active' },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  tags: [{ type: String }],
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  reviews: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    date: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model('Course', CourseSchema);
