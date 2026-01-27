import React from 'react';
import GameCard from './GameCard';
import { useGames } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';

const GameGrid = () => {
    const { games, loading } = useGames();
    const { t, isRTL } = useLanguage();

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
                            image={game.image}
                            title={game.title}
                            publisher={game.publisher || game.category?.name || 'Unknown'} // Fallback for publisher if missing
                            price={game.price}
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
