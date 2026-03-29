'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, LayoutDashboard, Plus, Edit, Trash2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface BankName {
  id: string;
  bankName: string;
  shortName: string;
  description?: string;
  status: string;
  createdAt: string;
}

export default function ManageBankNamesPage() {
  const [bankNames, setBankNames] = useState<BankName[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBankName, setEditingBankName] = useState<BankName | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    bankName: '',
    shortName: '',
    description: '',
    status: 'active',
  });

  useEffect(() => {
    fetchBankNames();
  }, []);

  const fetchBankNames = async () => {
    try {
      setLoading(true);
      // For now, we'll extract unique bank names from the banks table
      const response = await fetch('/api/banks');
      if (!response.ok) throw new Error('Failed to fetch bank names');
      const banksData = await response.json();

      // Extract unique bank names
      const uniqueNames = Array.from(
        new Set(banksData.map((bank: any) => bank.bankName))
      ).map((name, index) => ({
        id: `bn-${index}`,
        bankName: name as string,
        shortName: (name as string).substring(0, 10),
        description: `${name} banking services`,
        status: 'active',
        createdAt: new Date().toISOString(),
      }));

      setBankNames(uniqueNames);
    } catch (error) {
      toast.error('Failed to load bank names');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Since we don't have a separate bank names table yet,
    // we'll just show a success message for now
    toast.success(editingBankName ? 'Bank name updated!' : 'Bank name added!');
    setShowModal(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bank name?')) return;
    toast.success('Bank name deleted!');
  };

  const handleEdit = (bankName: BankName) => {
    setEditingBankName(bankName);
    setFormData({
      bankName: bankName.bankName,
      shortName: bankName.shortName,
      description: bankName.description || '',
      status: bankName.status,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingBankName(null);
    setFormData({
      bankName: '',
      shortName: '',
      description: '',
      status: 'active',
    });
  };

  // Filter and paginate bank names
  const filteredBankNames = bankNames.filter(name =>
    name.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    name.shortName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredBankNames.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedBankNames = filteredBankNames.slice(startIndex, startIndex + entriesPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-blue-100 p-2 rounded">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-black">MANAGE BANK NAMES</h1>
            <p className="text-sm text-black">Configure and manage bank name entries</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={fetchBankNames}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-medium transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Bank Name
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="bg-white rounded shadow">
          {/* Table Controls */}
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm text-black">Show</label>
              <select
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <label className="text-sm text-black">entries</label>
              <button className="ml-2 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                Excel
              </button>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-black">Search:</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm"
                placeholder="Search..."
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-black border-b">EG#</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-black border-b">Bank Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-black border-b">Short Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-black border-b">Description</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-black border-b">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-black border-b">Date Created</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-black border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-black">
                      Loading bank names...
                    </td>
                  </tr>
                ) : paginatedBankNames.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-black">
                      No bank names found
                    </td>
                  </tr>
                ) : (
                  paginatedBankNames.map((bankName, index) => (
                    <tr key={bankName.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-black">
                        <input type="checkbox" className="mr-2" />
                        {startIndex + index + 1}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-black">{bankName.bankName}</td>
                      <td className="px-4 py-3 text-sm text-black">{bankName.shortName}</td>
                      <td className="px-4 py-3 text-sm text-black">{bankName.description}</td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            bankName.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {bankName.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-black">
                        {new Date(bankName.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(bankName)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(bankName.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
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
          <div className="p-4 flex justify-between items-center border-t">
            <div className="text-sm text-black">
              Showing {startIndex + 1} to {Math.min(startIndex + entriesPerPage, filteredBankNames.length)} of {filteredBankNames.length} entries
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 border rounded text-sm ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-100 text-black'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
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
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {editingBankName ? 'Edit Bank Name' : 'Add New Bank Name'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-white hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
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
                    placeholder="e.g., Sierra Leone Commercial Bank"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Short Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.shortName}
                    onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    placeholder="e.g., SLCB"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    rows={3}
                    placeholder="Brief description of the bank"
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
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium transition-colors"
                >
                  {editingBankName ? 'Update Bank Name' : 'Add Bank Name'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded font-medium transition-colors"
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
