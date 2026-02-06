import React, { useState, useEffect } from 'react';
import adminAPI from '../../api/admin';
import { Package, Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Pagination from '../../components/Pagination.jsx';
import { getImageUrl } from '../../utils/imageUtils';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);

    const ITEMS_per_PAGE = 10;

    useEffect(() => {
        fetchProducts();
    }, [currentPage, searchTerm]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getProducts(currentPage, ITEMS_per_PAGE, searchTerm);

            if (response.products) {
                setProducts(response.products); // Expecting array
                setTotalPages(response.pages);  // Expecting number
                setTotalProducts(response.total); // Expecting number
            } else if (response.data && response.data.products) { // Handle potential nested structure
                setProducts(response.data.products);
                setTotalPages(response.data.pages);
                setTotalProducts(response.data.total);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await adminAPI.deleteProduct(id);
                setProducts(products.filter(p => p._id !== id));
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('Failed to delete product');
            }
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 className="page-title">Products</h1>
                <Link to="/admin/products/new" className="btn-primary" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'var(--color-primary)',
                    color: '#000',
                    padding: '10px 20px',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: '600',
                    textDecoration: 'none'
                }}>
                    <Plus size={18} />
                    Add Product
                </Link>
            </div>

            {/* Filters / Search */}
            <div className="admin-card" style={{ marginBottom: '24px', padding: '16px' }}>
                <div style={{ position: 'relative', maxWidth: '400px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="form-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 10px 10px 40px',
                            background: 'var(--color-bg-primary)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--color-text-primary)'
                        }}
                    />
                </div>
            </div>





            {/* Products Table */}
            <div className="admin-card">
                <div className="card-header">
                    <div className="card-title">
                        <Package size={20} color="var(--color-primary)" />
                        <span>Product List</span>
                        <span style={{
                            fontSize: '12px',
                            background: 'var(--color-bg-secondary)',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            color: 'var(--color-text-secondary)',
                            marginLeft: '8px'
                        }}>
                            {totalProducts || 0} items
                        </span>
                    </div>
                </div>

                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ width: '60px' }}>Image</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>Loading...</td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>No products found.</td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product._id}>
                                        <td className="col-image">
                                            <img
                                                src={getImageUrl(product.images?.[0] || product.image)}
                                                alt={product.name}
                                                style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    objectFit: 'cover',
                                                    borderRadius: '6px',
                                                    border: '1px solid var(--color-border)'
                                                }}
                                                onError={(e) => { e.target.src = 'https://placehold.co/40'; }}
                                            />
                                        </td>
                                        <td className="col-primary">
                                            <div>{product.name}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>ID: {product._id.substring(products.length - 6)}...</div>
                                        </td>
                                        <td>{product.category?.name || product.category || 'Uncategorized'}</td>
                                        <td style={{ fontWeight: '600' }}>{formatPrice(product.price)}</td>
                                        <td>
                                            <span className={`status-badge ${product.isActive ? 'status-active' : 'status-inactive'}`}>
                                                {product.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-btn-group" style={{ justifyContent: 'flex-end' }}>
                                                <Link to={`/admin/products/edit/${product._id}`} className="action-btn" title="Edit">
                                                    <Edit2 size={16} />
                                                </Link>
                                                <button onClick={() => handleDelete(product._id)} className="action-btn delete" title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div style={{ padding: '20px', borderTop: '1px solid var(--color-border)' }}>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;
