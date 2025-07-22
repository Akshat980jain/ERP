import React, { useEffect, useState } from 'react';
import { Users, GraduationCap, BookOpen, DollarSign, Shield, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { User as AppUser } from '../../types';

// Types
interface RequestUser {
  _id: string;
  name: string;
  email: string;
  role: string;
}
interface VerificationRequest {
  _id: string;
  user?: RequestUser | null;
  requestedRole: string;
  status?: string;
  remarks?: string;
  name?: string;
  email?: string;
  password?: string;
  reason?: string;
  program?: string;
  // Add other known fields as needed
}

// Helper to check if user is a program admin
function isProgramAdmin(user: AppUser | null): boolean {
  return !!user && user.role === 'admin' && Array.isArray(user.adminPrograms) && (user.adminPrograms?.length ?? 0) > 0;
}

// AdminVerificationPanel: visible only to super-admins and program-admins, but with different logic
function AdminVerificationPanel() {
  const { user, token } = useAuth();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [remarksMap, setRemarksMap] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (user && user.role === 'admin') {
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
        let filtered = data.requests;
        if (isProgramAdmin(user)) {
          // Program admin: only see requests for faculty for their program
          filtered = filtered.filter((req: VerificationRequest) =>
            req.requestedRole === 'faculty' &&
            req.program && user.adminPrograms && user.adminPrograms.includes(req.program)
          );
        }
        setRequests(filtered);
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
        console.error('Decision error:', data);
        setError(data.message || 'Failed to process request');
      }
    } catch {
      setError('Failed to process request');
    }
  };

  if (!user || user.role !== 'admin') return null;
  if (loading) return <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">Loading requests...</div>;
  if (requests.length === 0) return null;

  return (
    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="font-semibold text-green-800 mb-2 flex items-center"><Shield className="w-5 h-5 mr-2" />Pending Verification Requests</div>
      {success && <div className="text-green-700 text-sm mb-2">{success}</div>}
      {error && <div className="text-red-700 text-sm mb-2">{error}</div>}
      <div className="space-y-2">
        {requests
          .filter(req => req.name && req.email && req.password && req.user && req.reason)
          .map(req => {
            // Program admin: cannot approve admin requests
            const canApprove = !isProgramAdmin(user) || req.requestedRole === 'faculty';
            return (
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
                    disabled={!canApprove}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />Approve
                  </button>
                  <button
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
                    onClick={() => handleDecision(req._id, 'rejected')}
                    disabled={!canApprove}
                  >
                    <XCircle className="w-4 h-4 mr-1" />Reject
                  </button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

const programOptions = [
  { value: 'B.Tech', label: 'B.Tech' },
  { value: 'M.Tech', label: 'M.Tech' },
  { value: 'B.Pharma', label: 'B.Pharma' },
  { value: 'MCA', label: 'MCA' },
  { value: 'MBA', label: 'MBA' }
];

// Only show ProgramAdminsPanel for super-admins (not program admins)
function ProgramAdminsPanel() {
  const { user, token } = useAuth();
  const [selectedProgram, setSelectedProgram] = useState('');
  const [admins, setAdmins] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedProgram) fetchAdmins(selectedProgram);
    else setAdmins([]);
    // eslint-disable-next-line
  }, [selectedProgram]);

  if (!user || user.role !== 'admin' || isProgramAdmin(user)) return null;

  async function fetchAdmins(program: string) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/auth/admins-by-program?program=${encodeURIComponent(program)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setAdmins(data.admins);
      else setError(data.message || 'Failed to fetch admins');
    } catch {
      setError('Failed to fetch admins');
    }
    setLoading(false);
  }

  return (
    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="font-semibold text-blue-800 mb-2 flex items-center">
        <Shield className="w-5 h-5 mr-2" />Program-specific Admins
      </div>
      <select
        className="border border-gray-300 rounded px-2 py-1 mb-2"
        value={selectedProgram}
        onChange={e => setSelectedProgram(e.target.value)}
      >
        <option value="">Select a program</option>
        {programOptions.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {loading && <div>Loading admins...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {admins.length > 0 && (
        <ul className="mt-2 space-y-1">
          {admins.map(admin => (
            <li key={admin._id || admin.id} className="bg-white rounded px-3 py-2 border flex flex-col">
              <span className="font-medium">{admin.name} ({admin.email})</span>
              <span className="text-xs text-gray-600">Programs: {admin.adminPrograms?.join(', ')}</span>
            </li>
          ))}
        </ul>
      )}
      {selectedProgram && !loading && admins.length === 0 && !error && (
        <div className="text-gray-600 mt-2">No admins found for this program.</div>
      )}
    </div>
  );
}

export function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState<{ totalStudents: number; totalFaculty: number; totalCourses: number; totalRevenue: number } | null>(null);
  const [departmentData, setDepartmentData] = useState<{ department: string; students: number }[]>([]);
  const [revenueData, setRevenueData] = useState<{ month: string; amount: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        const [statsRes, deptRes, revRes] = await Promise.all([
          fetch('/api/auth/admin-stats', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/auth/department-enrollment', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/auth/monthly-revenue', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        const statsData = await statsRes.json();
        const deptData = await deptRes.json();
        const revData = await revRes.json();
        if (statsData.success) setStats(statsData.stats);
        else setError(statsData.message || 'Failed to fetch stats');
        if (deptData.success) setDepartmentData(deptData.departments);
        else setError(deptData.message || 'Failed to fetch department data');
        if (revData.success) setRevenueData(revData.revenue);
        else setError(revData.message || 'Failed to fetch revenue data');
      } catch {
        setError('Failed to fetch dashboard data');
      }
      setLoading(false);
    };
    fetchStats();
  }, [token]);

  const quickStats = stats ? [
    { title: 'Total Students', value: stats.totalStudents, icon: Users, color: 'text-blue-600' },
    { title: 'Faculty Members', value: stats.totalFaculty, icon: GraduationCap, color: 'text-green-600' },
    { title: 'Active Courses', value: stats.totalCourses, icon: BookOpen, color: 'text-purple-600' },
    { title: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-orange-600' },
  ] : [];

  return (
    <div className="space-y-6">
      <AdminVerificationPanel />
      <ProgramAdminsPanel />
      {loading ? (
        <div className="p-6 text-center text-gray-500">Loading stats...</div>
      ) : error ? (
        <div className="p-6 text-center text-red-600">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index}>
                  <CardContent className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Department-wise Enrollment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="department" angle={-45} textAnchor="end" height={60} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="students" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                      <Line type="monotone" dataKey="amount" stroke="#10B981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}