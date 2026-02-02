import React, { useEffect, useState } from 'react';
import adminAPI from '../../api/admin';
import productsAPI from '../../api/products';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

import { getImageUrl } from '../../utils/imageUtils';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    const fetchProducts = async () => {
        setLoading(true);
        try {
            // Using admin endpoint if available, otherwise public with limit
            const data = await productsAPI.getProducts({ limit: 100 });
            setProducts(data.products);
        } catch (error) {
            addToast('Failed to fetch products', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await productsAPI.deleteProduct(id);
                addToast('Product deleted', 'success');
                fetchProducts();
            } catch (error) {
                addToast('Failed to delete product', 'error');
            }
        }
    };

    return (
        <div className="admin-products">
            <style>{`
                .admin-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }
                .page-title {
                    font-size: 24px;
                    color: var(--color-text-primary);
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
                .products-table {
                    width: 100%;
                    background: var(--color-bg-card);
                    border-radius: 8px;
                    border-collapse: collapse;
                    overflow: hidden;
                }
                .products-table th, .products-table td {
                    padding: 12px 16px;
                    text-align: left;
                    border-bottom: 1px solid var(--color-border);
                }
                .products-table th {
                    background: rgba(255, 255, 255, 0.05);
                    color: var(--color-text-secondary);
                    font-weight: 500;
                }
                .product-image {
                    width: 40px;
                    height: 40px;
                    object-fit: cover;
                    border-radius: 4px;
                }
                .action-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: var(--color-text-secondary);
                    margin-right: 8px;
                }
                .action-btn:hover {
                    color: var(--color-cyan-primary);
                }
                .action-btn.delete:hover {
                    color: #ff4444;
                }
                .status-badge {
                    padding: 2px 8px;
                    border-radius: 99px;
                    font-size: 12px;
                    background: rgba(0, 255, 0, 0.1);
                    color: #00ff00;
                }
                .status-badge.inactive {
                    background: rgba(255, 0, 0, 0.1);
                    color: #ff4444;
                }
            `}</style>

            <div className="admin-header">
                <h1 className="page-title">Products management</h1>
                <button className="btn-primary">
                    <Plus size={18} /> Add Product
                </button>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <table className="products-table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product._id}>
                                <td>
                                    <img
                                        src={product.images?.[0] ? getImageUrl(product.images[0]) : 'https://via.placeholder.com/40'}
                                        alt={product.name}
                                        className="product-image"
                                    />
                                </td>
                                <td>{product.name}</td>
                                <td>{product.category?.name || 'N/A'}</td>
                                <td>${product.price}</td>
                                <td>{product.stock}</td>
                                <td>
                                    <span className={`status-badge ${product.isActive ? 'active' : 'inactive'}`}>
                                        {product.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>
                                    <button className="action-btn" title="Edit">
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        className="action-btn delete"
                                        title="Delete"
                                        onClick={() => handleDelete(product._id)}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Products;
