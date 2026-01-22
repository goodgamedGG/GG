import React from 'react';
import GameCard from './GameCard';
import { useGames } from '../context/GameContext';

const GameGrid = () => {
    const { games, loading } = useGames();

    if (loading) {
        return (
            <section className="games-section">
                <div className="container" style={{ textAlign: 'center', padding: '40px' }}>
                    Loading Games...
                </div>
            </section>
        );
    }

    return (
        <section className="games-section" id="games">
            <div className="container">
                <h2 className="section-title">Best Seller</h2>

                {/* Main Games Grid */}
                <div className="games-grid">
                    {games.map(game => (
                        <GameCard
                            key={game.id}
                            image={game.image}
                            title={game.title}
                            publisher={game.publisher}
                            price={game.price}
                        />
                    ))}
                </div>

                {games.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                        No games found. Check the Admin Dashboard to add games.
                    </div>
                )}
            </div>
        </section>
    );
};

export default GameGrid;
