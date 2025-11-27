import React from 'react';
import { getWeatherInfo, convertTemp } from '../utils/weather';

const HourlyForecast = ({ data, unit }) => {
    return (
        <div className="mt-6 mb-6">
            <h3 className="text-white/80 text-sm font-semibold mb-3 ml-1 uppercase tracking-wider">
                Previsão Horária
            </h3>
            {/* Container com scroll horizontal */}
            <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x">
                {data.map((hour, index) => {
                    const { icon } = getWeatherInfo(hour.code, hour.isDay);

                    return (
                        <div
                            key={index}
                            className="min-w-[70px] bg-white/5 rounded-2xl p-3 backdrop-blur-sm border border-white/5 flex flex-col items-center justify-center gap-2 snap-start"
                        >
                            <span className="text-xs text-white/70 font-medium">
                                {hour.time}
                            </span>

                            <div className="transform scale-75">
                                {React.cloneElement(icon, { className: "w-8 h-8 text-white drop-shadow" })}
                            </div>

                            <span className="text-sm font-bold text-white">
                                {convertTemp(hour.temp, unit)}°
                            </span>

                            {/* Chance de chuva se for maior que 0 */}
                            {hour.rain > 0 && (
                                <span className="text-[10px] text-blue-200 font-bold">
                                    {hour.rain}%
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default HourlyForecast;