import React from 'react';
import GameCard from './GameCard';

const GameGrid = ({ products, loading }) => {
    if (loading) {
        return (
            <div className="game-grid-loading">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="skeleton-card"></div>
                ))}
            </div>
        );
    }

    if (!products || products.length === 0) {
        return (
            <div className="no-products">
                <h3>No games found</h3>
                <p>Try adjusting your search or filters.</p>
            </div>
        );
    }

    return (
        <div className="game-grid">
            <style>{`
                .game-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
                    gap: 24px;
                    padding: 24px 0;
                }

                .game-grid-loading {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
                    gap: 24px;
                }

                .skeleton-card {
                    height: 360px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: var(--radius-md);
                    animation: pulse 1.5s infinite;
                }

                .no-products {
                    text-align: center;
                    padding: 40px;
                    color: var(--color-text-muted);
                    grid-column: 1 / -1;
                }

                @keyframes pulse {
                    0% { opacity: 0.6; }
                    50% { opacity: 1; }
                    100% { opacity: 0.6; }
                }
            `}</style>

            {products.map(product => (
                <GameCard key={product._id} product={product} />
            ))}
        </div>
    );
};

export default GameGrid;
