'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, LayoutDashboard, Plus, Edit, Trash2, X, Building2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import PageHeader from '@/components/common/PageHeader';
import '@/styles/components/buttons.css';
import '@/styles/components/tables.css';
import '@/styles/components/page-header.css';

interface Bank {
  id: string;
  bankName: string;
  bankCode: string;
  swiftCode?: string;
  sortCode?: string;
  branch: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  accountNumber: string;
  accountName: string;
  status: string;
  createdAt: string;
}

export default function ManageBanksPage() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBank, setEditingBank] = useState<Bank | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    bankName: '',
    bankCode: '',
    swiftCode: '',
    sortCode: '',
    branch: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    accountNumber: '',
    accountName: '',
    status: 'active',
  });

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/banks');
      if (!response.ok) throw new Error('Failed to fetch banks');
      const data = await response.json();
      setBanks(data);
      toast.success('Banks loaded successfully!');
    } catch (error) {
      toast.error('Failed to load banks');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingBank ? `/api/banks/${editingBank.id}` : '/api/banks';
      const method = editingBank ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Operation failed');
      }

      toast.success(editingBank ? 'Bank updated successfully!' : 'Bank added successfully!');
      setShowModal(false);
      resetForm();
      fetchBanks();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bank?')) return;

    try {
      const response = await fetch(`/api/banks/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete bank');

      toast.success('Bank deleted successfully!');
      fetchBanks();
    } catch (error) {
      toast.error('Failed to delete bank');
    }
  };

  const handleEdit = (bank: Bank) => {
    setEditingBank(bank);
    setFormData({
      bankName: bank.bankName,
      bankCode: bank.bankCode,
      swiftCode: bank.swiftCode || '',
      sortCode: bank.sortCode || '',
      branch: bank.branch,
      address: bank.address,
      city: bank.city,
      phone: bank.phone,
      email: bank.email,
      accountNumber: bank.accountNumber,
      accountName: bank.accountName,
      status: bank.status,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingBank(null);
    setFormData({
      bankName: '',
      bankCode: '',
      swiftCode: '',
      sortCode: '',
      branch: '',
      address: '',
      city: '',
      phone: '',
      email: '',
      accountNumber: '',
      accountName: '',
      status: 'active',
    });
  };

  const handleAddBank = () => {
    resetForm();
    setShowModal(true);
  };

  // Filter and paginate banks
  const filteredBanks = banks.filter(bank =>
    bank.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bank.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bank.accountNumber.includes(searchTerm) ||
    bank.phone.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredBanks.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedBanks = filteredBanks.slice(startIndex, startIndex + entriesPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header with Navigation */}
      <PageHeader
        title="MANAGE BANKS"
        subtitle="Please manage banks here"
        icon={<Building2 />}
        showBackButton={true}
        showHomeButton={true}
        actions={
          <div className="action-buttons">
            <button onClick={fetchBanks} className="btn btn-primary" type="button">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button onClick={handleAddBank} className="btn btn-warning" type="button">
              <Plus className="w-4 h-4" />
              Add Bank
            </button>
          </div>
        }
      />

      {/* Main Content */}
      <div className="p-6">
        <div className="table-container">
          {/* Table Controls */}
          <div className="table-controls">
            <div className="table-controls-left">
              <label>Show</label>
              <select
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <label>entries</label>
              <button className="btn btn-success btn-sm">Excel</button>
            </div>

            <div className="table-controls-right">
              <label>Search:</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
              />
            </div>
          </div>

          {/* Table */}
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>EG#</th>
                  <th>ID #</th>
                  <th>Bank</th>
                  <th>AccountName</th>
                  <th>Account#</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Campus</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8">
                      Loading banks...
                    </td>
                  </tr>
                ) : paginatedBanks.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8">
                      No banks found
                    </td>
                  </tr>
                ) : (
                  paginatedBanks.map((bank, index) => (
                    <tr key={bank.id}>
                      <td>
                        <input type="checkbox" className="mr-2" />
                        {startIndex + index + 1}
                      </td>
                      <td>{bank.bankCode}</td>
                      <td>
                        {bank.bankName}<br />
                        <span className="text-xs">({bank.branch})</span>
                      </td>
                      <td>{bank.accountName}</td>
                      <td>{bank.accountNumber}</td>
                      <td>{bank.phone}</td>
                      <td>
                        <span className={`status-badge ${bank.status.toLowerCase()}`}>
                          {bank.status}
                        </span>
                      </td>
                      <td>{bank.city}</td>
                      <td>
                        <div className="table-actions">
                          <button
                            onClick={() => handleEdit(bank)}
                            className="table-action-btn edit"
                            title="Edit"
                            type="button"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(bank.id)}
                            className="table-action-btn delete"
                            title="Delete"
                            type="button"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="table-pagination">
            <div className="table-pagination-info">
              Showing {startIndex + 1} to {Math.min(startIndex + entriesPerPage, filteredBanks.length)} of {filteredBanks.length} entries
            </div>
            <div className="table-pagination-buttons">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="pagination-btn"
                type="button"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                  type="button"
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="pagination-btn"
                type="button"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {editingBank ? 'Edit Bank' : 'Add New Bank'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-white hover:text-gray-200"
                type="button"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Bank Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Bank Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.bankCode}
                    onChange={(e) => setFormData({ ...formData, bankCode: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    disabled={!!editingBank}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Swift Code</label>
                  <input
                    type="text"
                    value={formData.swiftCode}
                    onChange={(e) => setFormData({ ...formData, swiftCode: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Sort Code</label>
                  <input
                    type="text"
                    value={formData.sortCode}
                    onChange={(e) => setFormData({ ...formData, sortCode: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Branch <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-black mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Account Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Account Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.accountName}
                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                >
                  {editingBank ? 'Update Bank' : 'Add Bank'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="btn btn-gray flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
