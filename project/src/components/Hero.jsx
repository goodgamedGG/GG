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
                    border-radius: 10px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6),
                                0 0 0 1px rgba(0, 217, 255, 0.08);
                    transition: all 0.3s ease;
                }

                .hero-banner-wrapper:hover {
                    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.7),
                                0 0 0 1px rgba(0, 217, 255, 0.15);
                    transform: translateY(-2px);
                }

                .hero-banner-image {
                    width: 100%;
                    height: auto;
                    max-height: 420px;
                    object-fit: cover;
                    display: block;
                }

                .hero-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(
                        to right,
                        rgba(0, 0, 0, 0.75) 0%,
                        rgba(0, 0, 0, 0.4) 30%,
                        rgba(0, 0, 0, 0.3) 50%,
                        rgba(0, 0, 0, 0.4) 70%,
                        rgba(0, 0, 0, 0.75) 100%
                    ),
                    linear-gradient(
                        to bottom,
                        rgba(0, 0, 0, 0.3) 0%,
                        rgba(0, 0, 0, 0.1) 50%,
                        rgba(0, 0, 0, 0.6) 100%
                    );
                    pointer-events: none;
                }

                .hero-content {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    padding: 40px 50px;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    gap: 32px;
                }

                .hero-text {
                    flex: 1;
                }

                .hero-label {
                    font-size: 11px;
                    font-weight: 600;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    color: rgba(0, 217, 255, 0.9);
                    margin-bottom: 8px;
                    font-family: 'Inter', sans-serif;
                }

                .hero-title {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 42px;
                    font-weight: 700;
                    color: white;
                    margin: 0 0 6px 0;
                    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
                    line-height: 1.1;
                }

                .hero-subtitle {
                    font-size: 16px;
                    color: rgba(255, 255, 255, 0.75);
                    margin: 0;
                    font-weight: 500;
                }

                .hero-cta {
                    padding: 14px 32px;
                    background: rgba(0, 217, 255, 0.15);
                    border: 1px solid rgba(0, 217, 255, 0.4);
                    border-radius: 50px;
                    color: rgba(0, 217, 255, 1);
                    font-size: 14px;
                    font-weight: 600;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    backdrop-filter: blur(10px);
                    transition: all 0.25s ease;
                    cursor: pointer;
                    white-space: nowrap;
                }

                .hero-cta:hover {
                    background: rgba(0, 217, 255, 0.25);
                    border-color: rgba(0, 217, 255, 0.6);
                    box-shadow: 0 0 20px rgba(0, 217, 255, 0.2);
                    transform: translateY(-1px);
                }

                @media (max-width: 768px) {
                    .hero {
                        padding: 0 16px 32px;
                    }

                    .hero-banner-image {
                        max-height: 320px;
                    }

                    .hero-content {
                        padding: 24px 28px;
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 20px;
                    }

                    .hero-title {
                        font-size: 28px;
                    }

                    .hero-subtitle {
                        font-size: 14px;
                    }

                    .hero-cta {
                        padding: 12px 24px;
                        font-size: 13px;
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
