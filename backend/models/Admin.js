const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  surname: String,
  password: { type: String, required: true }
});

AdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  // Log to check for double hashing
  if (this.password && /^\$2[aby]\$/.test(this.password)) {
    console.log('[Admin pre-save] Password appears already hashed:', this.password);
  } else {
    console.log('[Admin pre-save] Password will be hashed:', this.password);
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('Admin', AdminSchema);
