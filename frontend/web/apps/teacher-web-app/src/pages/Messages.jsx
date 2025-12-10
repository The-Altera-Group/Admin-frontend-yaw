import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../auth/hooks/useAuth';
import MainLayout from '../components/layout/MainLayout';
import messageService from '../services/messageService';
import { useApi } from '../hooks/useApi';
import {
  Send,
  Inbox,
  Mail,
  Trash2,
  Star,
  Archive,
  Search,
  Paperclip,
  X,
  ChevronLeft,
  Reply,
  Forward,
  Users,
  Clock,
  AlertCircle,
  Loader,
  RefreshCw
} from 'lucide-react';

const Messages = () => {
  const { user, logout } = useAuth();

  // State management
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showCompose, setShowCompose] = useState(false);

  // API integration
  const { data: messages, loading, error, execute: fetchMessages } = useApi(
    () => messageService.getAll({ folder: selectedFolder }),
    { immediate: false, initialData: [] }
  );

  // Refetch when folder changes
  useEffect(() => {
    fetchMessages();
  }, [selectedFolder, fetchMessages]);

  const [replyTo, setReplyTo] = useState(null);

  // Compose form state
  const [composeForm, setComposeForm] = useState({
    to: '',
    subject: '',
    message: '',
    priority: 'normal',
    attachments: []
  });

  // CRUD handlers
  const handleSendMessage = async () => {
    try {
      await messageService.send(composeForm);
      setShowCompose(false);
      setComposeForm({ to: '', subject: '', message: '', priority: 'normal', attachments: [] });
      fetchMessages();
    } catch (err) {
      alert('Failed to send message: ' + (err.message || 'Unknown error'));
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await messageService.delete(messageId);
      fetchMessages();
    } catch (err) {
      alert('Failed to delete message: ' + (err.message || 'Unknown error'));
    }
  };

  const handleToggleStar = async (messageId, isStarred) => {
    try {
      await messageService.toggleStar(messageId, !isStarred);
      fetchMessages();
    } catch (err) {
      alert('Failed to star message: ' + (err.message || 'Unknown error'));
    }
  };

  const handleMarkAsRead = async (messageId, isRead) => {
    try {
      await messageService.markAsRead(messageId, isRead);
      fetchMessages();
    } catch (err) {
      alert('Failed to mark message: ' + (err.message || 'Unknown error'));
    }
  };

  // API integration for templates and contact groups
  const { data: templates } = useApi(messageService.getTemplates, { immediate: true, initialData: [] });
  const { data: contactGroups } = useApi(messageService.getContactGroups, { immediate: true, initialData: [] });

  // Folder configuration with dynamic badges
  const folders = useMemo(() => {
    if (!messages || !Array.isArray(messages)) return [
      { id: 'inbox', name: 'Inbox', icon: Inbox, badge: 0 },
      { id: 'sent', name: 'Sent', icon: Send, badge: 0 },
      { id: 'starred', name: 'Starred', icon: Star, badge: 0 },
      { id: 'archive', name: 'Archive', icon: Archive, badge: 0 },
      { id: 'trash', name: 'Trash', icon: Trash2, badge: 0 }
    ];

    return [
      { id: 'inbox', name: 'Inbox', icon: Inbox, badge: messages.filter(m => m.folder === 'inbox' && !m.isRead).length },
      { id: 'sent', name: 'Sent', icon: Send, badge: 0 },
      { id: 'starred', name: 'Starred', icon: Star, badge: messages.filter(m => m.isStarred).length },
      { id: 'archive', name: 'Archive', icon: Archive, badge: 0 },
      { id: 'trash', name: 'Trash', icon: Trash2, badge: 0 }
    ];
  }, [messages]);

  // Filter messages by folder
  const filteredMessages = useMemo(() => {
    if (!messages || !Array.isArray(messages)) return [];
    let filtered = messages;

    // Filter by folder
    if (selectedFolder === 'starred') {
      filtered = filtered.filter(m => m.isStarred);
    } else if (selectedFolder !== 'all') {
      filtered = filtered.filter(m => m.folder === selectedFolder);
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(m => m.type === filterType);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(m =>
        m.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.from?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.preview?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by timestamp (newest first)
    return filtered.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
  }, [messages, selectedFolder, filterType, searchTerm]);

  // Handle message selection
  const handleSelectMessage = async (message) => {
    setSelectedMessage(message);
    if (!message.isRead) {
      await handleMarkAsRead(message.id, true);
    }
  };

  // Handle archive
  const handleArchive = async (messageId) => {
    try {
      await messageService.moveToFolder(messageId, 'archive');
      setSelectedMessage(null);
      fetchMessages();
    } catch (err) {
      alert('Failed to archive message: ' + (err.message || 'Unknown error'));
    }
  };

  // Handle compose
  const handleCompose = () => {
    setShowCompose(true);
    setReplyTo(null);
    setComposeForm({
      to: '',
      subject: '',
      message: '',
      priority: 'normal',
      attachments: []
    });
  };

  // Handle reply
  const handleReply = (message) => {
    setShowCompose(true);
    setReplyTo(message);
    setComposeForm({
      to: message.fromEmail,
      subject: `Re: ${message.subject}`,
      message: '',
      priority: 'normal',
      attachments: []
    });
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.abs(now - date) / 36e5;

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Get message type badge
  const getTypeBadge = (type) => {
    const badges = {
      student: { label: 'Student', color: '#3b82f6' },
      parent: { label: 'Parent', color: '#8b5cf6' },
      admin: { label: 'Admin', color: '#ef4444' },
      teacher: { label: 'Sent', color: '#10b981' }
    };
    return badges[type] || badges.student;
  };

  return (
    <MainLayout user={user} onLogout={logout} activeView="messages">
      <div className="messages-page">
        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <Loader size={48} className="spinner" />
            <p>Loading messages...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="error-state">
            <AlertCircle size={48} color="#ef4444" />
            <h3>Failed to load messages</h3>
            <p>{error}</p>
            <button className="btn-primary" onClick={fetchMessages}>
              <RefreshCw size={20} />
              Retry
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
        <div className="messages-container">
          {/* Sidebar */}
          <div className="messages-sidebar">
            <button className="compose-btn" onClick={handleCompose}>
              <Send size={18} />
              Compose
            </button>

            <div className="folders-section">
              <div className="section-label">Folders</div>
              {folders.map(folder => {
                const Icon = folder.icon;
                return (
                  <button
                    key={folder.id}
                    className={`folder-item ${selectedFolder === folder.id ? 'active' : ''}`}
                    onClick={() => setSelectedFolder(folder.id)}
                  >
                    <Icon size={18} />
                    <span className="folder-name">{folder.name}</span>
                    {folder.badge > 0 && (
                      <span className="folder-badge">{folder.badge}</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="contacts-section">
              <div className="section-label">Quick Send</div>
              {contactGroups.map(group => {
                const Icon = group.icon;
                return (
                  <button
                    key={group.id}
                    className="contact-group-item"
                    onClick={() => {
                      handleCompose();
                      setComposeForm(prev => ({ ...prev, to: group.name }));
                    }}
                  >
                    <Icon size={18} />
                    <div className="contact-info">
                      <span className="contact-name">{group.name}</span>
                      <span className="contact-count">{group.count} members</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message List */}
          <div className="message-list">
            <div className="list-header">
              <h2 className="list-title">
                {folders.find(f => f.id === selectedFolder)?.name || 'Messages'}
              </h2>

              <div className="list-controls">
                <div className="search-box">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>

                <select
                  className="filter-select"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="student">Students</option>
                  <option value="parent">Parents</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="messages-scroll">
              {filteredMessages.length === 0 ? (
                <div className="empty-state">
                  <Inbox size={48} className="empty-icon" />
                  <p className="empty-title">No messages</p>
                  <p className="empty-subtitle">
                    {searchTerm ? 'No messages match your search' : 'Your inbox is empty'}
                  </p>
                </div>
              ) : (
                filteredMessages.map(message => {
                  const typeBadge = getTypeBadge(message.type);
                  return (
                    <div
                      key={message.id}
                      className={`message-item ${selectedMessage?.id === message.id ? 'active' : ''} ${!message.isRead ? 'unread' : ''}`}
                      onClick={() => handleSelectMessage(message)}
                    >
                      <div className="message-item-header">
                        <div className="message-from">
                          {!message.isRead && <div className="unread-dot" />}
                          <span className="from-name">{message.from}</span>
                        </div>
                        <div className="message-meta">
                          {message.hasAttachment && <Paperclip size={14} className="attachment-icon" />}
                          {message.isStarred && <Star size={14} className="star-icon filled" />}
                          <span className="message-time">{formatTime(message.timestamp)}</span>
                        </div>
                      </div>
                      <div className="message-subject">
                        {message.subject}
                        {message.priority === 'high' && (
                          <AlertCircle size={14} className="priority-icon" />
                        )}
                      </div>
                      <div className="message-preview">{message.preview}</div>
                      <div className="message-badges">
                        <span
                          className="type-badge"
                          style={{ background: typeBadge.color + '20', color: typeBadge.color }}
                        >
                          {typeBadge.label}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Message View */}
          <div className="message-view">
            {showCompose ? (
              <div className="compose-view">
                <div className="compose-header">
                  <h3 className="compose-title">
                    {replyTo ? 'Reply' : 'New Message'}
                  </h3>
                  <button className="close-btn" onClick={() => setShowCompose(false)}>
                    <X size={20} />
                  </button>
                </div>

                <div className="compose-form">
                  <div className="form-field">
                    <label>To</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter recipient email or select group..."
                      value={composeForm.to}
                      onChange={(e) => setComposeForm(prev => ({ ...prev, to: e.target.value }))}
                    />
                  </div>

                  <div className="form-field">
                    <label>Subject</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter subject..."
                      value={composeForm.subject}
                      onChange={(e) => setComposeForm(prev => ({ ...prev, subject: e.target.value }))}
                    />
                  </div>

                  <div className="form-field">
                    <label>Priority</label>
                    <select
                      className="form-select"
                      value={composeForm.priority}
                      onChange={(e) => setComposeForm(prev => ({ ...prev, priority: e.target.value }))}
                    >
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="low">Low</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Message</label>
                    <textarea
                      className="form-textarea"
                      placeholder="Type your message..."
                      rows="12"
                      value={composeForm.message}
                      onChange={(e) => setComposeForm(prev => ({ ...prev, message: e.target.value }))}
                    />
                  </div>

                  <div className="compose-actions">
                    <button className="attach-btn">
                      <Paperclip size={18} />
                      Attach File
                    </button>
                    <div className="send-actions">
                      <button className="cancel-btn" onClick={() => setShowCompose(false)}>
                        Cancel
                      </button>
                      <button className="send-btn" onClick={handleSendMessage}>
                        <Send size={18} />
                        Send Message
                      </button>
                    </div>
                  </div>
                </div>

                {templates.length > 0 && (
                  <div className="templates-section">
                    <div className="templates-header">Quick Templates</div>
                    <div className="templates-list">
                      {templates.map(template => (
                        <button
                          key={template.id}
                          className="template-item"
                          onClick={() => {
                            setComposeForm(prev => ({
                              ...prev,
                              subject: template.subject,
                              message: template.body
                            }));
                          }}
                        >
                          {template.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : selectedMessage ? (
              <div className="message-detail">
                <div className="detail-header">
                  <button className="back-btn" onClick={() => setSelectedMessage(null)}>
                    <ChevronLeft size={20} />
                    Back
                  </button>

                  <div className="detail-actions">
                    <button
                      className={`action-icon-btn ${selectedMessage.isStarred ? 'active' : ''}`}
                      onClick={() => handleToggleStar(selectedMessage.id)}
                    >
                      <Star size={18} />
                    </button>
                    <button className="action-icon-btn" onClick={() => handleArchive(selectedMessage.id)}>
                      <Archive size={18} />
                    </button>
                    <button className="action-icon-btn delete" onClick={() => handleDelete(selectedMessage.id)}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="detail-content">
                  <div className="message-header-full">
                    <h2 className="message-subject-full">{selectedMessage.subject}</h2>

                    <div className="message-info-row">
                      <div className="sender-info">
                        <div className="sender-avatar">
                          {selectedMessage.from[0]}
                        </div>
                        <div className="sender-details">
                          <div className="sender-name">{selectedMessage.from}</div>
                          <div className="sender-email">{selectedMessage.fromEmail}</div>
                        </div>
                      </div>

                      <div className="message-timestamp">
                        <Clock size={14} />
                        {new Date(selectedMessage.timestamp).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>

                    {selectedMessage.priority === 'high' && (
                      <div className="priority-banner">
                        <AlertCircle size={16} />
                        High Priority Message
                      </div>
                    )}
                  </div>

                  <div className="message-body">
                    {selectedMessage.body.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>

                  {selectedMessage.hasAttachment && (
                    <div className="attachments-section">
                      <div className="attachments-header">Attachments</div>
                      <div className="attachment-item">
                        <Paperclip size={16} />
                        <span>doctors_note.pdf</span>
                        <span className="attachment-size">245 KB</span>
                      </div>
                    </div>
                  )}

                  <div className="message-actions-bottom">
                    <button className="action-btn reply" onClick={() => handleReply(selectedMessage)}>
                      <Reply size={18} />
                      Reply
                    </button>
                    <button className="action-btn">
                      <Forward size={18} />
                      Forward
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-view">
                <Mail size={64} className="empty-view-icon" />
                <p className="empty-view-title">No message selected</p>
                <p className="empty-view-subtitle">
                  Select a message from the list to view its contents
                </p>
              </div>
            )}
          </div>
        </div>
        )}
      </div>

      <style jsx>{`
        .messages-page {
          height: calc(100vh - 64px);
          background: var(--bg-primary);
          overflow: hidden;
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

        .btn-primary {
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
        }

        .messages-container {
          display: grid;
          grid-template-columns: 260px 380px 1fr;
          height: 100%;
          gap: 1px;
          background: var(--border-color);
        }

        /* Sidebar */
        .messages-sidebar {
          background: white;
          padding: var(--space-lg);
          overflow-y: auto;
        }

        .compose-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-sm);
          padding: 0.75rem;
          background: var(--primary-green);
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: var(--space-lg);
        }

        .compose-btn:hover {
          background: var(--primary-green-hover);
          transform: translateY(-1px);
        }

        .folders-section,
        .contacts-section {
          margin-bottom: var(--space-lg);
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

        .folder-item,
        .contact-group-item {
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
        }

        .folder-item:hover,
        .contact-group-item:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .folder-item.active {
          background: #dcfce7;
          color: var(--primary-green);
        }

        .folder-name,
        .contact-name {
          flex: 1;
          text-align: left;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .folder-badge {
          background: var(--primary-green);
          color: white;
          padding: 0.125rem 0.5rem;
          border-radius: 1rem;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .contact-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .contact-count {
          font-size: 0.75rem;
          color: var(--text-tertiary);
        }

        /* Message List */
        .message-list {
          background: white;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .list-header {
          padding: var(--space-lg);
          border-bottom: 1px solid var(--border-color);
        }

        .list-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 var(--space-md) 0;
        }

        .list-controls {
          display: flex;
          gap: var(--space-sm);
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
          padding: 0.5rem 0.5rem 0.5rem 2.5rem;
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
          padding: 0.5rem;
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          font-size: 0.875rem;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-select:focus {
          outline: none;
          border-color: var(--primary-green);
        }

        .messages-scroll {
          flex: 1;
          overflow-y: auto;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--space-xl);
          text-align: center;
          min-height: 400px;
        }

        .empty-icon {
          color: var(--text-tertiary);
          margin-bottom: var(--space-md);
        }

        .empty-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 var(--space-xs) 0;
        }

        .empty-subtitle {
          color: var(--text-tertiary);
          margin: 0;
        }

        .message-item {
          padding: var(--space-md);
          border-bottom: 1px solid var(--border-color);
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .message-item:hover {
          background: var(--bg-secondary);
        }

        .message-item.active {
          background: #dcfce7;
          border-left: 3px solid var(--primary-green);
        }

        .message-item.unread {
          background: #f0fdf4;
        }

        .message-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-xs);
        }

        .message-from {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
        }

        .unread-dot {
          width: 8px;
          height: 8px;
          background: var(--primary-green);
          border-radius: 50%;
        }

        .from-name {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 0.875rem;
        }

        .message-meta {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
        }

        .attachment-icon,
        .message-time {
          color: var(--text-tertiary);
          font-size: 0.75rem;
        }

        .star-icon {
          color: var(--text-tertiary);
        }

        .star-icon.filled {
          color: #fbbf24;
          fill: #fbbf24;
        }

        .message-subject {
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: var(--space-xs);
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: var(--space-xs);
        }

        .priority-icon {
          color: #ef4444;
        }

        .message-preview {
          font-size: 0.8125rem;
          color: var(--text-tertiary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin-bottom: var(--space-xs);
        }

        .message-badges {
          display: flex;
          gap: var(--space-xs);
        }

        .type-badge {
          padding: 0.125rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
        }

        /* Message View */
        .message-view {
          background: white;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .empty-view {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: var(--space-xl);
          text-align: center;
        }

        .empty-view-icon {
          color: var(--text-tertiary);
          margin-bottom: var(--space-md);
          opacity: 0.3;
        }

        .empty-view-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 var(--space-xs) 0;
        }

        .empty-view-subtitle {
          color: var(--text-tertiary);
          margin: 0;
        }

        /* Message Detail */
        .message-detail {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-md) var(--space-lg);
          border-bottom: 1px solid var(--border-color);
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          padding: 0.5rem 1rem;
          background: transparent;
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .back-btn:hover {
          border-color: var(--primary-green);
          color: var(--primary-green);
        }

        .detail-actions {
          display: flex;
          gap: var(--space-xs);
        }

        .action-icon-btn {
          padding: 0.5rem;
          background: transparent;
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-icon-btn:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .action-icon-btn.active {
          color: #fbbf24;
        }

        .action-icon-btn.delete:hover {
          background: #fee2e2;
          color: #ef4444;
          border-color: #ef4444;
        }

        .detail-content {
          flex: 1;
          overflow-y: auto;
          padding: var(--space-lg);
        }

        .message-header-full {
          margin-bottom: var(--space-lg);
        }

        .message-subject-full {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 var(--space-md) 0;
        }

        .message-info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-md);
        }

        .sender-info {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .sender-avatar {
          width: 48px;
          height: 48px;
          background: var(--primary-green);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .sender-details {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .sender-name {
          font-weight: 600;
          color: var(--text-primary);
        }

        .sender-email {
          font-size: 0.875rem;
          color: var(--text-tertiary);
        }

        .message-timestamp {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          font-size: 0.875rem;
          color: var(--text-tertiary);
        }

        .priority-banner {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          padding: 0.75rem;
          background: #fee2e2;
          border: 1px solid #fecaca;
          border-left: 3px solid #ef4444;
          border-radius: 0.5rem;
          color: #dc2626;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .message-body {
          padding: var(--space-lg);
          background: var(--bg-secondary);
          border-radius: 0.75rem;
          margin-bottom: var(--space-lg);
          line-height: 1.6;
          color: var(--text-primary);
        }

        .message-body p {
          margin: 0 0 var(--space-md) 0;
        }

        .message-body p:last-child {
          margin-bottom: 0;
        }

        .attachments-section {
          margin-bottom: var(--space-lg);
        }

        .attachments-header {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--space-sm);
        }

        .attachment-item {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-md);
          background: var(--bg-secondary);
          border-radius: 0.5rem;
          font-size: 0.875rem;
          color: var(--text-primary);
        }

        .attachment-size {
          margin-left: auto;
          color: var(--text-tertiary);
          font-size: 0.75rem;
        }

        .message-actions-bottom {
          display: flex;
          gap: var(--space-sm);
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          padding: 0.625rem 1.25rem;
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          background: white;
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
        }

        .action-btn:hover {
          border-color: var(--primary-green);
          color: var(--primary-green);
        }

        .action-btn.reply {
          background: var(--primary-green);
          color: white;
          border-color: var(--primary-green);
        }

        .action-btn.reply:hover {
          background: var(--primary-green-hover);
        }

        /* Compose View */
        .compose-view {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .compose-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-lg);
          border-bottom: 1px solid var(--border-color);
        }

        .compose-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .close-btn {
          padding: 0.5rem;
          background: transparent;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
          border-radius: 0.5rem;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .compose-form {
          flex: 1;
          padding: var(--space-lg);
          overflow-y: auto;
        }

        .form-field {
          margin-bottom: var(--space-md);
        }

        .form-field label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary);
          margin-bottom: var(--space-xs);
        }

        .form-input,
        .form-select,
        .form-textarea {
          width: 100%;
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

        .compose-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-lg);
          border-top: 1px solid var(--border-color);
          background: var(--bg-secondary);
        }

        .attach-btn {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          padding: 0.625rem 1rem;
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .attach-btn:hover {
          border-color: var(--primary-green);
          color: var(--primary-green);
        }

        .send-actions {
          display: flex;
          gap: var(--space-sm);
        }

        .cancel-btn {
          padding: 0.625rem 1.25rem;
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cancel-btn:hover {
          background: var(--bg-secondary);
        }

        .send-btn {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          padding: 0.625rem 1.25rem;
          background: var(--primary-green);
          border: none;
          border-radius: 0.5rem;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .send-btn:hover {
          background: var(--primary-green-hover);
        }

        .templates-section {
          padding: 0 var(--space-lg) var(--space-lg);
        }

        .templates-header {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: var(--space-sm);
        }

        .templates-list {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-xs);
        }

        .template-item {
          padding: 0.5rem 1rem;
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          font-size: 0.8125rem;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .template-item:hover {
          border-color: var(--primary-green);
          color: var(--primary-green);
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .messages-container {
            grid-template-columns: 220px 340px 1fr;
          }
        }

        @media (max-width: 1024px) {
          .messages-container {
            grid-template-columns: 200px 1fr;
          }

          .message-view {
            display: none;
          }

          .message-item.active {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 1000;
            border: none;
          }
        }

        @media (max-width: 768px) {
          .messages-container {
            grid-template-columns: 1fr;
          }

          .messages-sidebar {
            display: none;
          }

          .message-list {
            grid-column: 1;
          }
        }
      `}</style>
    </MainLayout>
  );
};

export default Messages;
