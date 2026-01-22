import React from 'react';

const GameCard = ({ image, title, publisher, price }) => {
    return (
        <div className="game-card">
            <div className="game-card-image-wrapper">
                <img
                    src={image}
                    alt={title}
                    className="game-card-image"
                />
            </div>
            <div className="game-card-content">
                <h3 className="game-card-title">{title}</h3>
                <p className="game-card-publisher">{publisher}</p>
                <div className="game-card-footer">
                    <span className="game-card-price">EGP{price}</span>
                    <button className="game-card-add" aria-label="Add to cart">
                        +
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GameCard;
