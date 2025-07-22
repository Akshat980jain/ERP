import React, { useState, useEffect } from 'react';
import { CheckCircle, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// AddStudentPanel: visible to faculty/admin
function AddStudentPanel() {
  const { user, token } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '' });
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user || !['faculty', 'admin'].includes(user.role)) return null;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setStatus('');
    try {
      const res = await fetch('/api/auth/create-student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...form })
      });
      const data = await res.json();
      if (data.success) {
        setStatus('Student added successfully!');
        setForm({ name: '', email: '', password: '', department: '' });
      } else {
        setError(data.message || 'Failed to add student');
      }
    } catch {
      setError('Failed to add student');
    }
    setLoading(false);
  };

  return (
    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="font-semibold text-blue-800 mb-2">Add New Student</div>
      <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="border rounded px-2 py-1" required />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="border rounded px-2 py-1" required />
        <input name="password" value={form.password} onChange={handleChange} placeholder="Password" type="password" className="border rounded px-2 py-1" required />
        <input name="department" value={form.department} onChange={handleChange} placeholder="Department" className="border rounded px-2 py-1" required />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50" disabled={loading}>{loading ? 'Adding...' : 'Add Student'}</button>
      </form>
      {status && <div className="text-green-700 text-sm mt-1">{status}</div>}
      {error && <div className="text-red-700 text-sm mt-1">{error}</div>}
    </div>
  );
}

function FacultyApprovalPanel() {
  const { user, token } = useAuth();
  type Request = {
    _id: string;
    user?: { name?: string; email?: string };
    name?: string;
    email?: string;
    requestedRole?: string;
  };
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [remarksMap, setRemarksMap] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (user && user.role === 'faculty') {
      fetchRequests();
    }
    // eslint-disable-next-line
  }, [user]);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verification-requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests);
      } else {
        setError(data.message || 'Failed to fetch requests');
      }
    } catch {
      setError('Failed to fetch requests');
    }
    setLoading(false);
  };

  const handleDecision = async (id: string, status: 'approved' | 'rejected') => {
    setError('');
    setSuccess('');
    const remarks = remarksMap[id] || '';
    try {
      const res = await fetch(`/api/auth/verification-requests/${id}/decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, remarks })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Request processed!');
        setRequests(requests.filter(r => r._id !== id));
        setRemarksMap(prev => { const copy = { ...prev }; delete copy[id]; return copy; });
      } else {
        setError(data.message || 'Failed to process request');
      }
    } catch {
      setError('Failed to process request');
    }
  };

  if (!user || user.role !== 'faculty') return null;
  if (loading) return <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">Loading requests...</div>;
  if (requests.length === 0) return null;

  return (
    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="font-semibold text-green-800 mb-2 flex items-center"><Shield className="w-5 h-5 mr-2" />Pending Student Verification Requests</div>
      {success && <div className="text-green-700 text-sm mb-2">{success}</div>}
      {error && <div className="text-red-700 text-sm mb-2">{error}</div>}
      <div className="space-y-2">
        {requests.map(req => (
          <div key={req._id} className="flex items-center justify-between bg-white p-2 rounded border">
            <div>
              <div className="font-medium">{req.user?.name || req.name} ({req.user?.email || req.email})</div>
              <div className="text-xs text-gray-600">Requested Role: <span className="font-semibold">{req.requestedRole}</span></div>
              <input
                type="text"
                placeholder="Remarks (optional)"
                className="mt-1 px-2 py-1 border rounded text-sm w-64"
                value={remarksMap[req._id] || ''}
                onChange={e => setRemarksMap(prev => ({ ...prev, [req._id]: e.target.value }))}
              />
            </div>
            <div className="flex space-x-2">
              <button
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 flex items-center disabled:opacity-50"
                onClick={() => handleDecision(req._id, 'approved')}
              >
                <CheckCircle className="w-4 h-4 mr-1" />Approve
              </button>
              <button
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
                onClick={() => handleDecision(req._id, 'rejected')}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FacultyDashboard() {
  // Sample data for faculty dashboard
  const attendanceData = [
    { name: 'Present', value: 92, color: '#10B981' },
    { name: 'Absent', value: 8, color: '#EF4444' },
  ];

  const marksData = [
    { subject: 'Mathematics', marks: 88 },
    { subject: 'Physics', marks: 91 },
    { subject: 'Chemistry', marks: 85 },
    { subject: 'Computer Science', marks: 94 },
    { subject: 'English', marks: 89 },
  ];

  const quickStats = [
    { title: 'Overall Attendance', value: '92%', icon: CheckCircle, color: 'text-green-600' },
    { title: 'Average Marks', value: '89%', icon: Shield, color: 'text-blue-600' },
    { title: 'Pending Requests', value: '3', icon: CheckCircle, color: 'text-orange-600' },
    { title: 'Classes Taught', value: '5', icon: Shield, color: 'text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      <FacultyApprovalPanel />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
              <Icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-2">Attendance Overview</h3>
          <div className="h-64">
            {/* Replace with a chart library if available */}
            <ul className="space-y-2">
              {attendanceData.map((entry, index) => (
                <li key={index} className="flex items-center">
                  <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
                  <span className="text-gray-700">{entry.name}: {entry.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-2">Recent Marks</h3>
          <div className="h-64">
            {/* Replace with a chart library if available */}
            <ul className="space-y-2">
              {marksData.map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span className="text-gray-700">{entry.subject}</span>
                  <span className="font-semibold text-blue-600">{entry.marks}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}