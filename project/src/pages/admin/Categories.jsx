import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, X, Save, Eye, EyeOff, FolderOpen, BarChart3, CheckSquare } from 'lucide-react';
import adminAPI from '../../api/admin';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [categoryStats, setCategoryStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [editingCategory, setEditingCategory] = useState(null);
    const [bulkUpdates, setBulkUpdates] = useState({
        isActive: ''
    });
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: null
    });

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            setLoading(true);
            const result = await adminAPI.getCategories();
            setCategories(result?.categories || []);
        } catch (error) {
            console.error('Failed to load categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadCategoryStats = async () => {
        try {
            const result = await adminAPI.getCategoryStats();
            setCategoryStats(result?.data);
            setIsStatsModalOpen(true);
        } catch (error) {
            alert('Failed to load statistics: ' + error.message);
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name || '',
            description: category.description || '',
            image: null
        });
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingCategory(null);
        setFormData({
            name: '',
            description: '',
            image: null
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category? Products in this category will be uncategorized.')) {
            try {
                await adminAPI.deleteCategory(id);
                loadCategories();
            } catch (error) {
                alert('Failed to delete category: ' + error.message);
            }
        }
    };

    const handleBulkUpdate = async () => {
        if (selectedCategories.length === 0) {
            alert('Please select categories to update');
            return;
        }
        const updates = {};
        if (bulkUpdates.isActive !== '') updates.isActive = bulkUpdates.isActive === 'true';
        
        if (Object.keys(updates).length === 0) {
            alert('Please select at least one field to update');
            return;
        }

        try {
            await adminAPI.bulkUpdateCategories({ categoryIds: selectedCategories, updates });
            setSelectedCategories([]);
            setBulkUpdates({ isActive: '' });
            loadCategories();
            setIsBulkModalOpen(false);
        } catch (error) {
            alert('Failed to update categories: ' + error.message);
        }
    };

    const handleToggle = async (id) => {
        try {
            await adminAPI.toggleCategory(id);
            loadCategories();
        } catch (error) {
            alert('Failed to toggle category: ' + error.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append('name', formData.name);
            if (formData.description) data.append('description', formData.description);
            if (formData.image) data.append('image', formData.image);

            if (editingCategory) {
                await adminAPI.updateCategory(editingCategory._id, data);
            } else {
                await adminAPI.createCategory(data);
            }
            setIsModalOpen(false);
            loadCategories();
        } catch (error) {
            alert('Failed to save category: ' + error.message);
        }
    };

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setFormData({ ...formData, image: e.target.files[0] });
        }
    };

    const toggleCategorySelection = (categoryId) => {
        if (selectedCategories.includes(categoryId)) {
            setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
        } else {
            setSelectedCategories([...selectedCategories, categoryId]);
        }
    };

    const toggleSelectAll = () => {
        if (selectedCategories.length === categories.length) {
            setSelectedCategories([]);
        } else {
            setSelectedCategories(categories.map(c => c._id));
        }
    };

    return (
        <div>
            <header className="admin-header">
                <div>
                    <h1 className="page-title">Categories</h1>
                    <p style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        {categories.length} categories
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={loadCategoryStats} className="btn-secondary">
                        <BarChart3 size={18} />
                        Statistics
                    </button>
                    {selectedCategories.length > 0 && (
                        <button onClick={() => setIsBulkModalOpen(true)} className="btn-secondary">
                            <CheckSquare size={18} />
                            Bulk Actions ({selectedCategories.length})
                        </button>
                    )}
                    <button onClick={handleAdd} className="btn-primary">
                        <Plus size={18} />
                        Add Category
                    </button>
                </div>
            </header>

            {loading ? (
                <div className="empty-state">Loading categories...</div>
            ) : categories.length === 0 ? (
                <div className="empty-state">
                    <FolderOpen size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                    <p>No categories found.</p>
                    <button onClick={handleAdd} className="btn-primary" style={{ marginTop: '16px' }}>
                        Add Your First Category
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {categories.map(category => (
                        <div key={category._id} style={{
                            background: 'var(--color-bg-card)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-border)',
                            overflow: 'hidden',
                            position: 'relative'
                        }}>
                            <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 1 }}>
                                <input
                                    type="checkbox"
                                    checked={selectedCategories.includes(category._id)}
                                    onChange={() => toggleCategorySelection(category._id)}
                                    style={{ width: '18px', height: '18px' }}
                                />
                            </div>
                            {category.image && (
                                <div style={{ height: '120px', background: 'var(--color-bg-secondary)' }}>
                                    <img 
                                        src={category.image} 
                                        alt={category.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                            )}
                            <div style={{ padding: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                    <h3 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '16px' }}>{category.name}</h3>
                                    <span className={`status-badge ${category.isActive ? 'status-active' : 'status-inactive'}`}>
                                        {category.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                {category.description && (
                                    <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
                                        {category.description}
                                    </p>
                                )}
                                {categoryStats && categoryStats.stats && (
                                    <div style={{ marginBottom: '12px', padding: '8px', background: 'var(--color-bg-secondary)', borderRadius: '6px', fontSize: '12px' }}>
                                        {(() => {
                                            const stat = categoryStats.stats.find(s => s.categoryId === category._id);
                                            return stat ? (
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ color: 'var(--color-text-muted)' }}>Products:</span>
                                                    <span style={{ fontWeight: 'bold' }}>{stat.totalProducts}</span>
                                                </div>
                                            ) : null;
                                        })()}
                                    </div>
                                )}
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                    <button onClick={() => handleToggle(category._id)} className="icon-btn" title={category.isActive ? 'Deactivate' : 'Activate'}>
                                        {category.isActive ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                    <button onClick={() => handleEdit(category)} className="icon-btn" title="Edit">
                                        <Pencil size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(category._id)} className="icon-btn danger" title="Delete">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                {editingCategory ? 'Edit Category' : 'Add New Category'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="modal-close">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Category Name *</label>
                                <input
                                    className="form-input"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="e.g., Action Games"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-textarea"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of this category"
                                    rows={4}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Category Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="form-input"
                                    style={{ padding: '8px' }}
                                />
                                {editingCategory?.image && !formData.image && (
                                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                                        Current image will be kept if no new image is selected
                                    </p>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary" style={{ flex: 1 }}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                                    <Save size={18} />
                                    {editingCategory ? 'Save Changes' : 'Create Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Statistics Modal */}
            {isStatsModalOpen && categoryStats && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">Category Statistics</h2>
                            <button onClick={() => setIsStatsModalOpen(false)} className="modal-close">
                                <X size={24} />
                            </button>
                        </div>
                        <div style={{ padding: '20px' }}>
                            {categoryStats.stats && categoryStats.stats.length > 0 ? (
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Category</th>
                                            <th>Total Products</th>
                                            <th>Active Products</th>
                                            <th>Total Stock</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categoryStats.stats.map((stat, idx) => (
                                            <tr key={idx}>
                                                <td style={{ fontWeight: 500 }}>{stat.categoryName}</td>
                                                <td>{stat.totalProducts}</td>
                                                <td>{stat.activeProducts}</td>
                                                <td>{stat.totalStock}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="empty-state">
                                    <p>No statistics available</p>
                                </div>
                            )}
                        </div>
                        <div style={{ padding: '20px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end' }}>
                            <button onClick={() => setIsStatsModalOpen(false)} className="btn-secondary">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Actions Modal */}
            {isBulkModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">Bulk Actions</h2>
                            <button onClick={() => setIsBulkModalOpen(false)} className="modal-close">
                                <X size={24} />
                            </button>
                        </div>
                        <div style={{ padding: '20px' }}>
                            <p style={{ marginBottom: '20px' }}>
                                {selectedCategories.length} category(ies) selected
                            </p>
                            <div className="form-group">
                                <label className="form-label">Update Status</label>
                                <select
                                    className="form-select"
                                    value={bulkUpdates.isActive}
                                    onChange={e => setBulkUpdates({ ...bulkUpdates, isActive: e.target.value })}
                                >
                                    <option value="">No Change</option>
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ padding: '20px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setIsBulkModalOpen(false)} className="btn-secondary">
                                Cancel
                            </button>
                            <button onClick={handleBulkUpdate} className="btn-primary">
                                Update Selected
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;
