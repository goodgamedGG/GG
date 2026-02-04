import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import GameGrid from '../components/GameGrid';
import Hero from '../components/Hero';
import SearchBar from '../components/SearchBar';
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

        // If there's a search term in URL, update local query if needed (handled by SearchBar navigation)

        fetchProducts({
            search,
            category: category || activeCategory,
            sort: sortBy
        });
    }, [location.search, activeCategory, sortBy]);

    return (
        <div className="games-page">
            <style>{`
                .games-page {
                    min-height: 100vh;
                    background: radial-gradient(circle at 50% 0%, #1a1a2e 0%, #05050a 100%);
                    padding-top: 40px;
                }

                .content-container {
                    max-width: 1600px;
                    margin: 0 auto;
                    padding: 0 40px 60px;
                    display: grid;
                    grid-template-columns: 280px 1fr;
                    gap: 40px;
                }

                .sidebar {
                    background: rgba(20, 20, 30, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 16px;
                    padding: 24px;
                    height: fit-content;
                    position: sticky;
                    top: 100px;
                    backdrop-filter: blur(10px);
                }

                .sidebar-section {
                    margin-bottom: 32px;
                }

                .sidebar-section:last-child {
                    margin-bottom: 0;
                }

                .sidebar-title {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 18px;
                    color: white;
                    margin-bottom: 16px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .sidebar-title::before {
                    content: '';
                    width: 3px;
                    height: 18px;
                    background: var(--color-cyan-primary);
                    border-radius: 2px;
                    box-shadow: 0 0 8px var(--color-cyan-primary);
                }

                .category-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .category-btn {
                    background: transparent;
                    border: none;
                    text-align: left;
                    color: var(--color-text-secondary);
                    padding: 10px 12px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 15px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .category-btn:hover {
                    color: white;
                    background: rgba(255, 255, 255, 0.05);
                }

                .category-btn.active {
                    color: var(--color-bg-primary);
                    background: var(--color-cyan-primary);
                    font-weight: 600;
                    box-shadow: 0 0 15px rgba(0, 217, 255, 0.2);
                }

                .filter-select {
                    width: 100%;
                    background: rgba(10, 10, 20, 0.8);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 12px;
                    border-radius: 8px;
                    font-family: 'Inter', sans-serif;
                    cursor: pointer;
                    outline: none;
                }

                .main-content {
                    width: 100%;
                }

                .results-header {
                    margin-bottom: 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .results-count {
                    color: var(--color-text-secondary);
                    font-size: 14px;
                }

                @media (max-width: 1024px) {
                    .content-container {
                        grid-template-columns: 1fr;
                    }
                    .sidebar {
                        position: relative;
                        top: 0;
                        margin-bottom: 30px;
                    }
                }
            `}</style>

            <div className="content-container">
                {/* Sidebar Section */}
                <aside className="sidebar">
                    {/* Search Section */}
                    <div className="sidebar-section">
                        <div className="sidebar-title">SEARCH</div>
                        <SearchBar />
                    </div>

                    {/* Categories Section */}
                    <div className="sidebar-section">
                        <div className="sidebar-title">CATEGORIES</div>
                        <div className="category-list">
                            <button
                                className={`category-btn ${activeCategory === '' ? 'active' : ''}`}
                                onClick={() => setActiveCategory('')}
                            >
                                All Games
                                <ChevronDown size={16} style={{ transform: activeCategory === '' ? 'rotate(-90deg)' : 'rotate(0)', opacity: 0.5 }} />
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat._id}
                                    className={`category-btn ${activeCategory === cat._id ? 'active' : ''}`}
                                    onClick={() => setActiveCategory(cat._id)}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sort Section */}
                    <div className="sidebar-section">
                        <div className="sidebar-title">SORT BY</div>
                        <select
                            className="filter-select"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="newest">Newest First</option>
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                            <option value="name-asc">Name: A-Z</option>
                        </select>
                    </div>
                </aside>

                {/* Main Grid Section */}
                <main className="main-content">
                    <div className="results-header">
                        <h2 className="text-2xl font-bold text-white font-orbitron">ALL GAMES</h2>
                        <span className="results-count">Showing {products.length} results</span>
                    </div>

                    <GameGrid products={products} loading={loading} />
                </main>
            </div>
        </div>
    );
};

export default Games;

