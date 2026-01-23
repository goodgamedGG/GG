import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const SearchBar = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const { t, isRTL } = useLanguage();

    const handleSearch = (e) => {
        e.preventDefault();
        // Search functionality can be implemented here
        console.log('Searching for:', searchTerm);
    };

    return (
        <section className="search-section">
            <div className="container">
                <form onSubmit={handleSearch} className="search-form" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
                    <div className="search-input-wrapper">
                        <Search size={20} className="search-icon" />
                        <input
                            type="text"
                            placeholder={t('searchGames')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </form>
            </div>
        </section>
    );
};

export default SearchBar;
