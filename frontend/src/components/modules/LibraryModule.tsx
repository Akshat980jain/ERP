import React, { useState } from 'react';
import { BookOpen, Search, Calendar, Clock, AlertTriangle, CheckCircle, Plus, Filter } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  category: string;
  availableCopies: number;
  totalCopies: number;
  publisher: string;
  year: number;
}

interface BookIssue {
  id: string;
  bookId: string;
  bookTitle: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  fine?: number;
  status: 'issued' | 'returned' | 'overdue';
}

export function LibraryModule() {
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('title');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const books: Book[] = [
    {
      id: '1',
      isbn: '978-0262033848',
      title: 'Introduction to Algorithms',
      author: 'Thomas H. Cormen',
      category: 'Computer Science',
      availableCopies: 3,
      totalCopies: 5,
      publisher: 'MIT Press',
      year: 2009
    },
    {
      id: '2',
      isbn: '978-0134685991',
      title: 'Effective Java',
      author: 'Joshua Bloch',
      category: 'Programming',
      availableCopies: 2,
      totalCopies: 4,
      publisher: 'Addison-Wesley',
      year: 2017
    },
    {
      id: '3',
      isbn: '978-0321573513',
      title: 'Algorithms',
      author: 'Robert Sedgewick',
      category: 'Computer Science',
      availableCopies: 0,
      totalCopies: 3,
      publisher: 'Addison-Wesley',
      year: 2011
    },
    {
      id: '4',
      isbn: '978-0596517748',
      title: 'JavaScript: The Good Parts',
      author: 'Douglas Crockford',
      category: 'Web Development',
      availableCopies: 4,
      totalCopies: 6,
      publisher: "O'Reilly Media",
      year: 2008
    },
    {
      id: '5',
      isbn: '978-0134494166',
      title: 'Clean Code',
      author: 'Robert C. Martin',
      category: 'Software Engineering',
      availableCopies: 1,
      totalCopies: 3,
      publisher: 'Prentice Hall',
      year: 2008
    }
  ];

  const issuedBooks: BookIssue[] = [
    {
      id: '1',
      bookId: '1',
      bookTitle: 'Introduction to Algorithms',
      issueDate: '2024-01-10',
      dueDate: '2024-01-24',
      status: 'overdue',
      fine: 50
    },
    {
      id: '2',
      bookId: '2',
      bookTitle: 'Effective Java',
      issueDate: '2024-01-15',
      dueDate: '2024-01-29',
      status: 'issued'
    },
    {
      id: '3',
      bookId: '4',
      bookTitle: 'JavaScript: The Good Parts',
      issueDate: '2023-12-20',
      dueDate: '2024-01-03',
      returnDate: '2024-01-02',
      status: 'returned'
    }
  ];

  const categories = ['all', 'Computer Science', 'Programming', 'Web Development', 'Software Engineering', 'Mathematics', 'Physics'];

  const filteredBooks = books.filter(book => {
    const matchesSearch = searchQuery === '' || 
      (searchType === 'title' && book.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (searchType === 'author' && book.author.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (searchType === 'isbn' && book.isbn.includes(searchQuery));
    
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'returned':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'issued':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'overdue':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex px-2 py-1 text-xs font-semibold rounded-full";
    switch (status) {
      case 'returned':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'issued':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'overdue':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const handleIssueBook = (bookId: string) => {
    alert(`Book issue request submitted for book ID: ${bookId}`);
  };

  const handleReturnBook = (issueId: string) => {
    alert(`Book return processed for issue ID: ${issueId}`);
  };

  const tabs = [
    { id: 'search', label: 'Search Books' },
    { id: 'issued', label: 'My Books' },
    { id: 'history', label: 'History' },
    { id: 'requests', label: 'Requests' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <BookOpen className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Library Management</h1>
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

      {activeTab === 'search' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Search Books</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search books..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      icon={<Search className="w-4 h-4 text-gray-400" />}
                    />
                  </div>
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="title">Title</option>
                    <option value="author">Author</option>
                    <option value="isbn">ISBN</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Category:</span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book) => (
              <Card key={book.id}>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <BookOpen className="w-8 h-8 text-blue-600" />
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        book.availableCopies > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {book.availableCopies > 0 ? 'Available' : 'Not Available'}
                      </span>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{book.title}</h3>
                      <p className="text-sm text-gray-600">by {book.author}</p>
                    </div>

                    <div className="space-y-1 text-xs text-gray-500">
                      <p>ISBN: {book.isbn}</p>
                      <p>Category: {book.category}</p>
                      <p>Publisher: {book.publisher} ({book.year})</p>
                      <p>Available: {book.availableCopies}/{book.totalCopies}</p>
                    </div>

                    <Button 
                      onClick={() => handleIssueBook(book.id)}
                      disabled={book.availableCopies === 0}
                      className="w-full"
                      size="sm"
                    >
                      {book.availableCopies > 0 ? 'Issue Book' : 'Not Available'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'issued' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Currently Issued Books</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {issuedBooks.filter(book => book.status === 'issued' || book.status === 'overdue').map((issue) => (
                  <div key={issue.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(issue.status)}
                      <div>
                        <h4 className="font-medium text-gray-900">{issue.bookTitle}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>Issued: {issue.issueDate}</span>
                          <span>•</span>
                          <span>Due: {issue.dueDate}</span>
                        </div>
                        {issue.fine && (
                          <p className="text-sm text-red-600">Fine: ₹{issue.fine}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={getStatusBadge(issue.status)}>
                        {issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                      </span>
                      <Button 
                        onClick={() => handleReturnBook(issue.id)}
                        variant="outline" 
                        size="sm"
                      >
                        Return Book
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <CardTitle>Book Issue History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fine</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {issuedBooks.map((issue) => (
                    <tr key={issue.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {issue.bookTitle}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{issue.issueDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{issue.dueDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {issue.returnDate || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(issue.status)}>
                          {issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {issue.fine ? `₹${issue.fine}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'requests' && (
        <Card>
          <CardHeader>
            <CardTitle>Book Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Request a New Book</h3>
                <p className="text-gray-600 mb-4">Can't find the book you're looking for? Request it here.</p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Request Book
                </Button>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Recent Requests</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Design Patterns: Elements of Reusable Object-Oriented Software</p>
                      <p className="text-sm text-gray-600">Requested on: 2024-01-20</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">System Design Interview</p>
                      <p className="text-sm text-gray-600">Requested on: 2024-01-15</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Approved
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}