import React from 'react';
import { Search, Loader2, MapPin } from 'lucide-react';

const SearchBar = ({ city, setCity, onSearch, onLocation, loading, error }) => {
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') onSearch();
    };

    return (
        <div className="absolute top-6 left-6 right-6 z-20">
            <div className="relative group flex gap-2">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="Buscar cidade..."
                        className="w-full pl-5 pr-12 py-3.5 bg-black/20 border border-white/10 rounded-2xl focus:outline-none focus:bg-black/30 transition-all text-white placeholder-white/60 backdrop-blur-sm"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        onKeyDown={handleKeyPress}
                    />
                    <button
                        onClick={onSearch}
                        disabled={loading}
                        className="absolute right-2 top-2 p-1.5 bg-white/20 rounded-xl hover:bg-white/30 transition-colors disabled:opacity-50 text-white"
                    >
                        {loading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
                    </button>
                </div>

                <button
                    onClick={onLocation}
                    disabled={loading}
                    className="p-3.5 bg-white/10 border border-white/10 rounded-2xl hover:bg-white/20 transition-all disabled:opacity-50 text-white backdrop-blur-sm group/loc"
                    title="Usar minha localização"
                >
                    <MapPin size={24} className="group-hover/loc:animate-bounce" />
                </button>
            </div>

            {error && (
                <div className="mt-2 bg-red-500/80 backdrop-blur text-white text-xs py-2 px-4 rounded-xl text-center animate-in fade-in slide-in-from-top-2">
                    {error}
                </div>
            )}
        </div>
    );
};

export default SearchBar;