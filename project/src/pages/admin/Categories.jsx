import React, { useState, useEffect } from 'react';
import adminAPI from '../../api/admin';
import { Folder, Plus, Edit2, Trash2, Search, Upload, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { getImageUrl } from '../../utils/imageUtils';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: null
    });
    const [previewImage, setPreviewImage] = useState(null);
    const { addToast } = useToast();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await adminAPI.getCategories();
            if (Array.isArray(data)) {
                setCategories(data);
            } else if (data.data?.categories) {
                setCategories(data.data.categories);
            } else if (data.categories) {
                setCategories(data.categories);
            } else {
                setCategories([]);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            addToast('Failed to load categories', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description);
            if (formData.image instanceof File) {
                data.append('image', formData.image);
            }

            if (editingCategory) {
                await adminAPI.updateCategory(editingCategory._id, data);
                addToast('Category updated successfully', 'success');
            } else {
                await adminAPI.createCategory(data);
                addToast('Category created successfully', 'success');
            }

            setIsModalOpen(false);
            resetForm();
            fetchCategories();
        } catch (error) {
            console.error('Operation failed:', error);
            addToast('Failed to save category', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await adminAPI.deleteCategory(id);
                addToast('Category deleted', 'success');
                fetchCategories();
            } catch (error) {
                console.error('Failed to delete category:', error);
                addToast('Failed to delete category', 'error');
            }
        }
    };

    const resetForm = () => {
        setFormData({ name: '', description: '', image: null });
        setPreviewImage(null);
        setEditingCategory(null);
    };

    const openEditModal = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            image: category.image
        });
        setPreviewImage(category.image ? getImageUrl(category.image) : null);
        setIsModalOpen(true);
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 className="page-title">Categories</h1>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'linear-gradient(135deg, #00d9ff 0%, #00a8cc 100%)',
                        color: '#0a0f14',
                        padding: '14px 28px',
                        borderRadius: 'var(--radius-md)',
                        fontWeight: '700',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 4px 20px rgba(0, 217, 255, 0.4)',
                        fontSize: '15px',
                        letterSpacing: '0.3px'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 217, 255, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 217, 255, 0.4)';
                    }}
                    onMouseDown={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px) scale(0.98)';
                    }}
                    onMouseUp={(e) => {
                        e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                    }}
                >
                    <Plus size={20} strokeWidth={2.5} />
                    Add Category
                </button>
            </div>

            {/* Filters */}
            <div style={{ marginBottom: '40px', position: 'relative', maxWidth: '600px' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                    type="text"
                    placeholder="Search categories..."
                    className="form-input-minimal"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '14px 14px 14px 48px',
                        background: 'transparent',
                        border: '1px solid #1e293b',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--color-text-primary)',
                        fontSize: '15px',
                        transition: 'all 0.3s ease',
                        outline: 'none'
                    }}
                />
            </div>

            {/* Categories List */}
            <div className="card-title-minimal" style={{
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center'
            }}>
                <Folder size={20} color="var(--color-primary)" style={{ marginRight: '12px' }} />
                <span style={{
                    fontWeight: '600',
                    letterSpacing: '0.3px',
                    fontSize: '18px'
                }}>
                    Category List
                </span>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-muted)' }}>
                    Loading categories...
                </div>
            ) : filteredCategories.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-muted)' }}>
                    No categories found.
                </div>
            ) : (
                <div className="category-grid-container-minimal">
                    {/* Header */}
                    <div className="category-grid-header-minimal">
                        <div style={{ textAlign: 'center' }}>Image</div>
                        <div style={{ paddingLeft: '24px' }}>Name</div>
                        <div style={{ paddingLeft: '24px' }}>Description</div>
                        <div style={{ textAlign: 'center' }}>Status</div>
                        <div style={{ textAlign: 'center' }}>Actions</div>
                    </div>

                    {/* Body */}
                    <div className="category-grid-body-minimal">
                        {filteredCategories.map((category) => (
                            <div key={category._id} className="category-grid-row-minimal">
                                {/* Image */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img
                                        src={category.image ? getImageUrl(category.image) : 'https://placehold.co/80'}
                                        alt={category.name}
                                        className="category-img-minimal"
                                        onError={(e) => { e.target.src = 'https://placehold.co/80x80/1a212c/64748b?text=Category'; }}
                                    />
                                </div>

                                {/* Name */}
                                <div style={{ paddingLeft: '24px' }}>
                                    <div className="category-name-minimal">{category.name}</div>
                                </div>

                                {/* Description */}
                                <div style={{ paddingLeft: '24px' }}>
                                    <div className="category-desc-minimal">
                                        {category.description || 'No description provided.'}
                                    </div>
                                </div>

                                {/* Status */}
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <span className={`status-pill ${category.isActive !== false ? 'active' : 'inactive'}`}>
                                        <span className="status-dot"></span>
                                        {category.isActive !== false ? 'ACTIVE' : 'INACTIVE'}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                    <button onClick={() => openEditModal(category)} className="action-btn-minimal" title="Edit">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(category._id)} className="action-btn-minimal danger" title="Delete">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .category-grid-container-minimal {
                    display: flex;
                    flex-direction: column;
                    font-family: 'Inter', sans-serif;
                }

                .category-grid-header-minimal {
                    display: grid;
                    grid-template-columns: 120px 1.5fr 2fr 1fr 120px;
                    padding: 12px 0;
                    color: #94a3b8;
                    font-size: 13px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    border-bottom: 2px solid #1e293b;
                }

                .category-grid-row-minimal {
                    display: grid;
                    grid-template-columns: 120px 1.5fr 2fr 1fr 120px;
                    padding: 20px 0;
                    align-items: center;
                    border-bottom: 1px solid #1e293b;
                    transition: all 0.2s ease;
                }

                .category-grid-row-minimal:hover {
                    background: rgba(30, 41, 59, 0.2);
                }

                .category-img-minimal {
                    width: 70px;
                    height: 70px;
                    object-fit: cover;
                    border-radius: 10px;
                    border: 1px solid #1e293b;
                    background: #0f172a;
                }

                .category-name-minimal {
                    font-weight: 600;
                    font-size: 18px;
                    color: #ffffff;
                }

                .category-desc-minimal {
                    font-size: 14px;
                    color: #94a3b8;
                    line-height: 1.5;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .status-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 16px;
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.05em;
                }

                .status-pill.active {
                    background: rgba(16, 185, 129, 0.1);
                    color: #10b981;
                    border: 1px solid rgba(16, 185, 129, 0.2);
                }

                .status-pill.inactive {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                    border: 1px solid rgba(239, 68, 68, 0.2);
                }

                .status-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: currentColor;
                    box-shadow: 0 0 8px currentColor;
                }

                .action-btn-minimal {
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: transparent;
                    color: #94a3b8;
                    border-radius: 10px;
                    border: 1px solid #1e293b;
                    transition: all 0.2s;
                    cursor: pointer;
                }

                .action-btn-minimal:hover {
                    color: #ffffff;
                    background: #1e293b;
                    transform: translateY(-2px);
                }

                .action-btn-minimal.danger:hover {
                    background: #ef4444;
                    border-color: #ef4444;
                    box-shadow: 0 0 15px rgba(239, 68, 68, 0.3);
                }

                .form-input-minimal:focus {
                    border-color: #00d9ff !important;
                    box-shadow: 0 0 0 3px rgba(0, 217, 255, 0.1) !important;
                }
            ` }} />

            {/* Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                    <div className="admin-card" style={{ width: '100%', maxWidth: '500px', margin: '20px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
                        <div className="card-header">
                            <span className="card-title">{editingCategory ? 'Edit Category' : 'New Category'}</span>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>Name</label>
                                <input
                                    type="text"
                                    required
                                    className="form-input"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    style={{ width: '100%', padding: '10px', background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)' }}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>Description</label>
                                <textarea
                                    className="form-input"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    style={{ width: '100%', padding: '10px', background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)' }}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>Image</label>
                                <div style={{ border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-md)', padding: '20px', textAlign: 'center', cursor: 'pointer', position: 'relative', background: 'var(--color-bg-secondary)' }}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                                    />
                                    {previewImage ? (
                                        <div style={{ position: 'relative' }}>
                                            <img src={previewImage} alt="Preview" style={{ maxHeight: '150px', maxWidth: '100%', borderRadius: 'var(--radius-md)' }} />
                                            <p style={{ marginTop: '8px', fontSize: '12px', color: 'var(--color-text-muted)' }}>Click to change</p>
                                        </div>
                                    ) : (
                                        <div style={{ color: 'var(--color-text-muted)' }}>
                                            <Upload size={24} style={{ marginBottom: '8px' }} />
                                            <p style={{ fontSize: '14px' }}>Click to upload image</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{ padding: '10px 20px', background: 'var(--color-primary)', border: 'none', borderRadius: 'var(--radius-md)', color: '#000', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    {editingCategory ? 'Update' : 'Create'}
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
