import React from 'react';
import { getWeatherInfo, convertTemp } from '../utils/weather'; // Importar convertTemp

const Forecast = ({ data, unit }) => { // Receber unit
    const getDayName = (dateString) => {
        const date = new Date(dateString + 'T00:00:00');
        return new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(date).slice(0, 3);
    };

    return (
        <div className="mt-6 bg-black/10 rounded-3xl p-4 backdrop-blur-sm border border-white/5">
            <h3 className="text-white/80 text-sm font-semibold mb-3 ml-1 uppercase tracking-wider">
                Próximos 5 Dias
            </h3>
            <div className="space-y-3">
                {data.map((day, index) => {
                    const { icon } = getWeatherInfo(day.code);
                    return (
                        <div key={index} className="flex items-center justify-between text-white">
                            <span className="w-10 font-medium text-white/90 capitalize text-sm">
                                {getDayName(day.date)}
                            </span>

                            <div className="flex items-center justify-center w-8">
                                {React.cloneElement(icon, { className: "w-6 h-6 text-white drop-shadow" })}
                            </div>

                            <div className="flex items-center gap-3 text-sm font-bold w-24 justify-end">
                                {/* Mínima e Máxima convertidas */}
                                <span className="text-white/60">{convertTemp(day.min, unit)}°</span>
                                <div className="w-12 h-1 bg-white/20 rounded-full overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-yellow-300 opacity-50"></div>
                                </div>
                                <span>{convertTemp(day.max, unit)}°</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Forecast;