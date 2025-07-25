const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const coursesRouter = require('./routes/courses');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ========== DATABASE CONNECTION ==========
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/your-app-name', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// ========== API ROUTES ==========
// Mount the authentication routes
app.use('/api/auth', require('./routes/auth'));
// Mount other routers here as you create them (e.g., admin, academic, etc.)

// Feature routes
app.use('/api/courses', coursesRouter);
app.use('/api/students', require('./routes/students'));
app.use('/api/academic', require('./routes/academic'));
app.use('/api/finance', require('./routes/finance'));
app.use('/api/library', require('./routes/library'));
app.use('/api/placement', require('./routes/placement'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/services', require('./routes/services'));
// Reports, analytics, schedule, and settings would be handled in their respective routers if available
// If not, they can be handled under /api/admin or /api/academic as appropriate


// ========== SERVER START ==========
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;