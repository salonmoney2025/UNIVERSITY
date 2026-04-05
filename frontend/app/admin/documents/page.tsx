'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Upload, Download, Share2, Trash2, Eye, FileText, Grid, List, 
  Search, Filter, MoreVertical, Plus, Clock, User, Lock, Globe,
  CheckCircle, AlertTriangle, X
} from 'lucide-react'
import axios from 'axios'

interface Document {
  id: number
  title: string
  description: string
  file_type: string
  file_size: number
  file_size_display: string
  owner: { email: string }
  category?: { name: string }
  tags?: Array<{ name: string }>
  is_public: boolean
  is_archived: boolean
  requires_signature: boolean
  current_version: number
  created_at: string
  updated_at: string
  share_count: number
}

interface DocumentDetail extends Document {
  versions: Array<{
    version_number: number
    uploaded_by: { email: string }
    change_description: string
    created_at: string
  }>
  shares: Array<{
    id: number
    shared_with_user?: { email: string }
    shared_with_group_name?: string
    permission: string
    expires_at?: string
  }>
  signatures: Array<{
    id: number
    signed_by: { email: string }
    status: string
    signed_at: string
  }>
  activity: Array<{
    id: number
    user: { email: string }
    action: string
    created_at: string
  }>
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedDocument, setSelectedDocument] = useState<DocumentDetail | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // Fetch documents
  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/documents/?search=${searchQuery}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        }
      )
      setDocuments(response.data.results || response.data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch documents')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch document detail
  const fetchDocumentDetail = async (id: number) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/documents/${id}/`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        }
      )
      setSelectedDocument(response.data)
      setShowDetailModal(true)
    } catch (err) {
      setError('Failed to fetch document details')
    }
  }

  // Download document
  const handleDownload = async (id: number, title: string) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/documents/${id}/download/`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
          responseType: 'blob'
        }
      )
      const url = window.URL.createObjectURL(response.data)
      const a = document.createElement('a')
      a.href = url
      a.download = title
      a.click()
    } catch (err) {
      setError('Failed to download document')
    }
  }

  // Upload document
  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    setLoading(true)
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/documents/`,
        formData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        }
      )
      setShowUploadModal(false)
      fetchDocuments()
    } catch (err) {
      setError('Failed to upload document')
    } finally {
      setLoading(false)
    }
  }

  // Delete document
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure? This can be restored from trash.')) return
    
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/documents/${id}/delete_soft/`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        }
      )
      fetchDocuments()
    } catch (err) {
      setError('Failed to delete document')
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [searchQuery])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Documents</h1>
          <p className="text-gray-600">Manage and share your documents</p>
        </div>
        <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <Label>Document Title</Label>
                <Input name="title" placeholder="My Document" required />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea name="description" placeholder="Optional description" />
              </div>
              <div>
                <Label>File</Label>
                <Input name="file" type="file" required />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Uploading...' : 'Upload'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Toolbar */}
      <div className="flex gap-2 items-center justify-between">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="work">Work</SelectItem>
            <SelectItem value="personal">Personal</SelectItem>
            <SelectItem value="legal">Legal</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button
            size="icon"
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Documents Grid/List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading documents...</p>
        </div>
      ) : documents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No documents yet</p>
            <Button className="mt-4" onClick={() => setShowUploadModal(true)}>
              Upload your first document
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <Card key={doc.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {/* Title and Type */}
                  <div>
                    <h3 className="font-semibold text-lg truncate">{doc.title}</h3>
                    <p className="text-sm text-gray-500">
                      {doc.file_type.toUpperCase()} • {doc.file_size_display}
                    </p>
                  </div>

                  {/* Description */}
                  {doc.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{doc.description}</p>
                  )}

                  {/* Tags & Status */}
                  <div className="flex flex-wrap gap-2">
                    {doc.is_public && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        Public
                      </Badge>
                    )}
                    {doc.requires_signature && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Requires Signature
                      </Badge>
                    )}
                    {doc.is_archived && (
                      <Badge variant="outline">Archived</Badge>
                    )}
                  </div>

                  {/* Owner & Date */}
                  <div className="text-xs text-gray-500 space-y-1">
                    <p className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {doc.owner.email}
                    </p>
                    <p className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Shares */}
                  {doc.share_count > 0 && (
                    <p className="text-xs text-blue-600">
                      Shared with {doc.share_count} {doc.share_count === 1 ? 'person' : 'people'}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => fetchDocumentDetail(doc.id)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(doc.id, doc.title)}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        fetchDocumentDetail(doc.id)
                        setShowShareModal(true)
                      }}
                    >
                      <Share2 className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(doc.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left text-sm font-semibold">
                  <th className="p-4">Title</th>
                  <th className="p-4">Owner</th>
                  <th className="p-4">Size</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{doc.title}</p>
                        {doc.description && <p className="text-xs text-gray-500">{doc.description.substring(0, 50)}</p>}
                      </div>
                    </td>
                    <td className="p-4 text-sm">{doc.owner.email}</td>
                    <td className="p-4 text-sm">{doc.file_size_display}</td>
                    <td className="p-4 text-sm uppercase">{doc.file_type}</td>
                    <td className="p-4">
                      {doc.is_public ? (
                        <Badge className="bg-blue-100 text-blue-800">Public</Badge>
                      ) : (
                        <Badge variant="outline">Private</Badge>
                      )}
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => fetchDocumentDetail(doc.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDownload(doc.id, doc.title)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(doc.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Detail Modal */}
      {selectedDocument && (
        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedDocument.title}</DialogTitle>
              <DialogDescription>{selectedDocument.description}</DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="versions">Versions ({selectedDocument.versions?.length || 0})</TabsTrigger>
                <TabsTrigger value="shares">Shares ({selectedDocument.shares?.length || 0})</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Owner</p>
                    <p className="font-medium">{selectedDocument.owner.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">File Type</p>
                    <p className="font-medium">{selectedDocument.file_type.toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">File Size</p>
                    <p className="font-medium">{selectedDocument.file_size_display}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Current Version</p>
                    <p className="font-medium">v{selectedDocument.current_version}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="font-medium">{new Date(selectedDocument.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Access</p>
                    <p className="font-medium">{selectedDocument.is_public ? 'Public' : 'Private'}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="versions" className="space-y-3">
                {selectedDocument.versions?.map((version) => (
                  <Card key={version.version_number}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Version {version.version_number}</p>
                          <p className="text-sm text-gray-600">{version.change_description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            By {version.uploaded_by.email} on {new Date(version.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="shares" className="space-y-3">
                {selectedDocument.shares?.length === 0 ? (
                  <p className="text-gray-500 text-center py-6">Not shared with anyone yet</p>
                ) : (
                  selectedDocument.shares?.map((share) => (
                    <Card key={share.id}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">
                              {share.shared_with_user?.email || share.shared_with_group_name}
                            </p>
                            <Badge variant="outline">{share.permission}</Badge>
                            {share.expires_at && (
                              <p className="text-xs text-gray-500 mt-1">
                                Expires: {new Date(share.expires_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <Button size="sm" variant="destructive">
                            Revoke
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="activity" className="space-y-3">
                {selectedDocument.activity?.map((act) => (
                  <div key={act.id} className="flex gap-3 pb-3 border-b last:border-b-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{act.action.replace('_', ' ').toUpperCase()}</p>
                      <p className="text-xs text-gray-500">{act.user.email}</p>
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(act.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
