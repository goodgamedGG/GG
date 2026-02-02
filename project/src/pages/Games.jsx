import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import GameGrid from '../components/GameGrid';
import { useProducts } from '../context/ProductContext';
import { Filter, ChevronDown } from 'lucide-react';

const Games = () => {
    const { products, loading, fetchProducts, categories } = useProducts();
    const location = useLocation();
    const [activeCategory, setActiveCategory] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const search = params.get('search');
        const category = params.get('category');

        if (category) setActiveCategory(category);

        fetchProducts({
            search,
            category: category || activeCategory,
            sort: sortBy
        });
    }, [location.search, activeCategory, sortBy]);

    const handleCategoryChange = (e) => {
        setActiveCategory(e.target.value);
    };

    return (
        <div className="games-page container">
            <style>{`
                .games-page {
                    padding: 40px 20px;
                }
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 32px;
                }
                .page-title {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 32px;
                    color: var(--color-cyan-primary);
                }
                .filters {
                    display: flex;
                    gap: 16px;
                }
                .filter-select {
                    background: var(--color-bg-secondary);
                    color: var(--color-text-primary);
                    border: 1px solid var(--color-border);
                    padding: 8px 16px;
                    border-radius: 4px;
                    font-family: 'Inter', sans-serif;
                }
            `}</style>

            <div className="page-header">
                <h1 className="page-title">Games Collection</h1>

                <div className="filters">
                    <select
                        className="filter-select"
                        value={activeCategory}
                        onChange={handleCategoryChange}
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                    </select>

                    <select
                        className="filter-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="newest">Newest</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="name-asc">Name: A-Z</option>
                    </select>
                </div>
            </div>

            <GameGrid products={products} loading={loading} />
        </div>
    );
};

export default Games;
