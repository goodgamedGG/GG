import React from 'react';
import GameCard from './GameCard';
import { useGames } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';

import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const GameGrid = () => {
    const { games, loading } = useGames();
    const { t, isRTL } = useLanguage();
    const { addToast } = useToast();
    const navigate = useNavigate();

    // Use a custom handler wrapper for the game card component
    // Note: Since GameCard handles the click internally, we might need to modify GameCard too
    // But GameCard uses addToCart directly.
    // Let's modify GameCard instead to accept an onAddToCartSuccess callback or verify how it works.
    // Actually, looking at GameCard, it calls addToCart from context.
    // I should modify GameCard to take useToast and navigate.
    // Wait, GameCard is a child. It's better to modify GameCard.jsx directly.


    if (loading) {
        return (
            <section className="games-section">
                <div className="container" style={{ textAlign: 'center', padding: '40px' }}>
                    {t('loadingGames')}
                </div>
            </section>
        );
    }

    return (
        <section className="games-section" id="games" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
            <div className="container">
                <h2 className="section-title">{t('bestSeller')}</h2>

                {/* Main Games Grid */}
                <div className="games-grid">
                    {games.map(game => (
                        <GameCard
                            key={game.id || game._id}
                            id={game.id || game._id}
                            image={game.images?.[0]}
                            title={game.name}
                            publisher={game.category?.name || 'Unknown'} // Fallback for publisher if missing
                            price={game.effectivePrice}
                            regularPrice={game.price}
                        />
                    ))}
                </div>

                {games.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                        {t('noGamesFound')} {t('checkAdminDashboard')}
                    </div>
                )}
            </div>
        </section>
    );
};

export default GameGrid;
