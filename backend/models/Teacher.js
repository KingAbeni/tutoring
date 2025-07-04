const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const TeacherSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  surname: { type: String, required: true },
  aboutMe: { type: String, required: true },
  startTeachingDate: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  password: { type: String, required: true },
});

TeacherSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('Teacher', TeacherSchema);
