import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/games?search=${encodeURIComponent(query)}`);
            setIsOpen(false);
            setQuery('');
        }
    };

    const handleClear = () => {
        setQuery('');
        inputRef.current?.focus();
    };

    return (
        <div className="search-bar">
            <style>{`
                .search-bar {
                    position: relative;
                    width: 100%;
                    max-width: 400px;
                }

                .search-form {
                    display: flex;
                    align-items: center;
                    background: var(--color-bg-secondary);
                    border: 1px solid var(--color-border);
                    border-radius: 999px;
                    padding: 4px 12px;
                    transition: all 0.2s;
                }

                .search-form:focus-within {
                    border-color: var(--color-cyan-primary);
                    box-shadow: 0 0 0 2px rgba(0, 217, 255, 0.1);
                }

                .search-input {
                    flex: 1;
                    background: none;
                    border: none;
                    color: var(--color-text-primary);
                    padding: 6px 8px;
                    font-size: 14px;
                    outline: none;
                }

                .search-input::placeholder {
                    color: var(--color-text-muted);
                }

                .search-icon {
                    color: var(--color-text-secondary);
                }

                .clear-btn {
                    background: none;
                    border: none;
                    color: var(--color-text-muted);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2px;
                    border-radius: 50%;
                }

                .clear-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: var(--color-text-primary);
                }
            `}</style>

            <form onSubmit={handleSubmit} className="search-form">
                <Search size={18} className="search-icon" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search games..."
                    className="search-input"
                />
                {query && (
                    <button type="button" className="clear-btn" onClick={handleClear}>
                        <X size={14} />
                    </button>
                )}
            </form>
        </div>
    );
};

export default SearchBar;
