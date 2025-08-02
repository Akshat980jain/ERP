# Schedule-Based Attendance System

## Overview

The ERP application now includes a comprehensive schedule-based attendance system that ensures attendance is only marked according to the course schedule and within specified time windows. This system provides better accuracy, prevents attendance fraud, and integrates seamlessly with the existing course scheduling system.

## Key Features

### 1. Schedule Integration
- Attendance can only be marked for scheduled class sessions
- Automatic validation against course schedules
- Support for multiple time slots per day
- Room information tracking

### 2. Time Window Validation
- Attendance can be marked 15 minutes before class starts
- Attendance can be marked up to 30 minutes after class ends
- Real-time validation of marking windows
- Visual indicators for current, upcoming, and past sessions

### 3. Enhanced Attendance Status
- **Present**: Student attended the class
- **Absent**: Student did not attend the class
- **Late**: Student attended but arrived late
- **Remarks**: Additional notes for attendance records

### 4. Faculty Controls
- Only course faculty or admins can mark attendance
- Batch attendance marking for entire classes
- Individual student attendance marking
- Attendance history and statistics

## Database Schema Changes

### Updated Attendance Model

```javascript
const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late'],
    required: true
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  remarks: String,
  // New fields for schedule-based attendance
  scheduleSlot: {
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    room: String
  },
  markedAt: {
    type: Date,
    default: Date.now
  },
  isWithinSchedule: {
    type: Boolean,
    default: false
  }
});
```

### Index Changes
- Updated compound index to include schedule slot information
- Prevents duplicate attendance records for the same student, course, date, and time slot

## API Endpoints

### 1. Get Schedule-Based Attendance
```
GET /api/academic/schedule-attendance?courseId={courseId}&date={date}
```
Returns attendance data organized by schedule slots for a specific course and date.

### 2. Mark Schedule-Based Attendance
```
POST /api/academic/schedule-attendance
```
Body:
```json
{
  "courseId": "course_id",
  "date": "2024-01-15",
  "scheduleSlot": {
    "startTime": "09:00",
    "endTime": "10:00"
  },
  "attendanceData": [
    {
      "studentId": "student_id",
      "status": "present",
      "remarks": "Optional remarks"
    }
  ]
}
```

### 3. Get Attendance Schedule
```
GET /api/academic/attendance-schedule?courseId={courseId}
```
Returns today's schedule with attendance status for a course.

## Frontend Implementation

### New Attendance Module Features

1. **Schedule-Based Interface**
   - Shows only scheduled classes for the selected date
   - Displays time slots with current status (upcoming, current, past)
   - Visual indicators for time window validation

2. **Real-Time Updates**
   - Current time display
   - Automatic status updates for time slots
   - Live validation of attendance marking windows

3. **Enhanced UI**
   - Color-coded status indicators
   - Time-based session status
   - Batch attendance marking per time slot
   - Individual student attendance controls

### Key Components

```typescript
interface ScheduleAttendanceData {
  course: {
    _id: string;
    name: string;
    code: string;
  };
  date: string;
  dayOfWeek: string;
  schedule: Array<{
    day: string;
    time: string;
    room: string;
  }>;
  attendanceMatrix: Array<{
    slot: {
      day: string;
      time: string;
      room: string;
    };
    attendance: Array<{
      student: {
        _id: string;
        name: string;
        email: string;
        studentId: string;
      };
      status: 'present' | 'absent' | 'late' | null;
      markedAt: string | null;
      isWithinSchedule: boolean;
      remarks: string;
    }>;
  }>;
}
```

## Usage Instructions

### For Faculty

1. **Access Attendance Module**
   - Navigate to the Attendance module in the dashboard
   - Select the course you want to mark attendance for
   - Choose the date for attendance marking

2. **Mark Attendance**
   - View scheduled classes for the selected date
   - Click on individual students to mark them as Present, Absent, or Late
   - Use batch marking options for efficiency
   - Submit attendance for each time slot

3. **Time Window Validation**
   - Attendance can only be marked within the allowed time window
   - Visual indicators show if marking is within the valid time frame
   - Outside time window marking is disabled

### For Students

1. **View Attendance**
   - Access attendance records through the Academic module
   - View attendance statistics and history
   - Check attendance percentage by course

2. **Attendance Reports**
   - Detailed attendance reports with schedule information
   - Export functionality for attendance data
   - Historical attendance tracking

## Validation Rules

### Time Window Validation
- **Before Class**: 15 minutes before scheduled start time
- **During Class**: Full class duration
- **After Class**: 30 minutes after scheduled end time

### Schedule Validation
- Attendance can only be marked for scheduled class sessions
- Automatic validation against course schedule
- Prevents attendance marking for non-scheduled times

### Permission Validation
- Only course faculty can mark attendance for their courses
- Admins can mark attendance for any course
- Students cannot mark their own attendance

## Benefits

1. **Accuracy**: Ensures attendance is only marked for actual class sessions
2. **Prevention of Fraud**: Time window validation prevents false attendance marking
3. **Integration**: Seamless integration with existing course scheduling
4. **Flexibility**: Supports multiple time slots and different class types
5. **Reporting**: Enhanced reporting with schedule-based data
6. **User Experience**: Intuitive interface with real-time feedback

## Technical Implementation

### Backend Changes
- Updated Attendance model with schedule information
- New API endpoints for schedule-based attendance
- Pre-save middleware for schedule validation
- Enhanced error handling and validation

### Frontend Changes
- New schedule-based attendance interface
- Real-time time validation
- Enhanced TypeScript interfaces
- Improved user experience with visual feedback

### Database Changes
- New fields in attendance collection
- Updated indexes for better performance
- Backward compatibility maintained

## Migration Notes

The new attendance system is backward compatible with existing attendance records. Existing records will continue to work, but new attendance marking will use the schedule-based system.

## Testing

Run the test script to verify the implementation:
```bash
cd backend
node test-attendance.js
```

This will test the new attendance schema and validation rules.

## Future Enhancements

1. **Mobile Support**: Mobile-optimized attendance marking interface
2. **QR Code Attendance**: QR code-based attendance marking
3. **Biometric Integration**: Fingerprint or facial recognition attendance
4. **Automated Notifications**: Email/SMS notifications for attendance
5. **Advanced Analytics**: Detailed attendance analytics and reporting 