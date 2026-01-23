import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, X, Save, Eye, EyeOff, FolderOpen } from 'lucide-react';
import adminAPI from '../../api/admin';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
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
                setCategories(categories.filter(c => c._id !== id));
            } catch (error) {
                alert('Failed to delete category: ' + error.message);
            }
        }
    };

    const handleToggle = async (id) => {
        try {
            const result = await adminAPI.toggleCategory(id);
            setCategories(categories.map(c => 
                c._id === id ? { ...c, isActive: result.category.isActive } : c
            ));
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

    return (
        <div>
            <header className="admin-header">
                <div>
                    <h1 className="page-title">Categories</h1>
                    <p style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        {categories.length} categories
                    </p>
                </div>
                <button onClick={handleAdd} className="btn-primary">
                    <Plus size={18} />
                    Add Category
                </button>
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
                            overflow: 'hidden'
                        }}>
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
        </div>
    );
};

export default Categories;
