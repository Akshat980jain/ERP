import React, { useState } from 'react';
import { CreditCard, Download, Calendar, CheckCircle, Clock, AlertTriangle, DollarSign } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface FeeRecord {
  id: string;
  type: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'paid' | 'pending' | 'overdue';
  semester: string;
}

interface PaymentHistory {
  id: string;
  description: string;
  amount: number;
  date: string;
  method: string;
  transactionId: string;
}

export function FinanceModule() {
  const [activeTab, setActiveTab] = useState('overview');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [selectedFee, setSelectedFee] = useState<string>('');

  const feeRecords: FeeRecord[] = [
    {
      id: '1',
      type: 'Tuition Fee',
      amount: 45000,
      dueDate: '2024-01-30',
      status: 'pending',
      semester: 'Spring 2024'
    },
    {
      id: '2',
      type: 'Library Fee',
      amount: 2000,
      dueDate: '2024-01-15',
      paidDate: '2024-01-10',
      status: 'paid',
      semester: 'Spring 2024'
    },
    {
      id: '3',
      type: 'Lab Fee',
      amount: 5000,
      dueDate: '2024-02-15',
      status: 'pending',
      semester: 'Spring 2024'
    },
    {
      id: '4',
      type: 'Examination Fee',
      amount: 3000,
      dueDate: '2024-01-20',
      status: 'overdue',
      semester: 'Spring 2024'
    }
  ];

  const paymentHistory: PaymentHistory[] = [
    {
      id: '1',
      description: 'Library Fee - Spring 2024',
      amount: 2000,
      date: '2024-01-10',
      method: 'Credit Card',
      transactionId: 'TXN123456789'
    },
    {
      id: '2',
      description: 'Tuition Fee - Fall 2023',
      amount: 45000,
      date: '2023-08-15',
      method: 'Bank Transfer',
      transactionId: 'TXN987654321'
    },
    {
      id: '3',
      description: 'Lab Fee - Fall 2023',
      amount: 5000,
      date: '2023-09-10',
      method: 'UPI',
      transactionId: 'TXN456789123'
    }
  ];

  const scholarships = [
    {
      id: '1',
      name: 'Merit Scholarship',
      amount: 10000,
      status: 'approved',
      appliedDate: '2023-12-01',
      description: 'Based on academic performance'
    },
    {
      id: '2',
      name: 'Need-based Scholarship',
      amount: 15000,
      status: 'pending',
      appliedDate: '2024-01-15',
      description: 'Financial assistance program'
    }
  ];

  const totalPending = feeRecords
    .filter(fee => fee.status === 'pending' || fee.status === 'overdue')
    .reduce((sum, fee) => sum + fee.amount, 0);

  const totalPaid = paymentHistory.reduce((sum, payment) => sum + payment.amount, 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'overdue':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex px-2 py-1 text-xs font-semibold rounded-full";
    switch (status) {
      case 'paid':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'overdue':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const handlePayment = () => {
    if (selectedFee && paymentAmount) {
      alert(`Payment of ₹${paymentAmount} initiated for ${selectedFee}`);
      setPaymentAmount('');
      setSelectedFee('');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'fees', label: 'Fee Details' },
    { id: 'payment', label: 'Make Payment' },
    { id: 'history', label: 'Payment History' },
    { id: 'scholarships', label: 'Scholarships' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <CreditCard className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Finance Management</h1>
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

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Pending</p>
                  <p className="text-2xl font-bold text-red-600">₹{totalPending.toLocaleString()}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Paid</p>
                  <p className="text-2xl font-bold text-green-600">₹{totalPaid.toLocaleString()}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Scholarships</p>
                  <p className="text-2xl font-bold text-blue-600">₹25,000</p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-600" />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentHistory.slice(0, 3).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{payment.description}</p>
                      <p className="text-sm text-gray-600">{payment.date} • {payment.method}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">₹{payment.amount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{payment.transactionId}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'fees' && (
        <Card>
          <CardHeader>
            <CardTitle>Fee Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {feeRecords.map((fee) => (
                    <tr key={fee.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(fee.status)}
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{fee.type}</p>
                            <p className="text-sm text-gray-500">{fee.semester}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{fee.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{fee.dueDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(fee.status)}>
                          {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {fee.status === 'paid' ? (
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Receipt
                          </Button>
                        ) : (
                          <Button size="sm">Pay Now</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'payment' && (
        <Card>
          <CardHeader>
            <CardTitle>Make Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Fee Type
                </label>
                <select
                  value={selectedFee}
                  onChange={(e) => setSelectedFee(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select a fee to pay</option>
                  {feeRecords
                    .filter(fee => fee.status !== 'paid')
                    .map(fee => (
                      <option key={fee.id} value={fee.type}>
                        {fee.type} - ₹{fee.amount.toLocaleString()}
                      </option>
                    ))}
                </select>
              </div>

              <Input
                label="Payment Amount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter amount"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors">
                  <CreditCard className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="font-medium">Credit/Debit Card</p>
                </button>
                <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors">
                  <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="font-medium">UPI Payment</p>
                </button>
                <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors">
                  <CreditCard className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="font-medium">Net Banking</p>
                </button>
              </div>

              <Button 
                onClick={handlePayment} 
                disabled={!selectedFee || !paymentAmount}
                className="w-full"
              >
                Proceed to Payment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentHistory.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <div>
                      <p className="font-medium text-gray-900">{payment.description}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{payment.date}</span>
                        <span>•</span>
                        <span>{payment.method}</span>
                      </div>
                      <p className="text-xs text-gray-500">Transaction ID: {payment.transactionId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">₹{payment.amount.toLocaleString()}</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Download className="w-4 h-4 mr-2" />
                      Receipt
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'scholarships' && (
        <Card>
          <CardHeader>
            <CardTitle>Scholarships</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scholarships.map((scholarship) => (
                <div key={scholarship.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{scholarship.name}</h3>
                    <span className={getStatusBadge(scholarship.status)}>
                      {scholarship.status.charAt(0).toUpperCase() + scholarship.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{scholarship.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Applied: {scholarship.appliedDate}
                    </div>
                    <div className="font-bold text-blue-600">
                      ₹{scholarship.amount.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
              
              <Button variant="outline" className="w-full">
                Apply for New Scholarship
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}