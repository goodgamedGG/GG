import React, { useState, useEffect } from 'react';
import { FileText, Filter, Eye, Calendar, User, Activity, X } from 'lucide-react';
import adminAPI from '../../api/admin';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        user: '',
        action: '',
        resource: '',
        startDate: '',
        endDate: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);

    useEffect(() => {
        loadLogs();
    }, [page, filters]);

    const loadLogs = async () => {
        try {
            setLoading(true);
            const params = { page, limit: 50, ...filters };
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null) delete params[key];
            });
            const result = await adminAPI.getAuditLogs(params);
            setLogs(result?.data?.auditLogs || result?.auditLogs || []);
            setTotalPages(result?.data?.pagination?.totalPages || result?.pagination?.totalPages || 1);
        } catch (error) {
            console.error('Failed to load audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters({ ...filters, [key]: value });
        setPage(1);
    };

    const clearFilters = () => {
        setFilters({
            user: '',
            action: '',
            resource: '',
            startDate: '',
            endDate: ''
        });
        setPage(1);
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const getActionColor = (action) => {
        const colors = {
            create: '#00ff80',
            update: '#ffc800',
            delete: '#ff6464',
            read: 'var(--color-cyan-primary)'
        };
        return colors[action?.toLowerCase()] || 'var(--color-text-muted)';
    };

    return (
        <div>
            <header className="admin-header">
                <div>
                    <h1 className="page-title">Audit Logs</h1>
                    <p style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        View all admin actions and changes
                    </p>
                </div>
                <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary">
                    <Filter size={18} />
                    Filters
                </button>
            </header>

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
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Action</label>
                            <select
                                className="form-select"
                                value={filters.action}
                                onChange={e => handleFilterChange('action', e.target.value)}
                            >
                                <option value="">All Actions</option>
                                <option value="create">Create</option>
                                <option value="update">Update</option>
                                <option value="delete">Delete</option>
                                <option value="read">Read</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Resource</label>
                            <select
                                className="form-select"
                                value={filters.resource}
                                onChange={e => handleFilterChange('resource', e.target.value)}
                            >
                                <option value="">All Resources</option>
                                <option value="product">Product</option>
                                <option value="order">Order</option>
                                <option value="user">User</option>
                                <option value="category">Category</option>
                                <option value="promoCode">Promo Code</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Start Date</label>
                            <input
                                type="date"
                                className="form-input"
                                value={filters.startDate}
                                onChange={e => handleFilterChange('startDate', e.target.value)}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>End Date</label>
                            <input
                                type="date"
                                className="form-input"
                                value={filters.endDate}
                                onChange={e => handleFilterChange('endDate', e.target.value)}
                            />
                        </div>
                    </div>
                    <button onClick={clearFilters} className="btn-secondary" style={{ marginTop: '16px' }}>
                        Clear Filters
                    </button>
                </div>
            )}

            {loading ? (
                <div className="empty-state">Loading audit logs...</div>
            ) : logs.length === 0 ? (
                <div className="empty-state">
                    <FileText size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                    <p>No audit logs found.</p>
                </div>
            ) : (
                <>
                    <div className="table-container" style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>User</th>
                                    <th>Action</th>
                                    <th>Resource</th>
                                    <th>Resource ID</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map(log => (
                                    <tr key={log._id}>
                                        <td style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                            {formatDate(log.createdAt)}
                                        </td>
                                        <td>
                                            <div>
                                                <div style={{ fontWeight: 500 }}>{log.user?.name || '-'}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                                                    {log.ipAddress || '-'}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{
                                                padding: '4px 10px',
                                                background: `rgba(${getActionColor(log.action)}, 0.1)`,
                                                color: getActionColor(log.action),
                                                borderRadius: '12px',
                                                fontSize: '11px',
                                                fontWeight: 'bold',
                                                textTransform: 'uppercase'
                                            }}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td style={{ textTransform: 'capitalize' }}>{log.resource || '-'}</td>
                                        <td>
                                            <code style={{ 
                                                fontSize: '11px', 
                                                color: 'var(--color-cyan-primary)',
                                                fontFamily: 'monospace'
                                            }}>
                                                {log.resourceId ? log.resourceId.toString().substring(0, 8) + '...' : '-'}
                                            </code>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${
                                                log.status === 'success' ? 'status-confirmed' :
                                                log.status === 'error' ? 'status-rejected' :
                                                'status-pending'
                                            }`}>
                                                {log.status || 'success'}
                                            </span>
                                        </td>
                                        <td>
                                            <button 
                                                onClick={() => setSelectedLog(log)} 
                                                className="icon-btn"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>
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

            {/* Log Details Modal */}
            {selectedLog && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">Audit Log Details</h2>
                            <button onClick={() => setSelectedLog(null)} className="modal-close">
                                <X size={24} />
                            </button>
                        </div>
                        <div style={{ padding: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                                <div>
                                    <h4 style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginBottom: '8px' }}>USER</h4>
                                    <div style={{ fontWeight: 500 }}>{selectedLog.user?.name || '-'}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                        {selectedLog.user?.email || '-'}
                                    </div>
                                </div>
                                <div>
                                    <h4 style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginBottom: '8px' }}>ACTION</h4>
                                    <span style={{
                                        padding: '4px 10px',
                                        background: `rgba(${getActionColor(selectedLog.action)}, 0.1)`,
                                        color: getActionColor(selectedLog.action),
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        textTransform: 'uppercase'
                                    }}>
                                        {selectedLog.action}
                                    </span>
                                </div>
                                <div>
                                    <h4 style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginBottom: '8px' }}>RESOURCE</h4>
                                    <div style={{ textTransform: 'capitalize', fontWeight: 500 }}>
                                        {selectedLog.resource || '-'}
                                    </div>
                                </div>
                                <div>
                                    <h4 style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginBottom: '8px' }}>STATUS</h4>
                                    <span className={`status-badge ${
                                        selectedLog.status === 'success' ? 'status-confirmed' :
                                        selectedLog.status === 'error' ? 'status-rejected' :
                                        'status-pending'
                                    }`}>
                                        {selectedLog.status || 'success'}
                                    </span>
                                </div>
                                <div>
                                    <h4 style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginBottom: '8px' }}>IP ADDRESS</h4>
                                    <code style={{ fontFamily: 'monospace', fontSize: '13px' }}>
                                        {selectedLog.ipAddress || '-'}
                                    </code>
                                </div>
                                <div>
                                    <h4 style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginBottom: '8px' }}>DATE</h4>
                                    <div style={{ fontSize: '13px' }}>{formatDate(selectedLog.createdAt)}</div>
                                </div>
                            </div>

                            {selectedLog.method && selectedLog.endpoint && (
                                <div style={{ marginBottom: '24px', padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                    <h4 style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginBottom: '8px' }}>ENDPOINT</h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{
                                            padding: '2px 8px',
                                            background: 'var(--color-bg-card)',
                                            borderRadius: '4px',
                                            fontSize: '11px',
                                            fontWeight: 'bold',
                                            fontFamily: 'monospace'
                                        }}>
                                            {selectedLog.method}
                                        </span>
                                        <code style={{ fontFamily: 'monospace', fontSize: '13px' }}>
                                            {selectedLog.endpoint}
                                        </code>
                                    </div>
                                </div>
                            )}

                            {selectedLog.changes && Object.keys(selectedLog.changes).length > 0 && (
                                <div style={{ marginBottom: '24px' }}>
                                    <h4 style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginBottom: '12px' }}>CHANGES</h4>
                                    <div style={{ 
                                        background: 'var(--color-bg-secondary)', 
                                        borderRadius: '8px', 
                                        padding: '16px',
                                        fontFamily: 'monospace',
                                        fontSize: '12px',
                                        overflowX: 'auto'
                                    }}>
                                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                            {JSON.stringify(selectedLog.changes, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            )}

                            {selectedLog.errorMessage && (
                                <div style={{ marginBottom: '24px', padding: '12px', background: 'rgba(255, 100, 100, 0.1)', borderRadius: '8px', border: '1px solid rgba(255, 100, 100, 0.3)' }}>
                                    <h4 style={{ color: '#ff6464', fontSize: '12px', marginBottom: '8px' }}>ERROR MESSAGE</h4>
                                    <p style={{ fontSize: '13px', color: '#ff6464' }}>{selectedLog.errorMessage}</p>
                                </div>
                            )}

                            {selectedLog.userAgent && (
                                <div style={{ marginBottom: '24px' }}>
                                    <h4 style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginBottom: '8px' }}>USER AGENT</h4>
                                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                                        {selectedLog.userAgent}
                                    </p>
                                </div>
                            )}
                        </div>
                        <div style={{ padding: '20px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end' }}>
                            <button onClick={() => setSelectedLog(null)} className="btn-secondary">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditLogs;
