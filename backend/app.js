const express = require('express');
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const bcrypt = require('bcrypt');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
// ...add other route imports as needed...

const app = express();

app.use(express.json()); // Must be before routes

// Middleware to log every request
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Register all routes
app.use('/admin', adminRoutes);
app.use('/auth', authRoutes);
app.use('/courses', courseRoutes);
// ...register other routes as needed...

async function seedInitialAdmin() {
  try {
    const existing = await Admin.findOne({});
    if (existing) {
      console.log('Seed admin already exists');
      return;
    }

    // Only provide plain password here, let pre-save hook hash it
    const plainPassword = 'Admin@123';
    console.log('[Seed] Plain password for admin:', plainPassword);

    const admin = new Admin({
      email: 'admin@tutoring.com',
      name: 'Super',
      surname: 'Admin',
      password: plainPassword
    });

    await admin.save();
    console.log('✅ Seed admin created: admin@tutoring.com / Admin@123');
  } catch (err) {
    console.error('Error seeding admin:', err);
  }
}

mongoose.connect('mongodb://localhost:27017/tutoring-app')
  .then(async () => {
    console.log('MongoDB connected');
    await seedInitialAdmin();
    app.listen(5000, () => console.log('Server running on port 5000'));
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Global error handler to log errors
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});