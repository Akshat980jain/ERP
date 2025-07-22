const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Course = require('../models/Course');
const Book = require('../models/Book');
const Job = require('../models/Job');
const Fee = require('../models/Fee');
const Notification = require('../models/Notification');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding...');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedUsers = async () => {
  const users = [
    {
      name: 'John Doe',
      email: 'student@educonnect.com',
      password: 'password',
      role: 'student',
      profile: {
        studentId: 'ST2024001',
        phone: '+1234567890',
        semester: 6,
        section: 'A'
      },
      department: 'Computer Science'
    },
    {
      name: 'Dr. Sarah Johnson',
      email: 'faculty@educonnect.com',
      password: 'password',
      role: 'faculty',
      profile: {
        employeeId: 'FC2024001',
        phone: '+1234567891'
      },
      department: 'Computer Science'
    },
    {
      name: 'Michael Admin',
      email: 'admin@educonnect.com',
      password: 'password',
      role: 'admin',
      profile: {
        employeeId: 'AD2024001',
        phone: '+1234567892'
      }
    },
    {
      name: 'Emma Library',
      email: 'library@educonnect.com',
      password: 'password',
      role: 'library',
      profile: {
        employeeId: 'LB2024001',
        phone: '+1234567893'
      }
    },
    {
      name: 'Robert Placement',
      email: 'placement@educonnect.com',
      password: 'password',
      role: 'placement',
      profile: {
        employeeId: 'PL2024001',
        phone: '+1234567894'
      }
    },
    {
      name: 'Akshat Jain',
      email: 'akshat980jain@gmail.com',
      password: 'Akshat@123',
      role: 'admin',
      profile: {
        employeeId: 'AD2024002',
        phone: '9456609840'
      }
    }
  ];

  // Hash passwords before insertMany
  for (const user of users) {
    user.password = await bcrypt.hash(user.password, 12);
  }

  await User.deleteMany({});
  const createdUsers = await User.insertMany(users);
  console.log('✅ Users seeded successfully');
  return createdUsers;
};

const seedCourses = async (users) => {
  const faculty = users.find(u => u.role === 'faculty');
  const student = users.find(u => u.role === 'student');

  const courses = [
    {
      name: 'Data Structures',
      code: 'CS101',
      description: 'Introduction to data structures and algorithms',
      credits: 4,
      semester: 6,
      department: 'Computer Science',
      faculty: faculty._id,
      enrolledStudents: [student._id],
      schedule: [
        { day: 'Monday', time: '9:00 AM', duration: 60, room: 'Room 301' },
        { day: 'Wednesday', time: '9:00 AM', duration: 60, room: 'Room 301' },
        { day: 'Friday', time: '9:00 AM', duration: 60, room: 'Room 301' }
      ]
    },
    {
      name: 'Algorithms',
      code: 'CS102',
      description: 'Advanced algorithms and complexity analysis',
      credits: 3,
      semester: 6,
      department: 'Computer Science',
      faculty: faculty._id,
      enrolledStudents: [student._id],
      schedule: [
        { day: 'Tuesday', time: '10:00 AM', duration: 60, room: 'Room 205' },
        { day: 'Thursday', time: '10:00 AM', duration: 60, room: 'Room 205' }
      ]
    }
  ];

  await Course.deleteMany({});
  const createdCourses = await Course.insertMany(courses);
  console.log('✅ Courses seeded successfully');
  return createdCourses;
};

const seedBooks = async () => {
  const books = [
    {
      isbn: '978-0262033848',
      title: 'Introduction to Algorithms',
      author: 'Thomas H. Cormen',
      publisher: 'MIT Press',
      publishYear: 2009,
      category: 'Computer Science',
      description: 'Comprehensive guide to algorithms',
      totalCopies: 5,
      availableCopies: 3,
      location: 'CS Section - Shelf A1',
      price: 5000
    },
    {
      isbn: '978-0134685991',
      title: 'Effective Java',
      author: 'Joshua Bloch',
      publisher: 'Addison-Wesley',
      publishYear: 2017,
      category: 'Programming',
      description: 'Best practices for Java programming',
      totalCopies: 4,
      availableCopies: 2,
      location: 'Programming Section - Shelf B2',
      price: 3500
    }
  ];

  await Book.deleteMany({});
  await Book.insertMany(books);
  console.log('✅ Books seeded successfully');
};

