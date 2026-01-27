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
            <div className="container">
                <div className="hero-banner-single">
                    <img
                        src={banner ? banner.image : "/images/banner.png"}
                        alt={banner ? banner.title : "Epic gaming adventures"}
                        style={{ width: '100%', height: 'auto', maxHeight: '500px', objectFit: 'cover', borderRadius: '12px' }}
                    />
                    {banner && banner.link && (
                        <a href={banner.link} className="hero-link-overlay" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}></a>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Hero;
