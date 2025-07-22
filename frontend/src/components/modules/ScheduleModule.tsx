// src/components/modules/ScheduleModule.tsx
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Plus, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface ScheduleItem {
  _id: string;
  course: {
    _id: string;
    name: string;
    code: string;
  };
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
  type: 'lecture' | 'lab' | 'tutorial' | 'seminar';
  faculty: {
    _id: string;
    name: string;
  };
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

export function ScheduleModule() {
  const { user, token } = useAuth();
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [newScheduleItem, setNewScheduleItem] = useState({
    course: '',
    dayOfWeek: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
    room: '',
    type: 'lecture' as const
  });

  useEffect(() => {
    fetchSchedule();
    fetchCourses();
  }, []);

  const fetchSchedule = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/schedule', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSchedule(data.schedule);
      } else {
        setError(data.message || 'Failed to fetch schedule');
      }
    } catch {
      setError('Failed to fetch schedule');
    }
    setLoading(false);
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCourses(data.courses);
      }
    } catch {
      console.log('Failed to fetch courses');
    }
  };

  const addScheduleItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newScheduleItem)
      });
      const data = await res.json();
      if (data.success) {
        setSchedule([...schedule, data.scheduleItem]);
        setNewScheduleItem({
          course: '',
          dayOfWeek: 'Monday',
          startTime: '09:00',
          endTime: '10:00',
          room: '',
          type: 'lecture'
        });
        setShowAddForm(false);
        setSuccess('Schedule item added successfully!');
      } else {
        setError(data.message || 'Failed to add schedule item');
      }
    } catch {
      setError('Failed to add schedule item');
    }
    setLoading(false);
  };

  const updateScheduleItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/schedule/${editingItem._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newScheduleItem)
      });
      const data = await res.json();
      if (data.success) {
        setSchedule(schedule.map(item => 
          item._id === editingItem._id ? data.scheduleItem : item
        ));
        setEditingItem(null);
        setNewScheduleItem({
          course: '',
          dayOfWeek: 'Monday',
          startTime: '09:00',
          endTime: '10:00',
          room: '',
          type: 'lecture'
        });
        setSuccess('Schedule item updated successfully!');
      } else {
        setError(data.message || 'Failed to update schedule item');
      }
    } catch {
      setError('Failed to update schedule item');
    }
    setLoading(false);
  };

  const deleteScheduleItem = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this schedule item?')) return;

    try {
      const res = await fetch(`/api/schedule/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSchedule(schedule.filter(item => item._id !== id));
        setSuccess('Schedule item deleted successfully!');
      } else {
        setError(data.message || 'Failed to delete schedule item');
      }
    } catch {
      setError('Failed to delete schedule item');
    }
  };

  const startEditing = (item: ScheduleItem) => {
    setEditingItem(item);
    setNewScheduleItem({
      course: item.course._id,
      dayOfWeek: item.dayOfWeek,
      startTime: item.startTime,
      endTime: item.endTime,
      room: item.room,
      type: item.type
    });
    setShowAddForm(true);
  };

  const getScheduleForDay = (day: string) => {
    return schedule
      .filter(item => item.dayOfWeek === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lecture': return 'bg-blue-100 text-blue-800';
      case 'lab': return 'bg-green-100 text-green-800';
      case 'tutorial': return 'bg-yellow-100 text-yellow-800';
      case 'seminar': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Schedule</h2>
        {user?.role !== 'student' && (
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingItem(null);
              setNewScheduleItem({
                course: '',
                dayOfWeek: 'Monday',
                startTime: '09:00',
                endTime: '10:00',
                room: '',
                type: 'lecture'
              });
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            {editingItem ? 'Cancel Edit' : 'Add Schedule'}
          </button>
        )}
      </div>

      {error && <div className="text-red-700 bg-red-50 p-3 rounded">{error}</div>}
      {success && <div className="text-green-700 bg-green-50 p-3 rounded">{success}</div>}

      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">
            {editingItem ? 'Edit Schedule Item' : 'Add New Schedule Item'}
          </h3>
          <form onSubmit={editingItem ? updateScheduleItem : addScheduleItem} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                <select
                  value={newScheduleItem.course}
                  onChange={(e) => setNewScheduleItem({ ...newScheduleItem, course: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Select a course</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>
                      {course.name} ({course.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={newScheduleItem.type}
                  onChange={(e) => setNewScheduleItem({ ...newScheduleItem, type: e.target.value as any })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="lecture">Lecture</option>
                  <option value="lab">Lab</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="seminar">Seminar</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                <select
                  value={newScheduleItem.dayOfWeek}
                  onChange={(e) => setNewScheduleItem({ ...newScheduleItem, dayOfWeek: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  {DAYS_OF_WEEK.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <select
                  value={newScheduleItem.startTime}
                  onChange={(e) => setNewScheduleItem({ ...newScheduleItem, startTime: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  {TIME_SLOTS.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <select
                  value={newScheduleItem.endTime}
                  onChange={(e) => setNewScheduleItem({ ...newScheduleItem, endTime: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  {TIME_SLOTS.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
              <input
                type="text"
                placeholder="Room number or location"
                value={newScheduleItem.room}
                onChange={(e) => setNewScheduleItem({ ...newScheduleItem, room: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div className="flex space-x-2">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" disabled={loading}>
                {loading ? (editingItem ? 'Updating...' : 'Adding...') : (editingItem ? 'Update' : 'Add')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingItem(null);
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-7 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
          {DAYS_OF_WEEK.map(day => (
            <div key={day} className="p-4">
              <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                {day}
              </h3>
              <div className="space-y-2">
                {getScheduleForDay(day).map(item => (
                  <div key={item._id} className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900 mb-1">
                          {item.course.name}
                        </div>
                        <div className="text-xs text-gray-600 mb-2">
                          {item.course.code}
                        </div>
                        <div className="flex items-center text-xs text-gray-500 mb-1">
                          <Clock className="w-3 h-3 mr-1" />
                          {item.startTime} - {item.endTime}
                        </div>
                        <div className="flex items-center text-xs text-gray-500 mb-2">
                          <MapPin className="w-3 h-3 mr-1" />
                          {item.room}
                        </div>
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(item.type)}`}>
                          {item.type}
                        </span>
                      </div>
                      {user?.role !== 'student' && (
                        <div className="flex space-x-1 ml-2">
                          <button
                            onClick={() => startEditing(item)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Edit"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => deleteScheduleItem(item._id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {getScheduleForDay(day).length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Calendar className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-xs">No classes scheduled</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
