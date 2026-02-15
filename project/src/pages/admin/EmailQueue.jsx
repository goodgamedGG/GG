import React, { useState, useEffect } from 'react';
import { Mail, RefreshCw, Trash2, Filter, CheckCircle, XCircle, Clock, AlertCircle, Eye as EyeIcon, X } from 'lucide-react';
// Build force refresh: 1771186827000
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

    const [selectedEmail, setSelectedEmail] = useState(null);

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
                return <CheckCircle size={16} style={{ color: 'var(--color-success)' }} />;
            case 'failed':
                return <XCircle size={16} style={{ color: 'var(--color-danger)' }} />;
            case 'sending':
                return <RefreshCw size={16} className="spinning" style={{ color: 'var(--color-warning)' }} />;
            default:
                return <Clock size={16} style={{ color: 'var(--color-info)' }} />;
        }
    };

    return (
        <div className="admin-container">
            <header className="admin-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title" style={{ margin: 0 }}>Email Queue</h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '4px' }}>
                        Monitor and manage outgoing system emails
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={handleRetry}
                        className="btn-secondary"
                        disabled={retrying}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <RefreshCw size={18} className={retrying ? 'spinning' : ''} />
                        {retrying ? 'Processing...' : 'Retry Failed'}
                    </button>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Filter size={18} />
                        Filters
                    </button>
                </div>
            </header>

            {/* Statistics Cards */}
            {Object.keys(stats).length > 0 && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '20px',
                    marginBottom: '32px'
                }}>
                    {Object.entries(stats).map(([status, count]) => (
                        <div key={status} className="admin-card" style={{
                            padding: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            borderLeft: `4px solid ${status === 'sent' ? 'var(--color-success)' :
                                status === 'failed' ? 'var(--color-danger)' :
                                    status === 'sending' ? 'var(--color-warning)' :
                                        'var(--color-info)'
                                }`
                        }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: 'var(--color-bg-secondary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {status === 'sent' && <CheckCircle size={24} color="var(--color-success)" />}
                                {status === 'failed' && <XCircle size={24} color="var(--color-danger)" />}
                                {status === 'pending' && <Clock size={24} color="var(--color-info)" />}
                                {status === 'sending' && <RefreshCw size={24} color="var(--color-warning)" className="spinning" />}
                            </div>
                            <div>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>
                                    {status}
                                </div>
                                <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--color-text-primary)', fontFamily: 'Orbitron, sans-serif' }}>
                                    {count}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Filters Panel */}
            {showFilters && (
                <div className="admin-card" style={{ padding: '24px', marginBottom: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '10px', fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Status Filter</label>
                            <select
                                className="form-select"
                                value={filters.status}
                                onChange={e => handleFilterChange('status', e.target.value)}
                                style={{ width: '100%', background: 'var(--color-bg-primary)' }}
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

            <div className="admin-card">
                <div className="card-header" style={{ borderBottom: '1px solid var(--color-border)', padding: '20px' }}>
                    <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0, fontSize: '18px' }}>
                        <Mail size={20} color="var(--color-primary)" />
                        Queue History
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        <RefreshCw size={32} className="spinning" style={{ marginBottom: '16px' }} />
                        <p>Loading email records...</p>
                    </div>
                ) : emails.length === 0 ? (
                    <div className="empty-state" style={{ padding: '80px 20px' }}>
                        <Mail size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
                        <p style={{ fontSize: '18px', color: 'var(--color-text-muted)' }}>No emails found in the queue.</p>
                    </div>
                ) : (
                    <>
                        <div className="table-container" style={{ overflowX: 'auto' }}>
                            <table className="data-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                                <thead>
                                    <tr style={{ background: 'var(--color-bg-secondary)' }}>
                                        <th style={{ padding: '16px', textAlign: 'left', minWidth: '180px', color: 'var(--color-text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Recipient</th>
                                        <th style={{ padding: '16px', textAlign: 'left', minWidth: '250px', color: 'var(--color-text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Subject</th>
                                        <th style={{ padding: '16px', textAlign: 'left', minWidth: '130px', color: 'var(--color-text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Type</th>
                                        <th style={{ padding: '16px', textAlign: 'left', minWidth: '120px', color: 'var(--color-text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Status</th>
                                        <th style={{ padding: '16px', textAlign: 'left', minWidth: '100px', color: 'var(--color-text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Attempts</th>
                                        <th style={{ padding: '16px', textAlign: 'left', minWidth: '150px', color: 'var(--color-text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Created</th>
                                        <th style={{ padding: '16px', textAlign: 'right', minWidth: '100px', color: 'var(--color-text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {emails.map(email => (
                                        <tr key={email._id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.2s' }}>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--color-cyan-primary)' }}>{email.to}</div>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ maxWidth: '300px' }}>
                                                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{email.subject}</div>
                                                    {email.errorMessage && (
                                                        <div style={{ fontSize: '11px', color: 'var(--color-danger)', marginTop: '4px', lineBreak: 'anywhere' }}>
                                                            {email.errorMessage.length > 60 ? email.errorMessage.substring(0, 60) + '...' : email.errorMessage}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <span style={{
                                                    fontSize: '10px',
                                                    padding: '4px 10px',
                                                    background: 'var(--color-bg-secondary)',
                                                    color: 'var(--color-text-secondary)',
                                                    borderRadius: '4px',
                                                    textTransform: 'uppercase',
                                                    fontWeight: '700',
                                                    border: '1px solid var(--color-border)'
                                                }}>
                                                    {email.emailType || 'other'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span className={`status-badge ${email.status === 'sent' ? 'status-confirmed' :
                                                        email.status === 'failed' ? 'status-rejected' :
                                                            email.status === 'sending' ? 'status-processing' :
                                                                'status-pending'
                                                        }`} style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            padding: '4px 12px',
                                                            borderRadius: '20px',
                                                            fontSize: '11px',
                                                            fontWeight: '600',
                                                            textTransform: 'uppercase'
                                                        }}>
                                                        {getStatusIcon(email.status)}
                                                        {email.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <span style={{ fontWeight: 'bold', color: email.attempts >= email.maxAttempts ? 'var(--color-danger)' : 'var(--color-text-primary)' }}>
                                                        {email.attempts || 0}
                                                    </span>
                                                    <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>/ {email.maxAttempts || 3}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{formatDate(email.createdAt)}</div>
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                    <button
                                                        onClick={() => setSelectedEmail(email)}
                                                        className="icon-btn"
                                                        title="View Email Content"
                                                        style={{ background: 'var(--color-bg-secondary)', borderRadius: '6px' }}
                                                    >
                                                        <EyeIcon size={16} color="var(--color-text-secondary)" />
                                                    </button>
                                                    {email.status === 'failed' && (
                                                        <button
                                                            onClick={() => handleDelete(email._id)}
                                                            className="icon-btn danger"
                                                            title="Remove from queue"
                                                            style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div style={{ padding: '24px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="btn-secondary"
                                    style={{ padding: '8px 16px' }}
                                >
                                    Previous
                                </button>
                                <div style={{ display: 'flex', alignItems: 'center', padding: '0 20px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                                    Page <strong style={{ color: 'var(--color-text-primary)', margin: '0 4px' }}>{page}</strong> of {totalPages}
                                </div>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="btn-secondary"
                                    style={{ padding: '8px 16px' }}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Email View Modal */}
            {selectedEmail && (
                <div className="modal-overlay" onClick={() => setSelectedEmail(null)}>
                    <div className="modal-content" style={{ maxWidth: '800px', width: '90%', height: '85vh' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h2 className="modal-title">Email Preview</h2>
                                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                                    Sent to: <span style={{ color: 'var(--color-cyan-primary)' }}>{selectedEmail.to}</span>
                                </p>
                            </div>
                            <button onClick={() => setSelectedEmail(null)} className="modal-close">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="modal-body" style={{ background: '#f5f5f5', flex: 1, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ padding: '12px 20px', background: 'white', borderBottom: '1px solid #eee' }}>
                                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Subject: {selectedEmail.subject}</div>
                            </div>
                            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#f5f5f5' }}>
                                <iframe
                                    title="Email Preview"
                                    srcDoc={`
                                        <!DOCTYPE html>
                                        <html>
                                            <head>
                                                <style>
                                                    body { 
                                                        margin: 0; 
                                                        padding: 20px; 
                                                        background: white; 
                                                        font-family: Arial, sans-serif; 
                                                        color: #333;
                                                    }
                                                    h1, h2, h3, h4 { margin-top: 0; }
                                                </style>
                                            </head>
                                            <body>
                                                ${selectedEmail.html}
                                            </body>
                                        </html>
                                    `}
                                    style={{
                                        width: '100%',
                                        maxWidth: '600px',
                                        height: '100%',
                                        minHeight: '500px',
                                        margin: '0 auto',
                                        display: 'block',
                                        border: 'none',
                                        backgroundColor: 'white',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        borderRadius: '8px'
                                    }}
                                />
                            </div>
                        </div>
                        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', background: 'var(--color-bg-card)' }}>
                            <button onClick={() => setSelectedEmail(null)} className="btn-secondary">Close Preview</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmailQueue;
