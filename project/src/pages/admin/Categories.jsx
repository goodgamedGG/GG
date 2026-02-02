import React, { useState, useEffect } from 'react';
import categoriesAPI from '../../api/categories';
import { Plus, Edit, Trash2, X, Check } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { getImageUrl } from '../../utils/imageUtils';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const { addToast } = useToast();

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isActive: true
    });

    const fetchCategories = async () => {
        setLoading(true);
        try {
            // Fetch all categories (including inactive)
            const data = await categoriesAPI.getCategories({ active: 'all' });
            setCategories(data);
        } catch (error) {
            addToast('Failed to fetch categories', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('isActive', formData.isActive);
            if (formData.image) {
                data.append('image', formData.image);
            }

            if (editingCategory) {
                await categoriesAPI.updateCategory(editingCategory._id, data);
                addToast('Category updated', 'success');
            } else {
                await categoriesAPI.createCategory(data);
                addToast('Category created', 'success');
            }

            closeModal();
            fetchCategories();
        } catch (error) {
            addToast('Failed to save category', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure? This will delete the category.')) {
            try {
                await categoriesAPI.deleteCategory(id);
                addToast('Category deleted', 'success');
                fetchCategories();
            } catch (error) {
                addToast('Failed to delete category', 'error');
            }
        }
    };

    const openModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                description: category.description || '',
                isActive: category.isActive
            });
        } else {
            setEditingCategory(null);
            setFormData({
                name: '',
                description: '',
                isActive: true
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        setFormData({ name: '', description: '', isActive: true });
    };

    return (
        <div className="admin-categories">
            <style>{`
                .admin-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }
                .btn-primary {
                    background: var(--color-cyan-primary);
                    color: var(--color-bg-primary);
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    font-weight: 600;
                }
                .categories-table {
                    width: 100%;
                    background: var(--color-bg-card);
                    border-radius: 8px;
                    border-collapse: collapse;
                }
                .categories-table th, .categories-table td {
                    padding: 12px 16px;
                    text-align: left;
                    border-bottom: 1px solid var(--color-border);
                }
                .status-badge {
                    padding: 2px 8px;
                    border-radius: 99px;
                    font-size: 12px;
                }
                .status-badge.active {
                    background: rgba(0, 255, 0, 0.1);
                    color: #00ff00;
                }
                .status-badge.inactive {
                    background: rgba(255, 0, 0, 0.1);
                    color: #ff4444;
                }
                
                /* Modal Styles */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                .modal-content {
                    background: var(--color-bg-card);
                    padding: 24px;
                    border-radius: 8px;
                    width: 100%;
                    max-width: 500px;
                    border: 1px solid var(--color-border);
                }
                .form-group {
                    margin-bottom: 16px;
                }
                .form-label {
                    display: block;
                    margin-bottom: 8px;
                    color: var(--color-text-secondary);
                }
                .form-input {
                    width: 100%;
                    padding: 8px;
                    background: var(--color-bg-secondary);
                    border: 1px solid var(--color-border);
                    color: var(--color-text-primary);
                    border-radius: 4px;
                }
                .modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    margin-top: 24px;
                }
                .btn-cancel {
                    background: transparent;
                    border: 1px solid var(--color-border);
                    color: var(--color-text-secondary);
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                }
            `}</style>

            <div className="admin-header">
                <h1>Categories</h1>
                <button className="btn-primary" onClick={() => openModal()}>
                    <Plus size={18} /> Add Category
                </button>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <table className="categories-table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(cat => (
                            <tr key={cat._id}>
                                <td>
                                    {cat.image && (
                                        <img
                                            src={getImageUrl(cat.image)}
                                            alt={cat.name}
                                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                                        />
                                    )}
                                </td>
                                <td>{cat.name}</td>
                                <td>{cat.description}</td>
                                <td>
                                    <span className={`status-badge ${cat.isActive ? 'active' : 'inactive'}`}>
                                        {cat.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>
                                    <button className="action-btn" onClick={() => openModal(cat)}>
                                        <Edit size={18} />
                                    </button>
                                    <button className="action-btn delete" onClick={() => handleDelete(cat._id)}>
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{editingCategory ? 'Edit Category' : 'New Category'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-input"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                    /> Active
                                </label>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="btn-primary">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;
