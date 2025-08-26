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
const servicesRoutes = require('./routes/services');
const transportRoutes = require('./routes/transport');
const studentsRoutes = require('./routes/students');
const scheduleRoutes = require('./routes/schedule');
const assessmentsRoutes = require('./routes/assessments');
const examsRoutes = require('./routes/exams');
const feedbackRoutes = require('./routes/feedback');
const calendarRoutes = require('./routes/calendar');
const reportsRoutes = require('./routes/reports');
const settingsRoutes = require('./routes/settings');
const leavesRoutes = require('./routes/leaves');
const hostelRoutes = require('./routes/hostel');
const parentRoutes = require('./routes/parents');
const emailRoutes = require('./routes/email');

// ========== SECURITY & PERFORMANCE MIDDLEWARE ==========
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));

// CORS configuration (supports multiple origins and wildcard)
const configuredOrigins = (process.env.CORS_ORIGINS || process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim());

const corsOptions = {
  origin: (origin, callback) => {
    console.log('CORS request from origin:', origin); // Log incoming origin
    // Allow non-browser requests or same-origin
    if (!origin) return callback(null, true);
    if (configuredOrigins.includes('*') || configuredOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Disposition'],
  optionsSuccessStatus: 204,
  preflightContinue: false
};
app.use(cors(corsOptions));
// Explicitly handle preflight OPTIONS requests for all routes
app.options('*', cors(corsOptions));

// Rate limiting - move AFTER CORS so 429 responses include CORS headers
const limitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
const limitMax = Number(process.env.RATE_LIMIT_MAX || (process.env.NODE_ENV === 'production' ? 100 : 1000));
const limiter = rateLimit({
  windowMs: limitWindowMs,
  max: limitMax,
  standardHeaders: true,
  legacyHeaders: false,
  // Do not rate-limit preflight requests
  skip: (req) => req.method === 'OPTIONS',
  message: {
    success: false,
    message: 'Too many requests. Please try again later.'
  }
});
app.use('/api/', limiter);

// Trust proxy (useful when deploying behind reverse proxies)
app.set('trust proxy', 1);

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
app.use('/api/services', servicesRoutes);
app.use('/api/transport', transportRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/assessments', assessmentsRoutes);
app.use('/api/exams', examsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/leaves', leavesRoutes);
app.use('/api/hostel', hostelRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/email', emailRoutes);

// ========== SERVER START ==========
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});

// ========== SOCKET.IO SETUP ==========
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: (process.env.CORS_ORIGINS || process.env.CLIENT_URL || 'http://localhost:5173')
      .split(',')
      .map((s) => s.trim())
      .includes('*')
        ? '*'
        : (process.env.CORS_ORIGINS || process.env.CLIENT_URL || 'http://localhost:5173')
            .split(',')
            .map((s) => s.trim()),
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
