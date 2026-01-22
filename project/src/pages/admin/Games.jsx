import React, { useState } from 'react';
import { useGames } from '../../context/GameContext';
import { Pencil, Trash2, Plus, X, Save } from 'lucide-react';

const Games = () => {
    const { games, addGame, updateGame, deleteGame, loading } = useGames();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGame, setEditingGame] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        publisher: '',
        price: '',
        image: '/images/game_placeholder.png',
        category: ''
    });

    const handleEdit = (game) => {
        setEditingGame(game);
        setFormData(game);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingGame(null);
        setFormData({
            title: '',
            publisher: '',
            price: '',
            image: '/images/placeholder.png', // Default
            category: ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this game?')) {
            await deleteGame(id);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editingGame) {
            await updateGame(editingGame.id, formData);
        } else {
            await addGame(formData);
        }
        setIsModalOpen(false);
    };

    return (
        <div>
            <header className="admin-header">
                <div>
                    <h1 className="page-title">Manage Games</h1>
                    <p style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        {games.length} games in library
                    </p>
                </div>
                <button onClick={handleAdd} className="btn-primary">
                    <Plus size={18} />
                    Add Game
                </button>
            </header>

            {loading ? (
                <div>Loading games...</div>
            ) : (
                <div className="table-container" style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Game</th>
                                <th>Publisher</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {games.map(game => (
                                <tr key={game.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '40px', height: '60px', background: '#333', borderRadius: '4px', overflow: 'hidden' }}>
                                                <img
                                                    src={game.image}
                                                    alt=""
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    onError={(e) => e.target.style.display = 'none'}
                                                />
                                            </div>
                                            <span style={{ fontWeight: 600 }}>{game.title}</span>
                                        </div>
                                    </td>
                                    <td>{game.publisher}</td>
                                    <td style={{ color: 'var(--color-cyan-primary)', fontWeight: 'bold' }}>
                                        ${game.price}
                                    </td>
                                    <td>
                                        <span className="status-badge">Active</span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => handleEdit(game)}
                                                style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer' }}
                                                title="Edit"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(game.id)}
                                                style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer' }}
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{
                        background: 'var(--color-bg-card)', padding: '24px', borderRadius: 'var(--radius-lg)',
                        width: '100%', maxWidth: '500px', border: '1px solid var(--color-border)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '20px' }}>
                                {editingGame ? 'Edit Game' : 'Add New Game'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#aaa' }}>Title</label>
                                <input
                                    className="form-input"
                                    style={{ width: '100%' }}
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#aaa' }}>Publisher</label>
                                <input
                                    className="form-input"
                                    style={{ width: '100%' }}
                                    value={formData.publisher}
                                    onChange={e => setFormData({ ...formData, publisher: e.target.value })}
                                    required
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#aaa' }}>Price ($)</label>
                                    <input
                                        className="form-input"
                                        type="number"
                                        step="0.01"
                                        style={{ width: '100%' }}
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#aaa' }}>Image URL</label>
                                    <input
                                        className="form-input"
                                        style={{ width: '100%' }}
                                        value={formData.image}
                                        onChange={e => setFormData({ ...formData, image: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn-primary" style={{ marginTop: '10px', justifyContent: 'center' }}>
                                <Save size={18} />
                                {editingGame ? 'Save Changes' : 'Create Game'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Games;
