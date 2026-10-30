import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Check,
  X,
  Trash2,
  Clock,
  Search,
  RefreshCw,
  LayoutDashboard,
  AlertCircle,
  CheckCircle2,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Briefcase,
  Layers,
  FileText,
} from 'lucide-react';
import { getUsers, updateUserStatus, deleteUser } from '../services/api';
import ReportPromptModal from '../components/ReportPromptModal';
import { generateUsersReport } from '../utils/reportGenerator';
import './AdminPanel.css';

export default function AdminPanel({ currentUser, onNavigate, onLogout }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // 'pending' | 'all' | 'active'
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [showReportPrompt, setShowReportPrompt] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsers();
      if (res.success && Array.isArray(res.data)) {
        setUsers(res.data);
      }
    } catch (err) {
      showToast(
        err.response?.data?.message || 'Failed to fetch registered officers list.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusChange = async (userId, newStatus, userName) => {
    setActionLoadingId(userId);
    try {
      const res = await updateUserStatus(userId, newStatus);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, status: newStatus } : u))
        );
        const actionLabel =
          newStatus === 'active'
            ? 'approved (අනුමත කරන ලදී)'
            : newStatus === 'inactive'
            ? 'deactivated (අක්‍රිය කරන ලදී)'
            : 'marked pending';
        showToast(`Officer ${userName} has been successfully ${actionLabel}.`, 'success');
      }
    } catch (err) {
      showToast(
        err.response?.data?.message || `Failed to update status for ${userName}.`,
        'error'
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete officer account: "${userName}"?`
      )
    ) {
      return;
    }

    setActionLoadingId(userId);
    try {
      const res = await deleteUser(userId);
      if (res.success) {
        setUsers((prev) => prev.filter((u) => u._id !== userId));
        showToast(`Account for "${userName}" deleted successfully.`, 'success');
      }
    } catch (err) {
      showToast(
        err.response?.data?.message || `Failed to delete account for ${userName}.`,
        'error'
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingCount = users.filter((u) => u.status === 'pending').length;
  const activeCount = users.filter((u) => u.status === 'active').length;

  const filteredUsers = users.filter((u) => {
    if (filter === 'pending') return u.status === 'pending';
    if (filter === 'active') return u.status === 'active';
    return true; // 'all'
  }).filter((u) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  const handleGenerateUsersReport = (format) => {
    generateUsersReport(format, {
      users: filteredUsers,
      filter,
      currentUser,
    });
    showToast(`Officer Accounts Report (${format.toUpperCase()}) generated successfully!`);
  };

  return (
    <main className="main-content admin-panel-container">
      {/* Toast Alert */}
      {toast && (
        <div className={`admin-toast-notice toast-${toast.type} animate-fade-in`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Admin Banner */}
      <div className="admin-header-banner animate-fade-in">
        <div className="admin-header-left">
          <div className="admin-shield-icon">
            <Shield size={28} />
          </div>
          <div>
            <div className="admin-title-row">
              <h2 className="admin-main-title">Development Section &bull; Admin Panel</h2>
              <span className="admin-badge-pill">Administrator Mode</span>
            </div>
            <p className="admin-subtitle">
              කටුගස්තොට කලාප අධ්‍යාපන කාර්යාලය &bull; සංවර්ධන අංශය (User Approvals & Control)
            </p>
          </div>
        </div>

        <div className="admin-header-actions">
          <button
            type="button"
            className="nav-btn nav-btn-outline"
            onClick={() => onNavigate('dashboard')}
            title="Switch to Funding Overview Dashboard"
          >
            <LayoutDashboard size={15} />
            <span>Go to Funding Dashboard</span>
          </button>
        </div>
      </div>

      {/* Admin Stats Row */}
      <div className="admin-stats-overview">
        <div
          className={`stat-card ${filter === 'pending' ? 'active-filter' : ''}`}
          onClick={() => setFilter('pending')}
        >
          <div className="stat-card-icon icon-amber">
            <Clock size={24} />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-label">Pending Approvals (අනුමැතිය සඳහා)</span>
            <span className="stat-card-value text-amber">{pendingCount}</span>
          </div>
          {pendingCount > 0 && <span className="stat-urgent-badge">Action Required</span>}
        </div>

        <div
          className={`stat-card ${filter === 'active' ? 'active-filter' : ''}`}
          onClick={() => setFilter('active')}
        >
          <div className="stat-card-icon icon-green">
            <UserCheck size={24} />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-label">Active Officers (ක්‍රියාකාරී)</span>
            <span className="stat-card-value text-green">{activeCount}</span>
          </div>
        </div>

        <div
          className={`stat-card ${filter === 'all' ? 'active-filter' : ''}`}
          onClick={() => setFilter('all')}
        >
          <div className="stat-card-icon icon-blue">
            <Users size={24} />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-label">Total Registered (මුළු සාමාජිකයින්)</span>
            <span className="stat-card-value">{users.length}</span>
          </div>
        </div>
      </div>

      {/* Main Section: User Management & Approvals */}
      <section className="admin-management-card animate-fade-in">
        <div className="admin-card-toolbar">
          <div className="toolbar-left">
            <h3 className="section-heading">
              <Users size={20} className="text-green" />
              <span>Officer Registration & Approvals (කාර්ය මණ්ඩල අනුමැතීන්)</span>
            </h3>
            <p className="section-subtext">
              අලුතින් ලියාපදිංචි වන නිලධාරීන්ට System එකට Login වීමට පෙර Admin විසින් මෙතැනින් අනුමැතිය (Approve) ලබා දිය යුතුය.
            </p>
          </div>

          <div className="toolbar-right">
            {/* Search Input */}
            <div className="admin-search-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search by name, role, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-search-input"
              />
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              className="admin-refresh-btn"
              onClick={fetchUsers}
              disabled={loading}
              title="Refresh list"
            >
              <RefreshCw size={16} className={loading ? 'spin-animation' : ''} />
              <span>Refresh</span>
            </button>

            {/* Generate Report Button */}
            <button
              type="button"
              className="admin-refresh-btn admin-report-btn"
              onClick={() => setShowReportPrompt(true)}
              disabled={loading || filteredUsers.length === 0}
              title="Generate Officer Directory Report (Excel or PDF)"
              style={{
                backgroundColor: '#f0fdf4',
                borderColor: '#86efac',
                color: '#15803d',
                fontWeight: 600,
              }}
            >
              <FileText size={16} />
              <span>Generate Report</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="admin-filter-bar">
          <button
            type="button"
            className={`filter-pill ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending Approvals ({pendingCount})
          </button>
          <button
            type="button"
            className={`filter-pill ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active Officers ({activeCount})
          </button>
          <button
            type="button"
            className={`filter-pill ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Accounts ({users.length})
          </button>
        </div>

        {/* Users Table */}
        <div className="admin-table-container">
          {loading ? (
            <div className="admin-loading-state">
              <RefreshCw size={24} className="spin-animation" />
              <span>Loading officers and verification requests...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="admin-empty-state">
              <Users size={36} className="empty-icon" />
              <h4>No officers found in this category</h4>
              <p>
                {filter === 'pending'
                  ? 'There are currently no new registration requests awaiting approval.'
                  : 'No accounts match the current filter criteria.'}
              </p>
            </div>
          ) : (
            <table className="admin-users-table">
              <thead>
                <tr>
                  <th>Officer Name & Designation</th>
                  <th>Contact Info</th>
                  <th>Status</th>
                  <th>Registered Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const isCurrent = currentUser?._id === user._id || currentUser?.phone === user.phone;
                  const isPending = user.status === 'pending';
                  const isActive = user.status === 'active';
                  const isActionLoading = actionLoadingId === user._id;

                  return (
                    <tr key={user._id} className={isPending ? 'row-highlight-pending' : ''}>
                      <td>
                        <div className="user-primary-cell">
                          <div className="admin-table-avatar">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong className="user-full-name">{user.name}</strong>
                            {isCurrent && <span className="current-user-tag">You</span>}
                            <div className="user-role-label">
                              <Briefcase size={13} />
                              <span>{user.role}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="user-contact-cell">
                          <div className="contact-item">
                            <Phone size={13} />
                            <span>{user.phone}</span>
                          </div>
                          {user.email ? (
                            <div className="contact-item">
                              <Mail size={13} />
                              <span>{user.email}</span>
                            </div>
                          ) : (
                            <span className="no-email-hint">No email provided</span>
                          )}
                        </div>
                      </td>

                      <td>
                        {isPending && (
                          <span className="status-badge status-pending">
                            <Clock size={12} />
                            <span>Pending Approval</span>
                          </span>
                        )}
                        {isActive && (
                          <span className="status-badge status-active">
                            <CheckCircle2 size={12} />
                            <span>Active</span>
                          </span>
                        )}
                        {user.status === 'inactive' && (
                          <span className="status-badge status-inactive">
                            <UserX size={12} />
                            <span>Deactivated</span>
                          </span>
                        )}
                      </td>

                      <td>
                        <span className="user-date-cell">
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '—'}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div className="table-actions-cell">
                          {isPending && (
                            <button
                              type="button"
                              className="btn-action-approve"
                              onClick={() => handleStatusChange(user._id, 'active', user.name)}
                              disabled={isActionLoading}
                              title="Approve this officer to log in"
                            >
                              <Check size={14} />
                              <span>Approve (අනුමත කරන්න)</span>
                            </button>
                          )}

                          {isActive && !isCurrent && (
                            <button
                              type="button"
                              className="btn-action-deactivate"
                              onClick={() => handleStatusChange(user._id, 'inactive', user.name)}
                              disabled={isActionLoading}
                              title="Temporarily deactivate officer login"
                            >
                              <span>Deactivate</span>
                            </button>
                          )}

                          {user.status === 'inactive' && (
                            <button
                              type="button"
                              className="btn-action-approve"
                              onClick={() => handleStatusChange(user._id, 'active', user.name)}
                              disabled={isActionLoading}
                              title="Reactivate officer account"
                            >
                              <Check size={14} />
                              <span>Reactivate</span>
                            </button>
                          )}

                          {!isCurrent && (
                            <button
                              type="button"
                              className="btn-action-delete"
                              onClick={() => handleDeleteUser(user._id, user.name)}
                              disabled={isActionLoading}
                              title="Permanently delete officer account"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Confirmation & Format Selection Modal for User Reports */}
      <ReportPromptModal
        isOpen={showReportPrompt}
        onClose={() => setShowReportPrompt(false)}
        reportTitle="Officer Accounts Directory Report"
        reportSubtitle="Katugastota ZEO DPTS User Accounts & Roles"
        reportDetails={`${filteredUsers.length} Officers • Filter: ${filter.toUpperCase()}`}
        defaultFormat="excel"
        onGenerate={handleGenerateUsersReport}
      />
    </main>
  );
}
