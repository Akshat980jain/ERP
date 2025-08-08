const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// ========== ROUTES ==========
const authRoutes = require('./routes/auth');
const coursesRouter = require('./routes/courses');
const academicRoutes = require('./routes/academic');
const financeRoutes = require('./routes/finance');
const libraryRoutes = require('./routes/library');
const placementRoutes = require('./routes/placement');
const notificationRoutes = require('./routes/notifications');
const assignmentRoutes = require('./routes/assignments');
const eventRoutes = require('./routes/events');
const chatRoutes = require('./routes/chat');
const analyticsRoutes = require('./routes/analytics');
const transportRoutes = require('./routes/transport');
const studentsRoutes = require('./routes/students');
const scheduleRoutes = require('./routes/schedule');
const assessmentsRoutes = require('./routes/assessments');

// ========== SECURITY & PERFORMANCE MIDDLEWARE ==========
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files (if needed)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ========== DATABASE CONNECTION ==========
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://akshat980jain:zm3aHd1m1a4pxU7q@cluster0.nkrpubg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// ========== API ROUTES ==========
app.use('/api/auth', authRoutes);
app.use('/api/courses', coursesRouter);
app.use('/api/academic', academicRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/placement', placementRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/transport', transportRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/assessments', assessmentsRoutes);

// ========== SERVER START ==========
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// ========== SOCKET.IO SETUP ==========
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available globally
global.io = io;

module.exports = app;
