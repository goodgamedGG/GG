import React, { useState } from 'react';
import { useGames } from '../../context/GameContext';
import { useAuth } from '../../context/AuthContext';
import { Users, Gamepad2, TrendingUp, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div style={{
        background: 'var(--color-bg-card)',
        padding: '24px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
    }}>
        <div style={{
            background: `rgba(${color}, 0.1)`,
            padding: '12px',
            borderRadius: '12px',
            color: `rgb(${color})`
        }}>
            <Icon size={24} />
        </div>
        <div>
            <div style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>{title}</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{value}</div>
        </div>
    </div>
);

const Dashboard = () => {
    const { games } = useGames();
    const { user } = useAuth();

    // Simulate some stats
    const totalUsers = 1245;
    const totalRevenue = '$24,500';

    return (
        <div>
            <header className="admin-header">
                <div>
                    <h1 className="page-title">Dashboard Overview</h1>
                    <p style={{ color: 'var(--color-text-muted)', marginTop: '8px' }}>
                        Welcome back, {user?.name}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Link to="/admin/games" className="btn-primary">
                        + Add New Game
                    </Link>
                </div>
            </header>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '24px',
                marginBottom: '40px'
            }}>
                <StatCard
                    title="Total Games"
                    value={games.length}
                    icon={Gamepad2}
                    color="0, 217, 255"
                />
                <StatCard
                    title="Active Users"
                    value={totalUsers}
                    icon={Users}
                    color="0, 255, 128"
                />
                <StatCard
                    title="Total Revenue"
                    value={totalRevenue}
                    icon={DollarSign}
                    color="255, 200, 0"
                />
                <StatCard
                    title="Growth"
                    value="+12.5%"
                    icon={TrendingUp}
                    color="255, 50, 100"
                />
            </div>

            <div style={{ background: 'var(--color-bg-card)', borderRadius: 'var(--radius-md)', padding: '24px', border: '1px solid var(--color-border)' }}>
                <h3 style={{ marginBottom: '20px', fontFamily: 'Orbitron, sans-serif' }}>Recent Activity</h3>
                <div style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '40px 0' }}>
                    No recent activity to show.
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