const seedJobs = async (users) => {
  const placementOfficer = users.find(u => u.role === 'placement');

  const jobs = [
    {
      company: 'Microsoft',
      position: 'Software Engineer',
      description: 'Join Microsoft as a Software Engineer and work on cutting-edge technologies.',
      requirements: ['B.Tech/B.E in CS/IT', 'Strong programming skills', 'CGPA > 7.5'],
      package: { min: 1800000, max: 2200000 },
      location: 'Bangalore',
      type: 'full-time',
      deadline: new Date('2024-02-15'),
      eligibleDepartments: ['Computer Science', 'Information Technology'],
      minimumCGPA: 7.5,
      postedBy: placementOfficer._id
    },
    {
      company: 'Google',
      position: 'Software Development Intern',
      description: 'Summer internship program at Google with mentorship and real project experience.',
      requirements: ['B.Tech/B.E in CS/IT', 'Strong problem-solving skills', 'CGPA > 8.0'],
      package: { min: 80000, max: 80000 },
      location: 'Hyderabad',
      type: 'internship',
      deadline: new Date('2024-02-10'),
      eligibleDepartments: ['Computer Science', 'Information Technology'],
      minimumCGPA: 8.0,
      postedBy: placementOfficer._id
    }
  ];

  await Job.deleteMany({});
  await Job.insertMany(jobs);
  console.log('✅ Jobs seeded successfully');
};

const seedFees = async (users) => {
  const student = users.find(u => u.role === 'student');

  const fees = [
    {
      student: student._id,
      type: 'tuition',
      amount: 45000,
      dueDate: new Date('2024-01-30'),
      status: 'pending',
      semester: 'Spring 2024',
      academicYear: '2023-24'
    },
    {
      student: student._id,
      type: 'library',
      amount: 2000,
      dueDate: new Date('2024-01-15'),
      paidDate: new Date('2024-01-10'),
      status: 'paid',
      semester: 'Spring 2024',
      academicYear: '2023-24',
      paymentMethod: 'upi',
      transactionId: 'TXN123456789'
    }
  ];

  await Fee.deleteMany({});
  await Fee.insertMany(fees);
  console.log('✅ Fees seeded successfully');
};

const seedNotifications = async (users) => {
  const admin = users.find(u => u.role === 'admin');

  const notifications = [
    {
      title: 'Fee Payment Due',
      message: 'Your semester fee payment is due on January 30, 2024. Please pay to avoid late fees.',
      type: 'warning',
      category: 'finance',
      targetRoles: ['student'],
      createdBy: admin._id
    },
    {
      title: 'New Assignment Posted',
      message: 'Data Structures assignment has been posted. Due date: February 5, 2024.',
      type: 'info',
      category: 'academic',
      targetRoles: ['student'],
      createdBy: admin._id
    },
    {
      title: 'System Maintenance',
      message: 'Scheduled system maintenance on January 27, 2024 from 2:00 AM to 4:00 AM.',
      type: 'info',
      category: 'general',
      targetRoles: ['student', 'faculty', 'admin'],
      createdBy: admin._id
    }
  ];

  await Notification.deleteMany({});
  await Notification.insertMany(notifications);
  console.log('✅ Notifications seeded successfully');
};

const seedDatabase = async () => {
  try {
    await connectDB();
    
    console.log('🌱 Starting database seeding...');
    
    const users = await seedUsers();
    await seedCourses(users);
    await seedBooks();
    await seedJobs(users);
    await seedFees(users);
    await seedNotifications(users);
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Demo Login Credentials:');
    console.log('Student: student@educonnect.com / password');
    console.log('Faculty: faculty@educonnect.com / password');
    console.log('Admin: admin@educonnect.com / password');
    console.log('Library: library@educonnect.com / password');
    console.log('Placement: placement@educonnect.com / password');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();