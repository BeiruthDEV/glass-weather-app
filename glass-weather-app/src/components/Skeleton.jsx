import React from 'react';

const Skeleton = () => {
    return (
        <div className="flex-1 flex flex-col animate-in fade-in zoom-in duration-500 pt-8 space-y-8">

            {/* Skeleton: Cabeçalho (Cidade e Data) */}
            <div className="flex flex-col items-center space-y-4">
                <div className="h-8 w-48 bg-white/10 rounded-lg animate-pulse"></div> {/* Cidade */}
                <div className="h-4 w-32 bg-white/10 rounded-lg animate-pulse"></div> {/* Região */}
                <div className="h-10 w-24 bg-white/10 rounded-xl animate-pulse"></div> {/* Relógio */}
            </div>

            {/* Skeleton: Temperatura Principal */}
            <div className="flex flex-col items-center justify-center space-y-4 -mt-4">
                <div className="h-24 w-24 bg-white/10 rounded-full animate-pulse"></div> {/* Ícone */}
                <div className="h-24 w-40 bg-white/10 rounded-2xl animate-pulse"></div> {/* Temperatura */}
                <div className="h-6 w-24 bg-white/10 rounded-lg animate-pulse"></div> {/* Descrição */}
            </div>

            {/* Skeleton: Previsão Horária */}
            <div className="w-full space-y-3">
                <div className="h-4 w-32 bg-white/10 rounded animate-pulse ml-1"></div>
                <div className="flex gap-4 overflow-hidden">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="min-w-[70px] h-24 bg-white/5 rounded-2xl border border-white/5 animate-pulse"></div>
                    ))}
                </div>
            </div>

            {/* Skeleton: Detalhes (Grid) */}
            <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-24 bg-white/10 rounded-2xl border border-white/5 animate-pulse"></div>
                ))}
            </div>

            {/* Skeleton: Previsão 5 Dias */}
            <div className="bg-black/10 rounded-3xl p-4 border border-white/5 space-y-4">
                <div className="h-4 w-32 bg-white/10 rounded animate-pulse"></div>
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex justify-between">
                        <div className="h-4 w-8 bg-white/10 rounded animate-pulse"></div>
                        <div className="h-4 w-8 bg-white/10 rounded animate-pulse"></div>
                        <div className="h-4 w-24 bg-white/10 rounded animate-pulse"></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Skeleton;