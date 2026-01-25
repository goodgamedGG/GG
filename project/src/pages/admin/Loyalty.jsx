import React, { useState, useEffect } from 'react';
import { Award, Plus, Minus, TrendingUp, Filter, Trophy, X, Save } from 'lucide-react';
import adminAPI from '../../api/admin';

const Loyalty = () => {
    const [loyaltyPoints, setLoyaltyPoints] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        tier: '',
        minPoints: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [adjustFormData, setAdjustFormData] = useState({
        points: '',
        reason: ''
    });

    useEffect(() => {
        loadLoyaltyPoints();
        loadLeaderboard();
    }, [page, filters]);

    const loadLoyaltyPoints = async () => {
        try {
            setLoading(true);
            const result = await adminAPI.getLoyaltyPoints(page, 50, filters.tier, filters.minPoints);
            setLoyaltyPoints(result?.data?.loyaltyPoints || []);
            setTotalPages(result?.data?.pagination?.totalPages || 1);
        } catch (error) {
            console.error('Failed to load loyalty points:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadLeaderboard = async () => {
        try {
            const result = await adminAPI.getLeaderboard(10);
            setLeaderboard(result?.data?.leaderboard || []);
        } catch (error) {
            console.error('Failed to load leaderboard:', error);
        }
    };

    const handleAdjust = (user) => {
        setSelectedUser(user);
        setAdjustFormData({ points: '', reason: '' });
        setIsAdjustModalOpen(true);
    };

    const handleAdjustSubmit = async (e) => {
        e.preventDefault();
        if (!selectedUser) return;

        try {
            await adminAPI.adjustLoyaltyPoints(selectedUser.user?._id || selectedUser.user, parseFloat(adjustFormData.points), adjustFormData.reason);
            setIsAdjustModalOpen(false);
            setSelectedUser(null);
            loadLoyaltyPoints();
            loadLeaderboard();
        } catch (error) {
            alert('Failed to adjust points: ' + error.message);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters({ ...filters, [key]: value });
        setPage(1);
    };

    const getTierColor = (tier) => {
        const colors = {
            bronze: '#cd7f32',
            silver: '#c0c0c0',
            gold: '#ffd700',
            platinum: '#e5e4e2'
        };
        return colors[tier] || '#999';
    };

    const getTierName = (tier) => {
        return tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : 'Bronze';
    };

    return (
        <div>
            <header className="admin-header">
                <div>
                    <h1 className="page-title">Loyalty Points</h1>
                    <p style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        Manage customer loyalty points
                    </p>
                </div>
                <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary">
                    <Filter size={18} />
                    Filters
                </button>
            </header>

            {/* Leaderboard */}
            {leaderboard.length > 0 && (
                <div style={{ marginBottom: '30px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
                    <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Trophy size={20} style={{ color: '#ffc800' }} />
                        Top Customers Leaderboard
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                        {leaderboard.slice(0, 5).map((entry, index) => (
                            <div key={entry._id || index} style={{
                                padding: '12px',
                                background: 'var(--color-bg-secondary)',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: index === 0 ? '#ffc800' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : 'var(--color-bg-card)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: index < 3 ? '#000' : 'var(--color-text-muted)',
                                    fontWeight: 'bold',
                                    fontSize: '14px'
                                }}>
                                    {index + 1}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 500, fontSize: '14px' }}>{entry.user?.name || '-'}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                        {entry.points || 0} pts • {getTierName(entry.tier)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
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
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Tier</label>
                            <select
                                className="form-select"
                                value={filters.tier}
                                onChange={e => handleFilterChange('tier', e.target.value)}
                            >
                                <option value="">All Tiers</option>
                                <option value="bronze">Bronze</option>
                                <option value="silver">Silver</option>
                                <option value="gold">Gold</option>
                                <option value="platinum">Platinum</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Min Points</label>
                            <input
                                type="number"
                                className="form-input"
                                value={filters.minPoints}
                                onChange={e => handleFilterChange('minPoints', e.target.value)}
                                placeholder="0"
                            />
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="empty-state">Loading loyalty points...</div>
            ) : loyaltyPoints.length === 0 ? (
                <div className="empty-state">
                    <Award size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                    <p>No loyalty points data found.</p>
                </div>
            ) : (
                <>
                    <div className="table-container" style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Current Points</th>
                                    <th>Total Earned</th>
                                    <th>Total Spent</th>
                                    <th>Tier</th>
                                    <th>Transactions</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loyaltyPoints.map(loyalty => (
                                    <tr key={loyalty._id}>
                                        <td>
                                            <div>
                                                <div style={{ fontWeight: 500 }}>{loyalty.user?.name || '-'}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                                    {loyalty.user?.email || '-'}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-cyan-primary)' }}>
                                                {loyalty.points || 0}
                                            </span>
                                        </td>
                                        <td style={{ color: '#00ff80' }}>
                                            {loyalty.totalEarned || 0}
                                        </td>
                                        <td style={{ color: 'var(--color-text-muted)' }}>
                                            {loyalty.totalSpent || 0}
                                        </td>
                                        <td>
                                            <span style={{
                                                padding: '4px 12px',
                                                background: `rgba(${getTierColor(loyalty.tier)}, 0.2)`,
                                                color: getTierColor(loyalty.tier),
                                                borderRadius: '16px',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                textTransform: 'capitalize'
                                            }}>
                                                {getTierName(loyalty.tier)}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                                {loyalty.transactions?.length || 0} transactions
                                            </span>
                                        </td>
                                        <td>
                                            <button 
                                                onClick={() => handleAdjust(loyalty)} 
                                                className="icon-btn"
                                                title="Adjust Points"
                                            >
                                                <TrendingUp size={18} />
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

            {/* Adjust Points Modal */}
            {isAdjustModalOpen && selectedUser && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">Adjust Loyalty Points</h2>
                            <button onClick={() => { setIsAdjustModalOpen(false); setSelectedUser(null); }} className="modal-close">
                                <X size={24} />
                            </button>
                        </div>
                        <div style={{ padding: '20px' }}>
                            <div style={{ marginBottom: '20px', padding: '16px', background: 'var(--color-bg-secondary)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>User</div>
                                <div style={{ fontWeight: 500 }}>{selectedUser.user?.name || '-'}</div>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                    Current Points: <span style={{ fontWeight: 'bold', color: 'var(--color-cyan-primary)' }}>
                                        {selectedUser.points || 0}
                                    </span>
                                </div>
                            </div>
                            <form onSubmit={handleAdjustSubmit}>
                                <div className="form-group">
                                    <label className="form-label">Points Adjustment *</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            type="button"
                                            onClick={() => setAdjustFormData({ ...adjustFormData, points: '100' })}
                                            className="btn-secondary"
                                            style={{ flex: 1 }}
                                        >
                                            <Plus size={16} />
                                            +100
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setAdjustFormData({ ...adjustFormData, points: '500' })}
                                            className="btn-secondary"
                                            style={{ flex: 1 }}
                                        >
                                            <Plus size={16} />
                                            +500
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setAdjustFormData({ ...adjustFormData, points: '-100' })}
                                            className="btn-secondary"
                                            style={{ flex: 1 }}
                                        >
                                            <Minus size={16} />
                                            -100
                                        </button>
                                    </div>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={adjustFormData.points}
                                        onChange={e => setAdjustFormData({ ...adjustFormData, points: e.target.value })}
                                        placeholder="Enter points (positive to add, negative to deduct)"
                                        required
                                        style={{ marginTop: '12px' }}
                                    />
                                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                                        Positive number adds points, negative number deducts points
                                    </p>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Reason *</label>
                                    <textarea
                                        className="form-textarea"
                                        value={adjustFormData.reason}
                                        onChange={e => setAdjustFormData({ ...adjustFormData, reason: e.target.value })}
                                        placeholder="Reason for adjustment (e.g., Bonus for referral, Refund adjustment)"
                                        required
                                        rows={3}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                    <button 
                                        type="button" 
                                        onClick={() => { setIsAdjustModalOpen(false); setSelectedUser(null); }} 
                                        className="btn-secondary" 
                                        style={{ flex: 1 }}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                                        <Save size={18} />
                                        Adjust Points
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Loyalty;
