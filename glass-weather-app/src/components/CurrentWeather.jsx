import React, { useState, useEffect } from 'react';
import { getWeatherInfo, convertTemp } from '../utils/weather'; // Importar convertTemp

const CurrentWeather = ({ data, unit, toggleUnit }) => { // Receber unit e toggleUnit
    const { icon, desc } = getWeatherInfo(data.weatherCode, data.isDay);
    const [time, setTime] = useState('');
    const [date, setDate] = useState('');

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const timeString = new Intl.DateTimeFormat('pt-BR', {
                hour: '2-digit', minute: '2-digit', timeZone: data.timezone,
            }).format(now);
            const dateString = new Intl.DateTimeFormat('pt-BR', {
                weekday: 'long', day: 'numeric', month: 'long', timeZone: data.timezone,
            }).format(now);
            setTime(timeString);
            setDate(dateString);
        };
        updateTime();
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, [data.timezone]);

    return (
        <div className="flex-1 flex flex-col animate-in fade-in zoom-in duration-500 pt-8">
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold tracking-tight drop-shadow-md text-white">{data.cityName}</h2>
                <p className="text-xs font-medium text-white/80 uppercase tracking-widest mt-1 mb-2">
                    {data.region}, {data.country}
                </p>
                <div className="inline-flex flex-col items-center bg-black/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/5">
                    <span className="text-2xl font-semibold text-white">{time}</span>
                    <span className="text-xs text-white/80 capitalize">{date}</span>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center -mt-4">
                <div className="mb-2 transform transition-transform hover:scale-110 duration-500 filter drop-shadow-2xl">
                    {icon}
                </div>
                <div className="relative flex flex-col items-center">
                    {/* Temperatura com conversão */}
                    <span className="text-8xl font-black tracking-tighter text-white drop-shadow-xl cursor-pointer select-none flex" onClick={toggleUnit} title="Clique para trocar a unidade">
                        {convertTemp(data.temperature, unit)}
                        <span className="text-4xl mt-4 opacity-50 font-light">°{unit}</span>
                    </span>
                    <div className="text-xl font-medium -mt-2 text-white/90">
                        {desc}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CurrentWeather;