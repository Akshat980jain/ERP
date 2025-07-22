import React, { useState } from 'react';
import { Briefcase, Building, Calendar, Users, TrendingUp, FileText, Upload, CheckCircle, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface Job {
  id: string;
  company: string;
  position: string;
  package: string;
  location: string;
  requirements: string[];
  deadline: string;
  status: 'active' | 'closed';
  appliedStudents: number;
  description: string;
  type: 'full-time' | 'internship';
}

interface Application {
  id: string;
  jobId: string;
  company: string;
  position: string;
  appliedDate: string;
  status: 'applied' | 'shortlisted' | 'interviewed' | 'selected' | 'rejected';
  feedback?: string;
}

export function PlacementModule() {
  const [activeTab, setActiveTab] = useState('jobs');
  const [filter, setFilter] = useState<'all' | 'full-time' | 'internship'>('all');

  const jobs: Job[] = [
    {
      id: '1',
      company: 'Microsoft',
      position: 'Software Engineer',
      package: '₹18-22 LPA',
      location: 'Bangalore',
      requirements: ['B.Tech/B.E in CS/IT', 'Strong programming skills', 'CGPA > 7.5'],
      deadline: '2024-02-15',
      status: 'active',
      appliedStudents: 45,
      description: 'Join Microsoft as a Software Engineer and work on cutting-edge technologies.',
      type: 'full-time'
    },
    {
      id: '2',
      company: 'Google',
      position: 'Software Development Intern',
      package: '₹80,000/month',
      location: 'Hyderabad',
      requirements: ['B.Tech/B.E in CS/IT', 'Strong problem-solving skills', 'CGPA > 8.0'],
      deadline: '2024-02-10',
      status: 'active',
      appliedStudents: 67,
      description: 'Summer internship program at Google with mentorship and real project experience.',
      type: 'internship'
    },
    {
      id: '3',
      company: 'Amazon',
      position: 'SDE-1',
      package: '₹15-20 LPA',
      location: 'Chennai',
      requirements: ['B.Tech/B.E in CS/IT', 'Data structures and algorithms', 'CGPA > 7.0'],
      deadline: '2024-01-30',
      status: 'closed',
      appliedStudents: 89,
      description: 'Software Development Engineer role at Amazon Web Services.',
      type: 'full-time'
    },
    {
      id: '4',
      company: 'Flipkart',
      position: 'Product Manager Intern',
      package: '₹60,000/month',
      location: 'Bangalore',
      requirements: ['Any Engineering degree', 'Analytical skills', 'CGPA > 7.5'],
      deadline: '2024-02-20',
      status: 'active',
      appliedStudents: 23,
      description: 'Product management internship with exposure to e-commerce operations.',
      type: 'internship'
    }
  ];

  const applications: Application[] = [
    {
      id: '1',
      jobId: '1',
      company: 'Microsoft',
      position: 'Software Engineer',
      appliedDate: '2024-01-20',
      status: 'shortlisted',
      feedback: 'Selected for technical interview round'
    },
    {
      id: '2',
      jobId: '2',
      company: 'Google',
      position: 'Software Development Intern',
      appliedDate: '2024-01-18',
      status: 'applied'
    },
    {
      id: '3',
      jobId: '3',
      company: 'Amazon',
      position: 'SDE-1',
      appliedDate: '2024-01-15',
      status: 'rejected',
      feedback: 'Did not meet the technical requirements'
    }
  ];

  const placementStats = {
    totalCompanies: 45,
    totalOffers: 234,
    averagePackage: '₹12.5 LPA',
    highestPackage: '₹45 LPA',
    placementRate: '85%'
  };

  const filteredJobs = jobs.filter(job => {
    if (filter === 'all') return true;
    return job.type === filter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'selected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'shortlisted':
        return <TrendingUp className="w-5 h-5 text-blue-500" />;
      case 'interviewed':
        return <Users className="w-5 h-5 text-purple-500" />;
      case 'rejected':
        return <FileText className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex px-2 py-1 text-xs font-semibold rounded-full";
    switch (status) {
      case 'selected':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'shortlisted':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'interviewed':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'closed':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
    }
  };

  const handleApply = (jobId: string) => {
    alert(`Application submitted for job ID: ${jobId}`);
  };

  const tabs = [
    { id: 'jobs', label: 'Job Opportunities' },
    { id: 'applications', label: 'My Applications' },
    { id: 'profile', label: 'Profile & Resume' },
    { id: 'stats', label: 'Placement Statistics' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Briefcase className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Placement Portal</h1>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'jobs' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Filter by type:</span>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Jobs</option>
                <option value="full-time">Full-time</option>
                <option value="internship">Internships</option>
              </select>
            </div>
            <p className="text-sm text-gray-600">{filteredJobs.length} opportunities available</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredJobs.map((job) => (
              <Card key={job.id}>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Building className="w-8 h-8 text-blue-600" />
                        <div>
                          <h3 className="font-semibold text-gray-900">{job.position}</h3>
                          <p className="text-sm text-gray-600">{job.company}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={getStatusBadge(job.status)}>
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </span>
                        <p className="text-xs text-gray-500 mt-1 capitalize">{job.type}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Package:</span>
                        <span className="font-medium text-green-600">{job.package}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium">{job.location}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Deadline:</span>
                        <span className="font-medium text-red-600">{job.deadline}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Applied:</span>
                        <span className="font-medium">{job.appliedStudents} students</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Requirements:</h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {job.requirements.map((req, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <div className="w-1 h-1 bg-gray-400 rounded-full" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <p className="text-sm text-gray-600">{job.description}</p>

                    <Button 
                      onClick={() => handleApply(job.id)}
                      disabled={job.status === 'closed'}
                      className="w-full"
                    >
                      {job.status === 'closed' ? 'Application Closed' : 'Apply Now'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'applications' && (
        <Card>
          <CardHeader>
            <CardTitle>My Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {applications.map((application) => (
                <div key={application.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(application.status)}
                    <div>
                      <h4 className="font-medium text-gray-900">{application.position}</h4>
                      <p className="text-sm text-gray-600">{application.company}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>Applied: {application.appliedDate}</span>
                      </div>
                      {application.feedback && (
                        <p className="text-xs text-blue-600 mt-1">{application.feedback}</p>
                      )}
                    </div>
                  </div>
                  <span className={getStatusBadge(application.status)}>
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'profile' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resume Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Your Resume</h3>
                  <p className="text-gray-600 mb-4">Upload your latest resume in PDF format (max 5MB)</p>
                  <Button>
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Uploaded Resumes</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">Resume_2024.pdf</p>
                          <p className="text-sm text-gray-600">Uploaded on: 2024-01-15</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                        <Button variant="outline" size="sm">View</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Skills" placeholder="e.g., Java, Python, React" />
                <Input label="CGPA" placeholder="e.g., 8.5" />
                <Input label="LinkedIn Profile" placeholder="https://linkedin.com/in/yourprofile" />
                <Input label="GitHub Profile" placeholder="https://github.com/yourusername" />
                <Input label="Portfolio Website" placeholder="https://yourportfolio.com" />
                <Input label="Phone Number" placeholder="+91 9876543210" />
              </div>
              <Button className="mt-4">Update Profile</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <Card>
              <CardContent className="text-center">
                <Building className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{placementStats.totalCompanies}</p>
                <p className="text-sm text-gray-600">Companies Visited</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{placementStats.totalOffers}</p>
                <p className="text-sm text-gray-600">Total Offers</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="text-center">
                <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{placementStats.averagePackage}</p>
                <p className="text-sm text-gray-600">Average Package</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="text-center">
                <Briefcase className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{placementStats.highestPackage}</p>
                <p className="text-sm text-gray-600">Highest Package</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="text-center">
                <Users className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{placementStats.placementRate}</p>
                <p className="text-sm text-gray-600">Placement Rate</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Placements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Rahul Sharma', company: 'Microsoft', package: '₹22 LPA', position: 'Software Engineer' },
                  { name: 'Priya Patel', company: 'Google', package: '₹28 LPA', position: 'SDE-2' },
                  { name: 'Amit Kumar', company: 'Amazon', package: '₹18 LPA', position: 'SDE-1' },
                  { name: 'Sneha Reddy', company: 'Flipkart', package: '₹15 LPA', position: 'Product Manager' },
                ].map((placement, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{placement.name}</p>
                      <p className="text-sm text-gray-600">{placement.position} at {placement.company}</p>
                    </div>
                    <p className="font-bold text-green-600">{placement.package}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}