import React, { useState } from 'react';
import { FileText, Download, Clock, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export function StudentServices() {
  const [activeTab, setActiveTab] = useState('apply');

  const serviceTypes = [
    { id: 'bonafide', name: 'Bonafide Certificate', description: 'Certificate of student enrollment', fee: '₹50' },
    { id: 'no_dues', name: 'No Dues Certificate', description: 'Clearance certificate from all departments', fee: '₹100' },
    { id: 'backlog_form', name: 'Backlog Form', description: 'Application for supplementary examinations', fee: '₹200' },
    { id: 'transcript', name: 'Official Transcript', description: 'Academic record transcript', fee: '₹300' },
    { id: 'recommendation', name: 'Recommendation Letter', description: 'Faculty recommendation letter', fee: '₹150' },
  ];

  const applications = [
    { id: '1', type: 'Bonafide Certificate', status: 'approved', date: '2024-01-15', approvedDate: '2024-01-18' },
    { id: '2', type: 'No Dues Certificate', status: 'pending', date: '2024-01-20', approvedDate: null },
    { id: '3', type: 'Transcript', status: 'rejected', date: '2024-01-12', approvedDate: null },
  ];

  const downloads = [
    { name: 'Fee Receipt - January 2024', type: 'PDF', date: '2024-01-15', size: '245 KB' },
    { name: 'Admit Card - Mid-term Exam', type: 'PDF', date: '2024-01-10', size: '156 KB' },
    { name: 'Bonafide Certificate', type: 'PDF', date: '2024-01-18', size: '189 KB' },
    { name: 'Academic Calendar 2024', type: 'PDF', date: '2024-01-01', size: '1.2 MB' },
  ];

  const [selectedService, setSelectedService] = useState('');
  const [reason, setReason] = useState('');

  const handleApply = () => {
    if (selectedService && reason.trim()) {
      alert(`Application submitted for ${serviceTypes.find(s => s.id === selectedService)?.name}`);
      setSelectedService('');
      setReason('');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex px-2 py-1 text-xs font-semibold rounded-full";
    switch (status) {
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const tabs = [
    { id: 'apply', label: 'Apply for Services' },
    { id: 'status', label: 'Application Status' },
    { id: 'downloads', label: 'Downloads' },
  ];

  return (
    <div className="space-y-6">
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

      {activeTab === 'apply' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {serviceTypes.map((service) => (
                  <div
                    key={service.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedService === service.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedService(service.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <FileText className="w-6 h-6 text-blue-600 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{service.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                        <p className="text-sm font-medium text-blue-600 mt-2">Fee: {service.fee}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedService && (
            <Card>
              <CardHeader>
                <CardTitle>Application Form</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Selected Service
                    </label>
                    <p className="text-lg font-medium text-gray-900">
                      {serviceTypes.find(s => s.id === selectedService)?.name}
                    </p>
                  </div>

                  <Input
                    label="Reason for Application"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Please provide a reason for your application"
                    required
                  />

                  <div className="flex items-center justify-between pt-4">
                    <p className="text-sm text-gray-600">
                      Processing time: 3-5 business days
                    </p>
                    <Button onClick={handleApply} disabled={!reason.trim()}>
                      Submit Application
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'status' && (
        <Card>
          <CardHeader>
            <CardTitle>Application Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {applications.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(app.status)}
                    <div>
                      <h4 className="font-medium text-gray-900">{app.type}</h4>
                      <p className="text-sm text-gray-600">Applied on: {app.date}</p>
                      {app.approvedDate && (
                        <p className="text-sm text-gray-600">Approved on: {app.approvedDate}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={getStatusBadge(app.status)}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                    {app.status === 'approved' && (
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'downloads' && (
        <Card>
          <CardHeader>
            <CardTitle>Available Downloads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {downloads.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">{file.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{file.type}</span>
                        <span>•</span>
                        <span>{file.size}</span>
                        <span>•</span>
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {file.date}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}