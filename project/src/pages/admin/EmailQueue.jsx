import React, { useState, useEffect } from 'react';
import { Mail, RefreshCw, Trash2, Filter, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import adminAPI from '../../api/admin';

const EmailQueue = () => {
    const [emails, setEmails] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        status: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [retrying, setRetrying] = useState(false);

    useEffect(() => {
        loadEmails();
    }, [page, filters]);

    const loadEmails = async () => {
        try {
            setLoading(true);
            const result = await adminAPI.getEmailQueue(page, 50, filters.status);
            setEmails(result?.data?.emails || []);
            setStats(result?.data?.stats || {});
            setTotalPages(result?.data?.pagination?.totalPages || 1);
        } catch (error) {
            console.error('Failed to load email queue:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRetry = async () => {
        try {
            setRetrying(true);
            await adminAPI.retryEmails();
            alert('Email queue processing triggered');
            loadEmails();
        } catch (error) {
            alert('Failed to retry emails: ' + error.message);
        } finally {
            setRetrying(false);
        }
    };

    const handleDelete = async (emailId) => {
        if (window.confirm('Are you sure you want to remove this email from the queue?')) {
            try {
                await adminAPI.deleteEmailFromQueue(emailId);
                loadEmails();
            } catch (error) {
                alert('Failed to delete email: ' + error.message);
            }
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters({ ...filters, [key]: value });
        setPage(1);
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'sent':
                return <CheckCircle size={16} style={{ color: '#00ff80' }} />;
            case 'failed':
                return <XCircle size={16} style={{ color: '#ff6464' }} />;
            case 'sending':
                return <Clock size={16} style={{ color: '#ffc800' }} />;
            default:
                return <AlertCircle size={16} style={{ color: 'var(--color-text-muted)' }} />;
        }
    };

    return (
        <div>
            <header className="admin-header">
                <div>
                    <h1 className="page-title">Email Queue</h1>
                    <p style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        Monitor and manage email queue
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={handleRetry} className="btn-secondary" disabled={retrying}>
                        <RefreshCw size={18} className={retrying ? 'spinning' : ''} />
                        {retrying ? 'Retrying...' : 'Retry Failed'}
                    </button>
                    <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary">
                        <Filter size={18} />
                        Filters
                    </button>
                </div>
            </header>

            {/* Statistics */}
            {Object.keys(stats).length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                    {Object.entries(stats).map(([status, count]) => (
                        <div key={status} style={{ padding: '16px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px', textTransform: 'capitalize' }}>
                                {status}
                            </div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{count}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Filters Panel */}
            {showFilters && (
                <div style={{ 
                    background: 'var(--color-bg-card)', 
                    border: '1px solid var(--color-border)', 
                    borderRadius: 'var(--radius-md)', 
                    padding: '20px', 
                    marginBottom: '20px' 
                }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Status</label>
                            <select
                                className="form-select"
                                value={filters.status}
                                onChange={e => handleFilterChange('status', e.target.value)}
                            >
                                <option value="">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="sending">Sending</option>
                                <option value="sent">Sent</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="empty-state">Loading email queue...</div>
            ) : emails.length === 0 ? (
                <div className="empty-state">
                    <Mail size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                    <p>No emails in queue.</p>
                </div>
            ) : (
                <>
                    <div className="table-container" style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>To</th>
                                    <th>Subject</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Attempts</th>
                                    <th>Created</th>
                                    <th>Last Attempt</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {emails.map(email => (
                                    <tr key={email._id}>
                                        <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>{email.to}</td>
                                        <td>
                                            <div style={{ maxWidth: '300px' }}>
                                                <div style={{ fontWeight: 500 }}>{email.subject}</div>
                                                {email.errorMessage && (
                                                    <div style={{ fontSize: '11px', color: '#ff6464', marginTop: '4px' }}>
                                                        {email.errorMessage.substring(0, 50)}...
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ 
                                                fontSize: '11px', 
                                                padding: '2px 8px', 
                                                background: 'var(--color-bg-secondary)', 
                                                borderRadius: '12px',
                                                textTransform: 'capitalize'
                                            }}>
                                                {email.emailType || 'other'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                {getStatusIcon(email.status)}
                                                <span className={`status-badge ${
                                                    email.status === 'sent' ? 'status-confirmed' :
                                                    email.status === 'failed' ? 'status-rejected' :
                                                    email.status === 'sending' ? 'status-processing' :
                                                    'status-pending'
                                                }`}>
                                                    {email.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: 'bold' }}>
                                                {email.attempts || 0} / {email.maxAttempts || 3}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                            {formatDate(email.createdAt)}
                                        </td>
                                        <td style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                            {formatDate(email.lastAttemptAt)}
                                        </td>
                                        <td>
                                            {email.status === 'failed' && (
                                                <button 
                                                    onClick={() => handleDelete(email._id)} 
                                                    className="icon-btn danger" 
                                                    title="Remove from queue"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
                            <button 
                                onClick={() => setPage(p => Math.max(1, p - 1))} 
                                disabled={page === 1}
                                className="btn-secondary"
                            >
                                Previous
                            </button>
                            <span style={{ display: 'flex', alignItems: 'center', padding: '0 16px' }}>
                                Page {page} of {totalPages}
                            </span>
                            <button 
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                                disabled={page === totalPages}
                                className="btn-secondary"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default EmailQueue;
