import React from 'react';

const Hero = () => {
    const [banner, setBanner] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchBanner = async () => {
            try {
                // Dynamic import to avoid circular dependency if any, though likely safe to import at top
                const contentAPI = (await import('../api/content')).default;
                const banners = await contentAPI.getBanners('homepage');
                if (banners && banners.length > 0) {
                    setBanner(banners[0]);
                }
            } catch (error) {
                console.error('Failed to load hero banner:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBanner();
    }, []);

    if (loading) return null; // Or a skeleton

    return (
        <section className="hero">
            <style>{`
                .hero {
                    padding: 0 20px 40px;
                }

                .hero-container {
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .hero-banner-wrapper {
                    position: relative;
                    overflow: hidden;
                    border-radius: 12px;
                    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5),
                                0 0 0 1px rgba(255, 255, 255, 0.05);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    aspect-ratio: 16/7;
                    min-height: 280px;
                }

                .hero-banner-wrapper:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7),
                                0 0 0 1px rgba(0, 217, 255, 0.2);
                }

                .hero-banner-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .hero-banner-wrapper:hover .hero-banner-image {
                    transform: scale(1.05);
                }

                .hero-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(
                        90deg,
                        rgba(0, 0, 0, 0.9) 0%,
                        rgba(0, 0, 0, 0.4) 40%,
                        transparent 70%,
                        rgba(0, 0, 0, 0.3) 100%
                    );
                    pointer-events: none;
                }

                .hero-content {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    padding: clamp(20px, 5vw, 60px);
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    gap: 32px;
                    z-index: 2;
                }

                .hero-text {
                    flex: 1;
                    max-width: 600px;
                }

                .hero-label {
                    display: inline-block;
                    font-size: clamp(10px, 1.2vw, 12px);
                    font-weight: 700;
                    letter-spacing: 2.5px;
                    text-transform: uppercase;
                    color: var(--color-cyan-primary);
                    margin-bottom: 12px;
                    font-family: 'Inter', sans-serif;
                    padding: 4px 12px;
                    background: rgba(0, 217, 255, 0.1);
                    border-radius: 4px;
                    border-left: 3px solid var(--color-cyan-primary);
                }

                .hero-title {
                    font-family: 'Orbitron', sans-serif;
                    font-size: clamp(24px, 5vw, 48px);
                    font-weight: 900;
                    color: white;
                    margin: 0 0 12px 0;
                    text-shadow: 0 2px 15px rgba(0, 0, 0, 0.9);
                    line-height: 1.1;
                }

                .hero-subtitle {
                    font-size: clamp(14px, 1.8vw, 18px);
                    color: rgba(255, 255, 255, 0.7);
                    margin: 0;
                    font-weight: 500;
                    max-width: 500px;
                    line-height: 1.5;
                }

                .hero-cta {
                    padding: 16px 36px;
                    background: var(--color-cyan-primary);
                    border: none;
                    border-radius: 8px;
                    color: black;
                    font-size: 15px;
                    font-weight: 700;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    transition: all 0.3s ease;
                    cursor: pointer;
                    white-space: nowrap;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    box-shadow: 0 0 20px rgba(0, 217, 255, 0.3);
                }

                .hero-cta:hover {
                    background: white;
                    box-shadow: 0 0 30px rgba(255, 255, 255, 0.4);
                    transform: translateY(-2px);
                }

                @media (max-width: 868px) {
                    .hero-banner-wrapper {
                        aspect-ratio: 16/9;
                    }
                    
                    .hero-overlay {
                        background: linear-gradient(
                            to top,
                            rgba(0, 0, 0, 0.9) 0%,
                            rgba(0, 0, 0, 0.4) 60%,
                            rgba(0, 0, 0, 0.2) 100%
                        );
                    }

                    .hero-content {
                        flex-direction: column;
                        justify-content: flex-end;
                        align-items: flex-start;
                        padding: 30px;
                        gap: 20px;
                    }

                    .hero-text {
                        max-width: 100%;
                    }
                }

                @media (max-width: 480px) {
                    .hero {
                        padding: 0 12px 24px;
                    }

                    .hero-banner-wrapper {
                        aspect-ratio: 4/5;
                        min-height: 350px;
                    }

                    .hero-content {
                        padding: 24px;
                    }
                    
                    .hero-cta {
                        width: 100%;
                        justify-content: center;
                    }
                }
            `}</style>

            <div className="hero-container">
                <div className="hero-banner-wrapper">
                    <img
                        src={banner ? banner.image : "/images/banner.png"}
                        alt={banner ? banner.title : "Featured Game"}
                        className="hero-banner-image"
                    />
                    <div className="hero-overlay"></div>
                    <div className="hero-content">
                        <div className="hero-text">
                            <div className="hero-label">Featured Game</div>
                            <h1 className="hero-title">
                                {banner?.title || "Grand Theft Auto VI"}
                            </h1>
                            <p className="hero-subtitle">
                                {banner?.description || "Coming 2025"}
                            </p>
                        </div>
                        <a
                            href={banner?.link || "#"}
                            className="hero-cta"
                        >
                            {banner?.link ? "View Details" : "Coming Soon"}
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
