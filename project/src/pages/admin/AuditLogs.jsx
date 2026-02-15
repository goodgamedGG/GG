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
            read: '#00d2ff',
            list: '#00d2ff',
            view: '#00d2ff',
            confirm: '#00ff80',
            reject: '#ff6464',
            reorder: '#a855f7',
            retry: '#00a3ff'
        };
        return colors[action?.toLowerCase()] || '#888';
    };

    const renderChanges = (changes) => {
        if (!changes) return <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>No direct data changes captured.</p>;

        const renderValue = (val) => {
            if (val === null || val === undefined) return 'N/A';
            if (typeof val === 'boolean') return val ? 'Yes' : 'No';
            if (typeof val === 'object') return JSON.stringify(val);
            return val.toString();
        };

        // If it's a create, show created fields
        if (changes.created) {
            return (
                <div className="changes-grid">
                    <div style={{ marginBottom: '12px', color: '#00ff80', fontWeight: 'bold', fontSize: '13px' }}>Resource Created with:</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                        <tbody>
                            {Object.entries(changes.created).map(([key, value]) => (
                                <tr key={key} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '8px 0', color: 'var(--color-text-muted)', width: '30%' }}>{key}</td>
                                    <td style={{ padding: '8px 0', color: '#fff' }}>{renderValue(value)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        // If it's an update, show fields updated
        if (changes.body || changes.updatedFields) {
            const fields = changes.updatedFields || Object.keys(changes.body || {});
            return (
                <div className="changes-grid">
                    <div style={{ marginBottom: '12px', color: '#ffc800', fontWeight: 'bold', fontSize: '13px' }}>Modified Fields:</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                        <tbody>
                            {fields.map(field => (
                                <tr key={field} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '8px 0', color: 'var(--color-text-muted)', width: '30%' }}>{field}</td>
                                    <td style={{ padding: '8px 0', color: '#fff' }}>
                                        {changes.body ? renderValue(changes.body[field]) : 'Updated'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        return <pre style={{ fontSize: '12px', color: '#888' }}>{JSON.stringify(changes, null, 2)}</pre>;
    };

    const displayIP = (ip) => {
        if (!ip) return '-';
        if (ip === '::1' || ip === '127.0.0.1' || ip.includes('::ffff:127.0.0.1')) return 'Localhost';
        return ip.replace('::ffff:', '');
    };

    return (
        <div>
            <header className="admin-header">
                <div>
                    <h1 className="page-title">Audit Logs</h1>
                    <p style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        Track all administrative actions, users, and IP addresses
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
                                <option value="list">List</option>
                                <option value="view">View</option>
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
                                <option value="promo_code">Promo Code</option>
                                <option value="payment">Payment</option>
                                <option value="settings">Settings</option>
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
                                    <th>Admin User</th>
                                    <th>Action</th>
                                    <th>Resource</th>
                                    <th>IP Address</th>
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
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: '50%',
                                                    background: 'var(--color-bg-secondary)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '10px',
                                                    fontWeight: 'bold',
                                                    color: 'var(--color-cyan-primary)'
                                                }}>
                                                    {log.user?.name?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{log.user?.name || 'Unknown User'}</div>
                                                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                                                        {log.user?.email || '-'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{
                                                padding: '4px 10px',
                                                background: `${getActionColor(log.action)}20`,
                                                color: getActionColor(log.action),
                                                borderRadius: '12px',
                                                fontSize: '11px',
                                                fontWeight: 'bold',
                                                textTransform: 'uppercase'
                                            }}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td style={{ textTransform: 'capitalize' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span>{log.resource || '-'}</span>
                                                <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                                                    {log.resourceId ? '#' + log.resourceId.toString().substring(0, 8) : '-'}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <code style={{ fontSize: '12px', opacity: 0.8 }}>{displayIP(log.ipAddress)}</code>
                                                {log.location && log.location.city !== 'Localhost' && (
                                                    <span style={{ fontSize: '10px', color: 'var(--color-cyan-primary)' }}>
                                                        {log.location.city}, {log.location.countryCode}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${log.status === 'success' ? 'status-confirmed' :
                                                log.status === 'failure' ? 'status-rejected' :
                                                    'status-pending'
                                                }`}>
                                                {log.status === 'failure' ? 'Error' : 'Success'}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => setSelectedLog(log)}
                                                className="btn-secondary"
                                                style={{ padding: '6px' }}
                                                title="View Details"
                                            >
                                                <Eye size={16} />
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
                    <div className="modal-content" style={{ maxWidth: '800px', maxHeight: '90vh' }}>
                        <div className="modal-header">
                            <div>
                                <h2 className="modal-title">Activity Details</h2>
                                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Log ID: {selectedLog._id}</p>
                            </div>
                            <button onClick={() => setSelectedLog(null)} className="modal-close">
                                <X size={24} />
                            </button>
                        </div>
                        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
                                <div style={{ background: 'var(--color-bg-secondary)', padding: '16px', borderRadius: '12px' }}>
                                    <h4 style={{ color: 'var(--color-text-muted)', fontSize: '11px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        <User size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> PERFORMED BY
                                    </h4>
                                    <div style={{ fontWeight: 600, fontSize: '15px' }}>{selectedLog.user?.name || 'Unknown'}</div>
                                    <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                                        {selectedLog.user?.email || '-'}
                                    </div>
                                    <div style={{
                                        marginTop: '12px',
                                        fontSize: '11px',
                                        padding: '4px 8px',
                                        background: 'rgba(0, 210, 255, 0.1)',
                                        color: '#00d2ff',
                                        borderRadius: '4px',
                                        display: 'inline-block'
                                    }}>
                                        Role: {selectedLog.user?.role || 'admin'}
                                    </div>
                                </div>

                                <div style={{ background: 'var(--color-bg-secondary)', padding: '16px', borderRadius: '12px' }}>
                                    <h4 style={{ color: 'var(--color-text-muted)', fontSize: '11px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        <Activity size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> ACTION & RESOURCE
                                    </h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            background: `${getActionColor(selectedLog.action)}20`,
                                            color: getActionColor(selectedLog.action),
                                            borderRadius: '8px',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            textTransform: 'uppercase'
                                        }}>
                                            {selectedLog.action}
                                        </span>
                                        <span style={{ fontWeight: 600, fontSize: '15px', textTransform: 'capitalize' }}>
                                            {selectedLog.resource}
                                        </span>
                                    </div>
                                    <div style={{ marginTop: '12px', fontSize: '12px' }}>
                                        <span style={{ color: 'var(--color-text-muted)' }}>Target ID:</span>
                                        <code style={{ marginLeft: '8px', color: 'var(--color-cyan-primary)' }}>
                                            {selectedLog.resourceId || 'N/A'}
                                        </code>
                                    </div>
                                </div>

                                <div style={{ background: 'var(--color-bg-secondary)', padding: '16px', borderRadius: '12px' }}>
                                    <h4 style={{ color: 'var(--color-text-muted)', fontSize: '11px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        <Calendar size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> TIME & LOCATION
                                    </h4>
                                    <div style={{ fontSize: '14px', fontWeight: 500 }}>{formatDate(selectedLog.createdAt)}</div>
                                    <div style={{ marginTop: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>IP:</span>
                                            <code style={{ fontSize: '13px' }}>{displayIP(selectedLog.ipAddress)}</code>
                                            {selectedLog.ipAddress && selectedLog.ipAddress !== '::1' && (
                                                <a
                                                    href={`https://www.google.com/maps/search/?api=1&query=${selectedLog.location?.lat},${selectedLog.location?.lon}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ fontSize: '10px', color: 'var(--color-cyan-primary)', textDecoration: 'underline' }}
                                                >
                                                    View on Map
                                                </a>
                                            )}
                                        </div>
                                        {selectedLog.location && selectedLog.location.city !== 'Localhost' && (
                                            <div style={{ fontSize: '12px', color: 'var(--color-cyan-primary)', marginTop: '4px', fontWeight: 500 }}>
                                                📍 {selectedLog.location.city}, {selectedLog.location.country}
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                            <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>Status:</span>
                                            <span style={{
                                                fontSize: '11px',
                                                color: selectedLog.status === 'success' ? '#00ff80' : '#ff6464',
                                                fontWeight: 'bold'
                                            }}>
                                                {selectedLog.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Map Visualization */}
                            {selectedLog.location && selectedLog.location.lat && (
                                <div style={{ marginBottom: '24px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-border)', height: '200px' }}>
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        frameBorder="0"
                                        scrolling="no"
                                        marginHeight="0"
                                        marginWidth="0"
                                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedLog.location.lon - 0.1},${selectedLog.location.lat - 0.1},${selectedLog.location.lon + 0.1},${selectedLog.location.lat + 0.1}&layer=mapnik&marker=${selectedLog.location.lat},${selectedLog.location.lon}`}
                                        style={{ border: 0 }}
                                    ></iframe>
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                                {selectedLog.method && selectedLog.endpoint && (
                                    <div style={{ padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '12px' }}>
                                        <h4 style={{ color: 'var(--color-text-muted)', fontSize: '11px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                            Technical Endpoint
                                        </h4>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{
                                                padding: '4px 12px',
                                                background: 'var(--color-bg-card)',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                fontFamily: 'monospace',
                                                color: 'var(--color-cyan-primary)'
                                            }}>
                                                {selectedLog.method}
                                            </span>
                                            <code style={{ fontFamily: 'monospace', fontSize: '13px', opacity: 0.9 }}>
                                                {selectedLog.endpoint}
                                            </code>
                                        </div>
                                    </div>
                                )}

                                {selectedLog.changes && (
                                    <div style={{ padding: '20px', background: 'var(--color-bg-secondary)', borderRadius: '12px' }}>
                                        <h4 style={{ color: 'var(--color-text-muted)', fontSize: '11px', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                            Business Data Changes (Simplified)
                                        </h4>
                                        <div style={{
                                            background: 'var(--color-bg-card)',
                                            borderRadius: '8px',
                                            padding: '20px',
                                            border: '1px solid var(--color-border)'
                                        }}>
                                            {renderChanges(selectedLog.changes)}
                                        </div>

                                        <details style={{ marginTop: '20px' }}>
                                            <summary style={{ fontSize: '12px', cursor: 'pointer', color: 'var(--color-text-muted)' }}>Show Raw JSON Payload (Technical)</summary>
                                            <div style={{
                                                background: '#0a0a0c',
                                                borderRadius: '8px',
                                                padding: '16px',
                                                fontFamily: 'monospace',
                                                fontSize: '11px',
                                                marginTop: '12px',
                                                overflowX: 'auto',
                                                border: '1px solid #333'
                                            }}>
                                                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', color: '#00ff80' }}>
                                                    {JSON.stringify(selectedLog.changes, null, 2)}
                                                </pre>
                                            </div>
                                        </details>
                                    </div>
                                )}

                                {selectedLog.errorMessage && (
                                    <div style={{ padding: '16px', background: 'rgba(255, 100, 100, 0.05)', borderRadius: '12px', border: '1px solid rgba(255, 100, 100, 0.2)' }}>
                                        <h4 style={{ color: '#ff6464', fontSize: '11px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                            Error Details
                                        </h4>
                                        <p style={{ fontSize: '13px', color: '#ff6464', fontFamily: 'monospace' }}>{selectedLog.errorMessage}</p>
                                    </div>
                                )}

                                {selectedLog.userAgent && (
                                    <div style={{ padding: '16px', opacity: 0.7 }}>
                                        <h4 style={{ color: 'var(--color-text-muted)', fontSize: '11px', marginBottom: '8px', textTransform: 'uppercase' }}>
                                            Browser User Agent
                                        </h4>
                                        <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'monospace', lineHeight: '1.4' }}>
                                            {selectedLog.userAgent}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div style={{ padding: '20px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', background: 'var(--color-bg-card)' }}>
                            <button onClick={() => setSelectedLog(null)} className="btn-secondary">
                                Close Details
                            </button>
                        </div>
                    </div>
                </div >
            )}
        </div >
    );
};

export default AuditLogs;
