import React from 'react';
import { RefreshCw } from 'lucide-react';

const Footer = ({ lastUpdated }) => {
    return (
        <div className="mt-8 pt-4 border-t border-white/10 flex flex-col items-center gap-2">
            {/* Selo de Fonte Oficial */}
            <div className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">
                Dados Oficiais via <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white/80 underline decoration-dotted">Open-Meteo API</a>
            </div>

            {/* Indicador de atualização em tempo real */}
            <div className="flex items-center gap-1.5 text-xs text-emerald-300/80 bg-emerald-900/20 px-3 py-1 rounded-full border border-emerald-500/10">
                <RefreshCw size={10} />
                <span>Atualizado às {lastUpdated}</span>
            </div>
        </div>
    );
};

export default Footer;