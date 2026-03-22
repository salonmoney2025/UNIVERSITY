'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Headphones,
  Plus,
  Search,
  Filter,
  Eye,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  User,
  Calendar,
  Tag,
  ArrowUpCircle,
  Zap,
  AlertTriangle,
  FileText,
} from 'lucide-react';

interface Ticket {
  id: string;
  subject: string;
  description: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  submittedBy: string;
  assignedTo: string;
  createdDate: string;
  lastUpdated: string;
  responseTime: string;
}

export default function HelpDeskPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const tickets: Ticket[] = [
    {
      id: 'TKT-2025-001',
      subject: 'Cannot access student portal',
      description: 'I am unable to log into my student portal account. Getting error message "Invalid credentials" even though password is correct.',
      category: 'Technical Support',
      priority: 'High',
      status: 'In Progress',
      submittedBy: 'Mohamed Kamara (STU-2024-001)',
      assignedTo: 'IT Support Team',
      createdDate: '2025-03-15 09:30 AM',
      lastUpdated: '2025-03-15 10:45 AM',
      responseTime: '1h 15m',
    },
    {
      id: 'TKT-2025-002',
      subject: 'Grade discrepancy in Mathematics',
      description: 'My final grade for MATH201 shows as C but I believe there may be an error in calculation based on my exam and assignment scores.',
      category: 'Academic',
      priority: 'Medium',
      status: 'Open',
      submittedBy: 'Fatmata Sesay (STU-2024-002)',
      assignedTo: 'Registry Department',
      createdDate: '2025-03-15 11:20 AM',
      lastUpdated: '2025-03-15 11:20 AM',
      responseTime: 'Pending',
    },
    {
      id: 'TKT-2025-003',
      subject: 'Fee payment receipt not generated',
      description: 'I made a tuition payment of NSL 2,500,000 on March 10th but the receipt was not generated in my account.',
      category: 'Finance',
      priority: 'High',
      status: 'Open',
      submittedBy: 'Ibrahim Conteh (STU-2024-003)',
      assignedTo: 'Finance Office',
      createdDate: '2025-03-14 02:15 PM',
      lastUpdated: '2025-03-14 02:15 PM',
      responseTime: 'Pending',
    },
    {
      id: 'TKT-2025-004',
      subject: 'Course registration deadline extension',
      description: 'Request for extension of course registration deadline due to medical emergency. Can provide documentation.',
      category: 'Registry',
      priority: 'Urgent',
      status: 'In Progress',
      submittedBy: 'Aminata Koroma (STU-2024-004)',
      assignedTo: 'Registry Department',
      createdDate: '2025-03-14 08:00 AM',
      lastUpdated: '2025-03-15 09:00 AM',
      responseTime: '3h 30m',
    },
    {
      id: 'TKT-2025-005',
      subject: 'Library book overdue notice error',
      description: 'Received overdue notice for book "Introduction to Programming" but I returned it on time on March 1st.',
      category: 'Library',
      priority: 'Low',
      status: 'Resolved',
      submittedBy: 'Samuel Williams (STU-2024-005)',
      assignedTo: 'Library Staff',
      createdDate: '2025-03-12 10:30 AM',
      lastUpdated: '2025-03-13 03:45 PM',
      responseTime: '2h 15m',
    },
    {
      id: 'TKT-2025-006',
      subject: 'Missing lecture notes for CS301',
      description: 'Lecture notes for Computer Networks (CS301) from March 10-12 are not uploaded on the learning portal.',
      category: 'Academic',
      priority: 'Medium',
      status: 'Resolved',
      submittedBy: 'Isatu Bangura (STU-2024-006)',
      assignedTo: 'Faculty',
      createdDate: '2025-03-13 09:00 AM',
      lastUpdated: '2025-03-14 11:30 AM',
      responseTime: '4h 20m',
    },
    {
      id: 'TKT-2025-007',
      subject: 'Transcript request status',
      description: 'Applied for official transcript 2 weeks ago (Ref: TR-2025-045) but have not received any update.',
      category: 'Registry',
      priority: 'Medium',
      status: 'In Progress',
      submittedBy: 'Abdul Rahman (STU-2023-012)',
      assignedTo: 'Registry Department',
      createdDate: '2025-03-14 03:30 PM',
      lastUpdated: '2025-03-15 10:00 AM',
      responseTime: '5h 45m',
    },
    {
      id: 'TKT-2025-008',
      subject: 'ID card replacement',
      description: 'Lost my student ID card. Need information on replacement process and fees.',
      category: 'Administrative',
      priority: 'Low',
      status: 'Closed',
      submittedBy: 'Mariama Jalloh (STU-2024-007)',
      assignedTo: 'Student Affairs',
      createdDate: '2025-03-11 01:15 PM',
      lastUpdated: '2025-03-12 09:30 AM',
      responseTime: '1h 45m',
    },
  ];

  const categories = ['All', 'Technical Support', 'Academic', 'Finance', 'Registry', 'Library', 'Administrative'];
  const statuses = ['All', 'Open', 'In Progress', 'Resolved', 'Closed'];
  const priorities = ['All', 'Low', 'Medium', 'High', 'Urgent'];

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.submittedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || ticket.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || ticket.priority === priorityFilter;
    return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
  });

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === 'Open').length,
    inProgress: tickets.filter((t) => t.status === 'In Progress').length,
    resolved: tickets.filter((t) => t.status === 'Resolved').length,
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return <Zap className="w-4 h-4" />;
      case 'High':
        return <AlertTriangle className="w-4 h-4" />;
      case 'Medium':
        return <ArrowUpCircle className="w-4 h-4" />;
      default:
        return <Tag className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-red-100 text-red-800  text-red-600';
      case 'High':
        return 'bg-orange-100 text-orange-800  text-orange-600';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800  text-yellow-600';
      default:
        return 'bg-blue-100 text-blue-800  text-blue-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open':
        return <AlertCircle className="w-4 h-4" />;
      case 'In Progress':
        return <Clock className="w-4 h-4" />;
      case 'Resolved':
        return <CheckCircle className="w-4 h-4" />;
      case 'Closed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-blue-100 text-blue-800  text-blue-600';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800  text-yellow-600';
      case 'Resolved':
        return 'bg-green-100 text-green-800  text-green-600';
      case 'Closed':
        return 'bg-solid black-100 text-black bg-white text-black';
      default:
        return 'bg-solid black-100 text-black bg-white text-black';
    }
  };

  const handleViewTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowViewModal(true);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-portal-teal-100 rounded-lg flex items-center justify-center">
              <Headphones className="w-6 h-6 text-portal-teal-600 text-portal-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-black text-black">Help Desk</h1>
              <p className="text-sm text-black text-black">
                Manage support tickets and requests
              </p>
            </div>
          </div>
          <Link
            href="/help-desk/view-application"
            className="px-4 py-2 bg-white bg-white border border-solid black-300 border-solid black-300 text-black text-black rounded-lg hover:bg-solid black-100 hover:bg-solid black-50 transition-colors flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>View Applications</span>
          </Link>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white bg-white p-6 rounded-lg shadow-sm border border-solid black-200 border-solid black-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black text-black">Total Tickets</p>
              <p className="text-2xl font-bold text-black text-black mt-1">{stats.total}</p>
            </div>
            <Headphones className="w-8 h-8 text-portal-teal-600" />
          </div>
        </div>
        <div className="bg-white bg-white p-6 rounded-lg shadow-sm border border-solid black-200 border-solid black-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black text-black">Open Tickets</p>
              <p className="text-2xl font-bold text-blue-600 text-blue-600 mt-1">{stats.open}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white bg-white p-6 rounded-lg shadow-sm border border-solid black-200 border-solid black-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black text-black">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600 text-yellow-600 mt-1">{stats.inProgress}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white bg-white p-6 rounded-lg shadow-sm border border-solid black-200 border-solid black-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black text-black">Resolved</p>
              <p className="text-2xl font-bold text-green-600 text-green-600 mt-1">{stats.resolved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white bg-white rounded-lg shadow-sm border border-solid black-200 border-solid black-300 mb-6">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 flex-1">
              <div className="relative flex-1 md:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black" />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-solid black-300 border-solid black-300 rounded-lg focus:ring-2 focus:ring-portal-teal-500 focus:border-transparent bg-white text-black"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-black" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2 border border-solid black-300 border-solid black-300 rounded-lg focus:ring-2 focus:ring-portal-teal-500 focus:border-transparent bg-white text-black"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-solid black-300 border-solid black-300 rounded-lg focus:ring-2 focus:ring-portal-teal-500 focus:border-transparent bg-white text-black"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status === 'All' ? 'All Status' : status}
                    </option>
                  ))}
                </select>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-4 py-2 border border-solid black-300 border-solid black-300 rounded-lg focus:ring-2 focus:ring-portal-teal-500 focus:border-transparent bg-white text-black"
                >
                  {priorities.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority === 'All' ? 'All Priority' : priority}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2 bg-portal-teal-600 text-white rounded-lg hover:bg-portal-teal-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Ticket</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white bg-white rounded-lg shadow-sm border border-solid black-200 border-solid black-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-solid black-50 bg-white border-b border-solid black-200 border-solid black-300">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-black text-black uppercase tracking-wider">
                  Ticket ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black text-black uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black text-black uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black text-black uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black text-black uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black text-black uppercase tracking-wider">
                  Submitted By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black text-black uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black text-black uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-solid black-200
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-solid black-50 hover:bg-solid black-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-portal-teal-600 text-portal-teal-600">
                      {ticket.id}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-black text-black">
                      {ticket.subject}
                    </div>
                    <div className="text-sm text-black text-black truncate max-w-xs">
                      {ticket.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-black text-black">{ticket.category}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                        ticket.priority
                      )}`}
                    >
                      {getPriorityIcon(ticket.priority)}
                      <span>{ticket.priority}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        ticket.status
                      )}`}
                    >
                      {getStatusIcon(ticket.status)}
                      <span>{ticket.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-black" />
                      <span className="text-sm text-black text-black">{ticket.submittedBy}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black text-black">
                    {ticket.createdDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleViewTicket(ticket)}
                      className="text-portal-teal-600 text-portal-teal-600 hover:text-portal-teal-700
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTickets.length === 0 && (
          <div className="p-12 text-center">
            <Headphones className="w-12 h-12 text-black mx-auto mb-4" />
            <p className="text-black text-black">No tickets found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-solid black-200 border-solid black-300">
              <h3 className="text-xl font-bold text-black text-black">Create Support Ticket</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black text-black mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-solid black-300 border-solid black-300 rounded-lg focus:ring-2 focus:ring-portal-teal-500 focus:border-transparent bg-white text-black"
                    placeholder="Brief description of the issue"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black text-black mb-2">
                      Category *
                    </label>
                    <select className="w-full px-4 py-2 border border-solid black-300 border-solid black-300 rounded-lg focus:ring-2 focus:ring-portal-teal-500 focus:border-transparent bg-white text-black">
                      <option value="">Select Category</option>
                      {categories.filter((c) => c !== 'All').map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black text-black mb-2">
                      Priority *
                    </label>
                    <select className="w-full px-4 py-2 border border-solid black-300 border-solid black-300 rounded-lg focus:ring-2 focus:ring-portal-teal-500 focus:border-transparent bg-white text-black">
                      {priorities.filter((p) => p !== 'All').map((priority) => (
                        <option key={priority} value={priority}>
                          {priority}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black text-black mb-2">
                    Description *
                  </label>
                  <textarea
                    rows={6}
                    className="w-full px-4 py-2 border border-solid black-300 border-solid black-300 rounded-lg focus:ring-2 focus:ring-portal-teal-500 focus:border-transparent bg-white text-black"
                    placeholder="Provide detailed information about your issue or request..."
                  />
                </div>
              </div>
            </div>
            <div className="p-6 bg-solid black-50 bg-white flex justify-end space-x-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-2 border border-solid black-300 border-solid black-300 text-black text-black rounded-lg hover:bg-solid black-100 hover:bg-solid black-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-2 bg-portal-teal-600 text-white rounded-lg hover:bg-portal-teal-700 transition-colors"
              >
                Submit Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Ticket Modal */}
      {showViewModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-solid black-200 border-solid black-300">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-black text-black mb-2">
                    {selectedTicket.subject}
                  </h3>
                  <p className="text-sm text-portal-teal-600 text-portal-teal-600">{selectedTicket.id}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center space-x-1 px-3 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                      selectedTicket.priority
                    )}`}
                  >
                    {getPriorityIcon(selectedTicket.priority)}
                    <span>{selectedTicket.priority}</span>
                  </span>
                  <span
                    className={`inline-flex items-center space-x-1 px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      selectedTicket.status
                    )}`}
                  >
                    {getStatusIcon(selectedTicket.status)}
                    <span>{selectedTicket.status}</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-black text-black mb-2">Description</h4>
                  <p className="text-black text-black bg-solid black-50 bg-white p-4 rounded-lg">
                    {selectedTicket.description}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-black text-black mb-3">Ticket Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm">
                        <Tag className="w-4 h-4 text-black" />
                        <span className="text-black text-black">Category:</span>
                        <span className="text-black text-black font-medium">{selectedTicket.category}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <User className="w-4 h-4 text-black" />
                        <span className="text-black text-black">Assigned To:</span>
                        <span className="text-black text-black font-medium">{selectedTicket.assignedTo}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="w-4 h-4 text-black" />
                        <span className="text-black text-black">Response Time:</span>
                        <span className="text-black text-black font-medium">{selectedTicket.responseTime}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-black text-black mb-3">Timeline</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="w-4 h-4 text-black" />
                        <span className="text-black text-black">Created:</span>
                        <span className="text-black text-black font-medium">{selectedTicket.createdDate}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="w-4 h-4 text-black" />
                        <span className="text-black text-black">Last Updated:</span>
                        <span className="text-black text-black font-medium">{selectedTicket.lastUpdated}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <User className="w-4 h-4 text-black" />
                        <span className="text-black text-black">Submitted By:</span>
                        <span className="text-black text-black font-medium">{selectedTicket.submittedBy}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-black text-black mb-3">Add Response</h4>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-2 border border-solid black-300 border-solid black-300 rounded-lg focus:ring-2 focus:ring-portal-teal-500 focus:border-transparent bg-white text-black"
                    placeholder="Add a response or update to this ticket..."
                  />
                </div>
              </div>
            </div>
            <div className="p-6 bg-solid black-50 bg-white flex justify-end space-x-4">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-6 py-2 border border-solid black-300 border-solid black-300 text-black text-black rounded-lg hover:bg-solid black-100 hover:bg-solid black-50 transition-colors"
              >
                Close
              </button>
              <button className="px-6 py-2 bg-portal-teal-600 text-white rounded-lg hover:bg-portal-teal-700 transition-colors flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>Send Response</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
