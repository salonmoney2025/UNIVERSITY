'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';
import {
  Upload, Download, FileSpreadsheet, FileText,
  Users, CheckCircle2, XCircle, AlertCircle,
  FileDown, Info
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ImportResult {
  success: Array<{row: number; email: string; name: string}>;
  errors: Array<{row: number; error: string}>;
  total: number;
}

export default function BulkOperationsPage() {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importRole, setImportRole] = useState('STUDENT');
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<ImportResult | null>(null);
  const [exportRole, setExportRole] = useState('');
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel'>('excel');

  const roles = [
    { value: 'STUDENT', label: 'Student' },
    { value: 'LECTURER', label: 'Lecturer' },
    { value: 'FINANCE', label: 'Finance' },
    { value: 'REGISTRY', label: 'Registry' },
    { value: 'ADMIN', label: 'Admin' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImportFile(e.target.files[0]);
      setImportResults(null);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      toast.error('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', importFile);
    formData.append('role', importRole);

    try {
      setImporting(true);
      const endpoint = importFile.name.endsWith('.csv')
        ? '/auth/bulk/import_users_csv/'
        : '/auth/bulk/import_users_excel/';

      const response = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setImportResults(response.data.results);
      toast.success(response.data.message);
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error(error.response?.data?.error || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (exportRole) params.append('role', exportRole);

      const endpoint = exportFormat === 'csv'
        ? `/auth/bulk/export_users_csv/?${params}`
        : `/auth/bulk/export_users_excel/?${params}`;

      const response = await api.get(endpoint, {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download',
        exportFormat === 'csv'
          ? `users_export.csv`
          : `users_export.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('Export completed successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed');
    }
  };

  const downloadTemplate = async (format: 'csv' | 'excel') => {
    try {
      const endpoint = format === 'csv'
        ? '/auth/bulk/download_template_csv/'
        : '/auth/bulk/download_template_excel/';

      const response = await api.get(endpoint, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download',
        format === 'csv'
          ? 'user_import_template.csv'
          : 'user_import_template.xlsx'
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('Template downloaded');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download template');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center space-x-4">
            <FileSpreadsheet className="h-12 w-12" />
            <div>
              <h1 className="text-3xl font-bold">Bulk Operations</h1>
              <p className="mt-1 text-indigo-100">
                Import and export users in bulk via CSV or Excel
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('import')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'import'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span>Import Users</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('export')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'export'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Download className="h-5 w-5" />
                  <span>Export Users</span>
                </div>
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Import Tab */}
            {activeTab === 'import' && (
              <div className="space-y-6">
                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-blue-800">Import Instructions</h3>
                      <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
                        <li>Download the template file first (CSV or Excel)</li>
                        <li>Fill in user data (required: email, first_name, last_name)</li>
                        <li>Upload the completed file</li>
                        <li>Select the role for imported users</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Download Templates */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    1. Download Template
                  </label>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => downloadTemplate('csv')}
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <FileText className="h-5 w-5 text-green-600" />
                      <span>Download CSV Template</span>
                    </button>
                    <button
                      onClick={() => downloadTemplate('excel')}
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <FileSpreadsheet className="h-5 w-5 text-green-600" />
                      <span>Download Excel Template</span>
                    </button>
                  </div>
                </div>

                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    2. Select Role for Users
                  </label>
                  <select
                    value={importRole}
                    onChange={(e) => setImportRole(e.target.value)}
                    className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {roles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    3. Upload File
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept=".csv,.xlsx"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    <button
                      onClick={handleImport}
                      disabled={!importFile || importing}
                      className="flex items-center space-x-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {importing ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Importing...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-5 w-5" />
                          <span>Import</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Import Results */}
                {importResults && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4">Import Results</h3>

                    {/* Summary */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Total</span>
                          <span className="text-2xl font-bold">{importResults.total}</span>
                        </div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-green-600">Success</span>
                          <span className="text-2xl font-bold text-green-600">{importResults.success.length}</span>
                        </div>
                      </div>
                      <div className="bg-red-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-red-600">Errors</span>
                          <span className="text-2xl font-bold text-red-600">{importResults.errors.length}</span>
                        </div>
                      </div>
                    </div>

                    {/* Success List */}
                    {importResults.success.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-green-800 mb-2 flex items-center space-x-2">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Successfully Imported ({importResults.success.length})</span>
                        </h4>
                        <div className="max-h-40 overflow-y-auto bg-green-50 rounded p-2">
                          {importResults.success.map((item, index) => (
                            <div key={index} className="text-xs text-green-700 py-1">
                              Row {item.row}: {item.name} ({item.email})
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Error List */}
                    {importResults.errors.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-red-800 mb-2 flex items-center space-x-2">
                          <XCircle className="h-4 w-4" />
                          <span>Errors ({importResults.errors.length})</span>
                        </h4>
                        <div className="max-h-40 overflow-y-auto bg-red-50 rounded p-2">
                          {importResults.errors.map((item, index) => (
                            <div key={index} className="text-xs text-red-700 py-1">
                              Row {item.row}: {item.error}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Export Tab */}
            {activeTab === 'export' && (
              <div className="space-y-6">
                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-blue-800">Export Instructions</h3>
                      <p className="mt-1 text-sm text-blue-700">
                        Select filters and format, then click export to download user data.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Role Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Role (Optional)
                  </label>
                  <select
                    value={exportRole}
                    onChange={(e) => setExportRole(e.target.value)}
                    className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">All Roles</option>
                    {roles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Format Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Export Format
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        value="csv"
                        checked={exportFormat === 'csv'}
                        onChange={(e) => setExportFormat(e.target.value as 'csv')}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <FileText className="h-5 w-5 text-green-600" />
                      <span className="text-sm">CSV</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        value="excel"
                        checked={exportFormat === 'excel'}
                        onChange={(e) => setExportFormat(e.target.value as 'excel')}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <FileSpreadsheet className="h-5 w-5 text-green-600" />
                      <span className="text-sm">Excel</span>
                    </label>
                  </div>
                </div>

                {/* Export Button */}
                <div>
                  <button
                    onClick={handleExport}
                    className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <FileDown className="h-5 w-5" />
                    <span>Export Users</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
