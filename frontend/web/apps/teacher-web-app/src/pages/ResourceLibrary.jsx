import React, { useState, useMemo } from 'react';
import { useAuth } from '../auth/hooks/useAuth';
import MainLayout from '../components/layout/MainLayout';
import resourceService from '../services/resourceService';
import { useApi } from '../hooks/useApi';
import {
  Upload,
  FolderPlus,
  Search,
  Grid,
  List,
  File,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Download,
  Share2,
  Trash2,
  Eye,
  Folder,
  Clock,
  Star,
  Tag,
  X,
  Save,
  HardDrive,
  Loader,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

const ResourceLibrary = () => {
  const { user, logout } = useAuth();

  // State management
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  // API integration
  const { data: resources, loading, error, execute: fetchResources } = useApi(
    () => resourceService.getAll({ folderId: selectedFolder !== 'all' ? selectedFolder : undefined }),
    { immediate: true, initialData: [] }
  );
  const { data: folders, loading: loadingFolders, execute: fetchFolders } = useApi(
    resourceService.getFolders,
    { immediate: true, initialData: [] }
  );
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    files: [],
    folder: '',
    tags: [],
    shareWith: 'none'
  });

  // New folder form
  const [folderForm, setFolderForm] = useState({
    name: '',
    description: '',
    color: '#3b82f6'
  });

  // File type icons
  const getFileIcon = (type) => {
    const icons = {
      pdf: { icon: FileText, color: '#ef4444' },
      word: { icon: FileText, color: '#2563eb' },
      excel: { icon: FileText, color: '#10b981' },
      powerpoint: { icon: FileText, color: '#f97316' },
      image: { icon: Image, color: '#ec4899' },
      video: { icon: Video, color: '#8b5cf6' },
      audio: { icon: Music, color: '#06b6d4' },
      archive: { icon: Archive, color: '#6b7280' },
      default: { icon: File, color: '#64748b' }
    };
    return icons[type] || icons.default;
  };

  // Format file size
  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now - date) / 36e5;

    if (diffInHours < 24) {
      return 'Today';
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  // Filter and sort resources
  const filteredResources = useMemo(() => {
    if (!resources || !Array.isArray(resources)) return [];

    let filtered = [...resources];

    // Filter by folder
    if (selectedFolder !== 'all' && selectedFolder !== 'starred' && selectedFolder !== 'recent') {
      filtered = filtered.filter(r => r.folder === selectedFolder || r.folderId === selectedFolder);
    } else if (selectedFolder === 'starred') {
      filtered = filtered.filter(r => r.isStarred);
    } else if (selectedFolder === 'recent') {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      filtered = filtered.filter(r => new Date(r.uploadedDate || r.createdAt || 0) > oneDayAgo);
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(r => r.type === filterType);
    }

    // Filter by search with safe optional chaining
    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.tags && Array.isArray(r.tags) && r.tags.some(tag => tag?.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }

    // Sort with safe data handling
    if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.uploadedDate || b.createdAt || 0) - new Date(a.uploadedDate || a.createdAt || 0));
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortBy === 'size') {
      filtered.sort((a, b) => (b.size || 0) - (a.size || 0));
    } else if (sortBy === 'views') {
      filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
    }

    return filtered;
  }, [resources, selectedFolder, filterType, searchTerm, sortBy]);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!resources || !Array.isArray(resources)) {
      return {
        total: 0,
        size: 0,
        shared: 0,
        starred: 0
      };
    }

    const totalSize = resources.reduce((sum, r) => sum + (r.size || 0), 0);
    const totalResources = resources.length;
    const sharedCount = resources.filter(r => r.sharedWith && Array.isArray(r.sharedWith) && r.sharedWith.length > 0).length;
    const starredCount = resources.filter(r => r.isStarred).length;

    return {
      total: totalResources,
      size: totalSize,
      shared: sharedCount,
      starred: starredCount
    };
  }, [resources]);

  // Handle star toggle
  const handleToggleStar = async (id, isStarred) => {
    try {
      await resourceService.toggleStar(id, !isStarred);
      fetchResources();
    } catch (err) {
      alert('Failed to toggle star: ' + (err.message || 'Unknown error'));
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await resourceService.delete(id);
        fetchResources();
      } catch (err) {
        alert('Failed to delete resource: ' + (err.message || 'Unknown error'));
      }
    }
  };

  // Handle upload
  const handleUpload = async () => {
    try {
      // Note: In production, this would handle actual file upload with progress
      // For now, we'll just simulate the upload
      if (uploadForm.files.length > 0) {
        // Upload each file
        for (const file of uploadForm.files) {
          await resourceService.upload(file, {
            folderId: uploadForm.folder,
            tags: uploadForm.tags,
            shareWith: uploadForm.shareWith !== 'none' ? [uploadForm.shareWith] : []
          });
        }
        fetchResources();
      }
      setShowUploadModal(false);
      setUploadForm({
        files: [],
        folder: '',
        tags: [],
        shareWith: 'none'
      });
    } catch (err) {
      alert('Failed to upload files: ' + (err.message || 'Unknown error'));
    }
  };

  // Handle create folder
  const handleCreateFolder = async () => {
    try {
      await resourceService.createFolder({
        name: folderForm.name,
        description: folderForm.description,
        color: folderForm.color
      });
      fetchFolders();
      setShowFolderModal(false);
      setFolderForm({
        name: '',
        description: '',
        color: '#3b82f6'
      });
    } catch (err) {
      alert('Failed to create folder: ' + (err.message || 'Unknown error'));
    }
  };

  // Handle download
  const handleDownload = async (id) => {
    try {
      await resourceService.download(id);
    } catch (err) {
      alert('Failed to download resource: ' + (err.message || 'Unknown error'));
    }
  };

  // Handle share
  const handleShare = async (id, classIds) => {
    try {
      await resourceService.share(id, classIds);
      fetchResources();
    } catch (err) {
      alert('Failed to share resource: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <MainLayout user={user} onLogout={logout} activeView="resources">
      <div className="resources-page">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <div>
              <h1 className="page-title">Resource Library</h1>
              <p className="page-subtitle">Manage and share teaching resources</p>
            </div>

            <div className="header-actions">
              <button className="action-btn secondary" onClick={() => setShowFolderModal(true)}>
                <FolderPlus size={18} />
                New Folder
              </button>
              <button className="action-btn primary" onClick={() => setShowUploadModal(true)}>
                <Upload size={18} />
                Upload Files
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {(loading || loadingFolders) && (
          <div className="loading-state">
            <Loader size={48} className="spinner" />
            <p>Loading resource library...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="error-state">
            <AlertCircle size={48} color="#ef4444" />
            <h3>Failed to load resources</h3>
            <p>{error}</p>
            <button className="btn-retry" onClick={fetchResources}>
              <RefreshCw size={20} />
              Retry
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !loadingFolders && !error && (
          <>
            {/* Statistics */}
            <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper blue">
              <File size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{statistics.total}</div>
              <div className="stat-label">Total Resources</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper purple">
              <HardDrive size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{formatSize(statistics.size)}</div>
              <div className="stat-label">Storage Used</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper green">
              <Share2 size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{statistics.shared}</div>
              <div className="stat-label">Shared Resources</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper orange">
              <Star size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{statistics.starred}</div>
              <div className="stat-label">Starred Items</div>
            </div>
          </div>
        </div>

        <div className="library-container">
          {/* Sidebar */}
          <div className="library-sidebar">
            <div className="sidebar-section">
              <div className="section-label">Quick Access</div>
              <button
                className={`sidebar-item ${selectedFolder === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedFolder('all')}
              >
                <File size={18} />
                <span>All Files</span>
                <span className="count">{resources?.length || 0}</span>
              </button>
              <button
                className={`sidebar-item ${selectedFolder === 'recent' ? 'active' : ''}`}
                onClick={() => setSelectedFolder('recent')}
              >
                <Clock size={18} />
                <span>Recent</span>
              </button>
              <button
                className={`sidebar-item ${selectedFolder === 'starred' ? 'active' : ''}`}
                onClick={() => setSelectedFolder('starred')}
              >
                <Star size={18} />
                <span>Starred</span>
                <span className="count">{statistics.starred}</span>
              </button>
            </div>

            <div className="sidebar-section">
              <div className="section-label">Folders</div>
              {folders && Array.isArray(folders) && folders.map(folder => (
                <button
                  key={folder.id}
                  className={`sidebar-item ${selectedFolder === folder.id ? 'active' : ''}`}
                  onClick={() => setSelectedFolder(folder.id)}
                >
                  <Folder size={18} style={{ color: folder.color || '#3b82f6' }} />
                  <span>{folder.name}</span>
                  <span className="count">{folder.resourceCount || 0}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="library-main">
            {/* Controls */}
            <div className="library-controls">
              <div className="search-box">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                className="filter-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="pdf">PDF</option>
                <option value="word">Word</option>
                <option value="powerpoint">PowerPoint</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
              </select>

              <select
                className="filter-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="recent">Most Recent</option>
                <option value="name">Name</option>
                <option value="size">Size</option>
                <option value="views">Most Viewed</option>
              </select>

              <div className="view-toggle">
                <button
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid size={18} />
                </button>
                <button
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <List size={18} />
                </button>
              </div>
            </div>

            {/* Resources */}
            <div className={`resources-container ${viewMode}`}>
              {filteredResources.length === 0 ? (
                <div className="empty-state">
                  <File size={64} className="empty-icon" />
                  <p className="empty-title">No resources found</p>
                  <p className="empty-subtitle">
                    {searchTerm ? 'Try a different search term' : 'Upload your first resource to get started'}
                  </p>
                  <button className="upload-btn-empty" onClick={() => setShowUploadModal(true)}>
                    <Upload size={18} />
                    Upload Files
                  </button>
                </div>
              ) : (
                filteredResources.map(resource => {
                  const fileInfo = getFileIcon(resource.type);
                  const FileIcon = fileInfo.icon;

                  return (
                    <div key={resource.id} className={`resource-card ${viewMode}`}>
                      <div className="resource-icon" style={{ background: fileInfo.color + '20' }}>
                        <FileIcon size={viewMode === 'grid' ? 32 : 24} style={{ color: fileInfo.color }} />
                      </div>

                      <div className="resource-info">
                        <div className="resource-name">{resource.name}</div>
                        <div className="resource-meta">
                          <span>{formatSize(resource.size)}</span>
                          <span>•</span>
                          <span>{formatDate(resource.uploadedDate)}</span>
                          {viewMode === 'list' && (
                            <>
                              <span>•</span>
                              <span>{resource.views} views</span>
                            </>
                          )}
                        </div>
                        {resource.tags.length > 0 && (
                          <div className="resource-tags">
                            {resource.tags.slice(0, 3).map((tag, index) => (
                              <span key={index} className="tag">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="resource-actions">
                        <button
                          className={`icon-btn ${resource.isStarred ? 'starred' : ''}`}
                          onClick={() => handleToggleStar(resource.id, resource.isStarred)}
                          title={resource.isStarred ? 'Unstar' : 'Star'}
                        >
                          <Star size={16} />
                        </button>
                        <button
                          className="icon-btn"
                          onClick={() => resourceService.trackView(resource.id).catch(() => {})}
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="icon-btn"
                          onClick={() => handleDownload(resource.id)}
                          title="Download"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          className="icon-btn"
                          onClick={() => handleShare(resource.id, [])}
                          title="Share"
                        >
                          <Share2 size={16} />
                        </button>
                        <button
                          className="icon-btn delete"
                          onClick={() => handleDelete(resource.id)}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
          </>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Upload Files</h2>
                <button className="close-modal-btn" onClick={() => setShowUploadModal(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                <div className="upload-area">
                  <Upload size={48} className="upload-icon" />
                  <p className="upload-text">Drag and drop files here or click to browse</p>
                  <input type="file" className="file-input" multiple />
                </div>

                <div className="form-field">
                  <label>Save to Folder</label>
                  <select
                    className="form-select"
                    value={uploadForm.folder}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, folder: e.target.value }))}
                  >
                    <option value="">Select folder...</option>
                    {folders.map(folder => (
                      <option key={folder.id} value={folder.id}>{folder.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label>Share With</label>
                  <select
                    className="form-select"
                    value={uploadForm.shareWith}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, shareWith: e.target.value }))}
                  >
                    <option value="none">Don't Share</option>
                    <option value="all">All Classes</option>
                    <option value="MATH101">Mathematics 101</option>
                    <option value="MATH102">Mathematics 102</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Tags (comma separated)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., homework, chapter3, review"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button className="cancel-btn" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </button>
                <button className="submit-btn" onClick={handleUpload}>
                  <Upload size={18} />
                  Upload Files
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Folder Modal */}
        {showFolderModal && (
          <div className="modal-overlay" onClick={() => setShowFolderModal(false)}>
            <div className="modal-content small" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Create New Folder</h2>
                <button className="close-modal-btn" onClick={() => setShowFolderModal(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                <div className="form-field">
                  <label>Folder Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter folder name..."
                    value={folderForm.name}
                    onChange={(e) => setFolderForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="form-field">
                  <label>Description</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Brief description..."
                    rows="3"
                    value={folderForm.description}
                    onChange={(e) => setFolderForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="form-field">
                  <label>Folder Color</label>
                  <div className="color-picker">
                    {['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'].map(color => (
                      <button
                        key={color}
                        className={`color-option ${folderForm.color === color ? 'selected' : ''}`}
                        style={{ background: color }}
                        onClick={() => setFolderForm(prev => ({ ...prev, color }))}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="cancel-btn" onClick={() => setShowFolderModal(false)}>
                  Cancel
                </button>
                <button className="submit-btn" onClick={handleCreateFolder}>
                  <Save size={18} />
                  Create Folder
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .resources-page {
          padding: var(--space-lg);
          background: var(--bg-primary);
          min-height: 100vh;
        }

        /* Loading and Error States */
        .loading-state,
        .error-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          text-align: center;
          padding: 2rem;
        }

        .loading-state p {
          margin-top: 1rem;
          color: var(--text-muted);
        }

        .spinner {
          animation: spin 1s linear infinite;
          color: var(--primary-green);
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .error-state h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 1rem 0 0.5rem;
        }

        .error-state p {
          color: var(--text-muted);
          margin-bottom: 1.5rem;
        }

        .btn-retry {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: var(--primary-green);
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-retry:hover {
          background: var(--primary-green-hover);
        }

        /* Header - similar to other pages */
        .page-header {
          margin-bottom: var(--space-lg);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: var(--space-md);
        }

        .page-title {
          font-size: 1.75rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 var(--space-xs) 0;
        }

        .page-subtitle {
          color: var(--text-secondary);
          margin: 0;
        }

        .header-actions {
          display: flex;
          gap: var(--space-sm);
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .action-btn.primary {
          background: var(--primary-green);
          color: white;
        }

        .action-btn.primary:hover {
          background: var(--primary-green-hover);
          transform: translateY(-1px);
        }

        .action-btn.secondary {
          background: white;
          color: var(--text-primary);
          border: 1px solid var(--border-color);
        }

        .action-btn.secondary:hover {
          border-color: var(--primary-green);
          color: var(--primary-green);
        }

        /* Statistics Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: var(--space-md);
          margin-bottom: var(--space-lg);
        }

        .stat-card {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          padding: var(--space-lg);
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .stat-icon-wrapper {
          width: 56px;
          height: 56px;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .stat-icon-wrapper.blue { background: #3b82f6; }
        .stat-icon-wrapper.green { background: #10b981; }
        .stat-icon-wrapper.purple { background: #8b5cf6; }
        .stat-icon-wrapper.orange { background: #f59e0b; }

        .stat-info {
          flex: 1;
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        /* Library Container */
        .library-container {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: var(--space-lg);
        }

        /* Sidebar */
        .library-sidebar {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          padding: var(--space-lg);
          height: fit-content;
        }

        .sidebar-section {
          margin-bottom: var(--space-lg);
        }

        .sidebar-section:last-child {
          margin-bottom: 0;
        }

        .section-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: var(--space-sm);
          padding: 0 var(--space-sm);
        }

        .sidebar-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: 0.625rem var(--space-sm);
          background: transparent;
          border: none;
          border-radius: 0.5rem;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 2px;
          font-size: 0.875rem;
        }

        .sidebar-item:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .sidebar-item.active {
          background: #dcfce7;
          color: var(--primary-green);
        }

        .sidebar-item span:first-of-type {
          flex: 1;
          text-align: left;
        }

        .count {
          font-size: 0.75rem;
          color: var(--text-tertiary);
        }

        /* Library Main */
        .library-main {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .library-controls {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          padding: var(--space-lg);
          display: flex;
          gap: var(--space-md);
          align-items: center;
        }

        .search-box {
          flex: 1;
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-tertiary);
        }

        .search-input {
          width: 100%;
          padding: 0.625rem 0.625rem 0.625rem 2.5rem;
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          font-size: 0.875rem;
          transition: all 0.2s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--primary-green);
          box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
        }

        .filter-select {
          padding: 0.625rem;
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          font-size: 0.875rem;
          background: white;
          cursor: pointer;
        }

        .filter-select:focus {
          outline: none;
          border-color: var(--primary-green);
        }

        .view-toggle {
          display: flex;
          background: var(--bg-secondary);
          border-radius: 0.5rem;
          padding: 4px;
        }

        .view-btn {
          padding: 0.5rem;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          border-radius: 0.375rem;
          transition: all 0.2s ease;
        }

        .view-btn.active {
          background: white;
          color: var(--text-primary);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        /* Resources Container */
        .resources-container {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          padding: var(--space-lg);
          min-height: 400px;
        }

        .resources-container.grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: var(--space-md);
        }

        .resources-container.list {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .empty-state {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--space-xl) * 2;
          text-align: center;
        }

        .empty-icon {
          color: var(--text-tertiary);
          margin-bottom: var(--space-md);
          opacity: 0.3;
        }

        .empty-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 var(--space-xs) 0;
        }

        .empty-subtitle {
          color: var(--text-tertiary);
          margin: 0 0 var(--space-lg) 0;
        }

        .upload-btn-empty {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          padding: 0.75rem 1.5rem;
          background: var(--primary-green);
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .upload-btn-empty:hover {
          background: var(--primary-green-hover);
        }

        /* Resource Card */
        .resource-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          padding: var(--space-md);
          display: flex;
          gap: var(--space-md);
          transition: all 0.2s ease;
        }

        .resource-card.grid {
          flex-direction: column;
        }

        .resource-card.list {
          flex-direction: row;
          align-items: center;
        }

        .resource-card:hover {
          border-color: var(--primary-green);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .resource-icon {
          width: 64px;
          height: 64px;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .resource-card.list .resource-icon {
          width: 48px;
          height: 48px;
        }

        .resource-info {
          flex: 1;
          min-width: 0;
        }

        .resource-name {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--space-xs);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .resource-card.grid .resource-name {
          font-size: 0.9375rem;
        }

        .resource-card.list .resource-name {
          font-size: 0.875rem;
        }

        .resource-meta {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          font-size: 0.75rem;
          color: var(--text-tertiary);
          margin-bottom: var(--space-xs);
        }

        .resource-tags {
          display: flex;
          gap: var(--space-xs);
          flex-wrap: wrap;
        }

        .tag {
          padding: 0.25rem 0.5rem;
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 0.25rem;
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .resource-actions {
          display: flex;
          gap: var(--space-xs);
        }

        .resource-card.grid .resource-actions {
          justify-content: flex-end;
        }

        .resource-card.list .resource-actions {
          flex-shrink: 0;
        }

        .icon-btn {
          padding: 0.5rem;
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 0.375rem;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .icon-btn:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .icon-btn.starred {
          color: #fbbf24;
        }

        .icon-btn.starred:hover {
          background: #fef3c7;
        }

        .icon-btn.delete:hover {
          background: #fee2e2;
          border-color: #ef4444;
          color: #ef4444;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: var(--space-lg);
        }

        .modal-content {
          background: white;
          border-radius: 0.75rem;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .modal-content.small {
          max-width: 480px;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-lg);
          border-bottom: 1px solid var(--border-color);
        }

        .modal-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .close-modal-btn {
          padding: 0.5rem;
          background: transparent;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
          border-radius: 0.375rem;
          transition: all 0.2s ease;
        }

        .close-modal-btn:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .modal-body {
          flex: 1;
          overflow-y: auto;
          padding: var(--space-lg);
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .upload-area {
          border: 2px dashed var(--border-color);
          border-radius: 0.75rem;
          padding: var(--space-xl);
          text-align: center;
          background: var(--bg-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .upload-area:hover {
          border-color: var(--primary-green);
          background: #dcfce7;
        }

        .upload-icon {
          color: var(--text-tertiary);
          margin-bottom: var(--space-md);
        }

        .upload-text {
          color: var(--text-secondary);
          margin: 0;
        }

        .file-input {
          display: none;
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
        }

        .form-field label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .form-input,
        .form-select,
        .form-textarea {
          padding: 0.625rem;
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          font-size: 0.875rem;
          color: var(--text-primary);
          transition: all 0.2s ease;
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          outline: none;
          border-color: var(--primary-green);
          box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
        }

        .form-textarea {
          resize: vertical;
          font-family: inherit;
        }

        .color-picker {
          display: flex;
          gap: var(--space-sm);
        }

        .color-option {
          width: 40px;
          height: 40px;
          border-radius: 0.5rem;
          border: 3px solid transparent;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .color-option:hover {
          transform: scale(1.1);
        }

        .color-option.selected {
          border-color: var(--text-primary);
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: var(--space-sm);
          padding: var(--space-lg);
          border-top: 1px solid var(--border-color);
        }

        .cancel-btn,
        .submit-btn {
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cancel-btn {
          background: white;
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
        }

        .cancel-btn:hover {
          background: var(--bg-secondary);
        }

        .submit-btn {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          background: var(--primary-green);
          border: none;
          color: white;
        }

        .submit-btn:hover {
          background: var(--primary-green-hover);
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .library-container {
            grid-template-columns: 1fr;
          }

          .library-sidebar {
            display: none;
          }

          .resources-container.grid {
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .resources-page {
            padding: var(--space-md);
          }

          .header-content {
            flex-direction: column;
            align-items: stretch;
          }

          .header-actions {
            flex-direction: column;
          }

          .action-btn {
            width: 100%;
            justify-content: center;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .library-controls {
            flex-direction: column;
          }

          .search-box,
          .filter-select,
          .view-toggle {
            width: 100%;
          }

          .resources-container.grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </MainLayout>
  );
};

export default ResourceLibrary;
