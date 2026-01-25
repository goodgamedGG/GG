import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, ShoppingCart, Users, Calendar } from 'lucide-react';
import adminAPI from '../../api/admin';

const Analytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState(30);

    useEffect(() => {
        loadAnalytics();
    }, [period]);

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            const result = await adminAPI.getAnalytics(period);
            setAnalytics(result?.data);
        } catch (error) {
            console.error('Failed to load analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const SimpleBarChart = ({ data, labelKey, valueKey, color = 'var(--color-cyan-primary)' }) => {
        if (!data || data.length === 0) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No data</div>;
        
        const maxValue = Math.max(...data.map(d => d[valueKey] || 0));
        const maxHeight = 200;

        return (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: maxHeight + 40, padding: '20px' }}>
                {data.map((item, idx) => {
                    const height = maxValue > 0 ? (item[valueKey] / maxValue) * maxHeight : 0;
                    return (
                        <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ 
                                width: '100%', 
                                background: color, 
                                height: `${height}px`, 
                                borderRadius: '4px 4px 0 0',
                                minHeight: height > 0 ? '4px' : '0',
                                transition: 'height 0.3s'
                            }} />
                            <div style={{ 
                                marginTop: '8px', 
                                fontSize: '10px', 
                                color: 'var(--color-text-muted)',
                                textAlign: 'center',
                                transform: 'rotate(-45deg)',
                                transformOrigin: 'center',
                                whiteSpace: 'nowrap'
                            }}>
                                {item[labelKey]?.substring(5) || item[labelKey]}
                            </div>
                            <div style={{ fontSize: '11px', fontWeight: 'bold', marginTop: '4px' }}>
                                {typeof item[valueKey] === 'number' && item[valueKey] > 1000 
                                    ? (item[valueKey] / 1000).toFixed(1) + 'k'
                                    : item[valueKey]?.toFixed(0) || 0
                                }
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div>
            <header className="admin-header">
                <div>
                    <h1 className="page-title">Analytics</h1>
                    <p style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        Sales and performance analytics
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <label style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Period:</label>
                    <select
                        className="form-select"
                        value={period}
                        onChange={e => setPeriod(parseInt(e.target.value))}
                        style={{ minWidth: '120px' }}
                    >
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 90 days</option>
                        <option value="365">Last year</option>
                    </select>
                </div>
            </header>

            {loading ? (
                <div className="empty-state">Loading analytics...</div>
            ) : !analytics ? (
                <div className="empty-state">
                    <BarChart3 size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                    <p>No analytics data available.</p>
                </div>
            ) : (
                <>
                    {/* Sales Data Chart */}
                    {analytics.salesData && analytics.salesData.length > 0 && (
                        <div style={{ 
                            background: 'var(--color-bg-card)', 
                            border: '1px solid var(--color-border)', 
                            borderRadius: 'var(--radius-md)', 
                            marginBottom: '20px',
                            overflow: 'hidden'
                        }}>
                            <div style={{ padding: '20px', borderBottom: '1px solid var(--color-border)' }}>
                                <h3 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <DollarSign size={20} style={{ color: 'var(--color-cyan-primary)' }} />
                                    Sales Revenue ({period} days)
                                </h3>
                            </div>
                            <SimpleBarChart 
                                data={analytics.salesData} 
                                labelKey="_id" 
                                valueKey="revenue" 
                                color="var(--color-cyan-primary)"
                            />
                        </div>
                    )}

                    {/* Product Performance */}
                    {analytics.productPerformance && analytics.productPerformance.length > 0 && (
                        <div style={{ 
                            background: 'var(--color-bg-card)', 
                            border: '1px solid var(--color-border)', 
                            borderRadius: 'var(--radius-md)', 
                            marginBottom: '20px',
                            overflow: 'hidden'
                        }}>
                            <div style={{ padding: '20px', borderBottom: '1px solid var(--color-border)' }}>
                                <h3 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <TrendingUp size={20} style={{ color: '#00ff80' }} />
                                    Top Products Performance
                                </h3>
                            </div>
                            <div style={{ padding: '20px' }}>
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Units Sold</th>
                                            <th>Revenue</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analytics.productPerformance.map((product, idx) => (
                                            <tr key={idx}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        {product.productImage && (
                                                            <img
                                                                src={product.productImage}
                                                                alt=""
                                                                style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }}
                                                            />
                                                        )}
                                                        <div style={{ fontWeight: 500 }}>{product.productName || '-'}</div>
                                                    </div>
                                                </td>
                                                <td style={{ fontWeight: 'bold' }}>{product.totalSold || 0}</td>
                                                <td style={{ color: 'var(--color-cyan-primary)', fontWeight: 'bold' }}>
                                                    {formatCurrency(product.revenue || 0)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* User Growth Chart */}
                    {analytics.userGrowth && analytics.userGrowth.length > 0 && (
                        <div style={{ 
                            background: 'var(--color-bg-card)', 
                            border: '1px solid var(--color-border)', 
                            borderRadius: 'var(--radius-md)', 
                            marginBottom: '20px',
                            overflow: 'hidden'
                        }}>
                            <div style={{ padding: '20px', borderBottom: '1px solid var(--color-border)' }}>
                                <h3 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Users size={20} style={{ color: '#00ff80' }} />
                                    User Growth ({period} days)
                                </h3>
                            </div>
                            <SimpleBarChart 
                                data={analytics.userGrowth} 
                                labelKey="_id" 
                                valueKey="count" 
                                color="#00ff80"
                            />
                        </div>
                    )}

                    {/* Category Performance */}
                    {analytics.categoryPerformance && analytics.categoryPerformance.length > 0 && (
                        <div style={{ 
                            background: 'var(--color-bg-card)', 
                            border: '1px solid var(--color-border)', 
                            borderRadius: 'var(--radius-md)', 
                            marginBottom: '20px',
                            overflow: 'hidden'
                        }}>
                            <div style={{ padding: '20px', borderBottom: '1px solid var(--color-border)' }}>
                                <h3 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <BarChart3 size={20} style={{ color: '#ffc800' }} />
                                    Category Performance
                                </h3>
                            </div>
                            <div style={{ padding: '20px' }}>
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Category</th>
                                            <th>Revenue</th>
                                            <th>Orders</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analytics.categoryPerformance.map((category, idx) => (
                                            <tr key={idx}>
                                                <td style={{ fontWeight: 500 }}>{category.categoryName || '-'}</td>
                                                <td style={{ color: 'var(--color-cyan-primary)', fontWeight: 'bold' }}>
                                                    {formatCurrency(category.revenue || 0)}
                                                </td>
                                                <td>{category.orders || 0}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Summary Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        {analytics.salesData && (
                            <div style={{ padding: '16px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Total Revenue</div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-cyan-primary)' }}>
                                    {formatCurrency(analytics.salesData.reduce((sum, d) => sum + (d.revenue || 0), 0))}
                                </div>
                            </div>
                        )}
                        {analytics.salesData && (
                            <div style={{ padding: '16px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Total Orders</div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                                    {analytics.salesData.reduce((sum, d) => sum + (d.orders || 0), 0)}
                                </div>
                            </div>
                        )}
                        {analytics.userGrowth && (
                            <div style={{ padding: '16px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>New Users</div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#00ff80' }}>
                                    {analytics.userGrowth.reduce((sum, d) => sum + (d.count || 0), 0)}
                                </div>
                            </div>
                        )}
                        {analytics.productPerformance && (
                            <div style={{ padding: '16px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Top Products</div>
                                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                                    {analytics.productPerformance.length}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Analytics;
