import React from 'react';
import { Wind, Droplets, ThermometerSun } from 'lucide-react';
import { convertTemp, convertWind } from '../utils/weather'; // Importar conversões

const WeatherDetails = ({ data, unit }) => { // Receber unit
    const windInfo = convertWind(data.windSpeed, unit); // Converter vento

    return (
        <div className="grid grid-cols-3 gap-3 mt-8">
            <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-md border border-white/10 flex flex-col items-center justify-center gap-1">
                <Wind size={20} className="text-white/80" />
                {/* Vento Convertido */}
                <span className="text-sm font-bold">{windInfo.value}</span>
                <span className="text-[10px] text-white/60 uppercase">{windInfo.unit}</span>
            </div>
            <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-md border border-white/10 flex flex-col items-center justify-center gap-1">
                <Droplets size={20} className="text-white/80" />
                <span className="text-sm font-bold">{data.humidity}%</span>
                <span className="text-[10px] text-white/60 uppercase">Umidade</span>
            </div>
            <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-md border border-white/10 flex flex-col items-center justify-center gap-1">
                <ThermometerSun size={20} className="text-white/80" />
                {/* Sensação Convertida */}
                <span className="text-sm font-bold">{convertTemp(data.feelsLike, unit)}°</span>
                <span className="text-[10px] text-white/60 uppercase">Sensação</span>
            </div>
        </div>
    );
};

export default WeatherDetails;