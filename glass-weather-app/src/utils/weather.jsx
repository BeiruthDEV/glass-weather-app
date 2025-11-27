import React from 'react';
import { Cloud, Sun, Moon, CloudRain, CloudSnow, CloudLightning, CloudMoon } from 'lucide-react';

// Função para definir as cores do tema (Suporta Dia e Noite)
export const getWeatherTheme = (code, isDay = 1) => {
    if (code === undefined) return { bg: 'from-blue-400 to-blue-600', text: 'text-blue-100', iconColor: 'text-white' };

    // Se for NOITE (isDay === 0)
    if (isDay === 0) {
        if (code <= 3) return { bg: 'from-slate-900 via-purple-900 to-slate-900', text: 'text-purple-100', iconColor: 'text-purple-200' }; // Céu limpo/nublado noite
        if (code >= 51) return { bg: 'from-slate-900 via-blue-950 to-black', text: 'text-blue-200', iconColor: 'text-blue-400' }; // Chuva noite
        return { bg: 'from-gray-900 to-black', text: 'text-gray-200', iconColor: 'text-gray-400' }; // Padrão noite
    }

    // Se for DIA
    if (code === 0) return { bg: 'from-orange-400 to-amber-500', text: 'text-amber-100', iconColor: 'text-yellow-300' };
    if (code >= 1 && code <= 3) return { bg: 'from-slate-400 to-slate-600', text: 'text-slate-100', iconColor: 'text-slate-200' };
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return { bg: 'from-blue-700 to-slate-800', text: 'text-blue-200', iconColor: 'text-blue-300' };
    if (code >= 71 && code <= 77) return { bg: 'from-teal-100 to-teal-300', text: 'text-teal-700', iconColor: 'text-white' };
    if (code >= 95 && code <= 99) return { bg: 'from-indigo-800 to-purple-900', text: 'text-purple-200', iconColor: 'text-yellow-400' };

    return { bg: 'from-blue-500 to-cyan-600', text: 'text-blue-100', iconColor: 'text-white' };
};

// Função para retornar a descrição e o ícone (Com suporte a Lua!)
export const getWeatherInfo = (code, isDay = 1) => {
    const theme = getWeatherTheme(code, isDay);
    const iconClass = `w-24 h-24 drop-shadow-lg ${theme.iconColor}`;

    // Códigos de Clima (WMO)
    // 0: Céu limpo
    if (code === 0) {
        return isDay
            ? { desc: 'Ensolarado', icon: <Sun className={iconClass} /> }
            : { desc: 'Céu Limpo', icon: <Moon className={iconClass} /> };
    }

    // 1, 2, 3: Parcialmente nublado a encoberto
    if (code >= 1 && code <= 3) {
        return isDay
            ? { desc: 'Nublado', icon: <Cloud className={iconClass} /> }
            : { desc: 'Nublado', icon: <CloudMoon className={iconClass} /> };
    }

    // Chuvas
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return { desc: 'Chuvoso', icon: <CloudRain className={iconClass} /> };

    // Neve
    if (code >= 71 && code <= 77) return { desc: 'Neve', icon: <CloudSnow className={iconClass} /> };

    // Tempestade
    if (code >= 95 && code <= 99) return { desc: 'Tempestade', icon: <CloudLightning className={iconClass} /> };

    return { desc: 'Nublado', icon: <Cloud className={iconClass} /> };
};

// Converte temperatura
export const convertTemp = (temp, unit) => {
    if (unit === 'C') return Math.round(temp);
    return Math.round((temp * 9 / 5) + 32);
};

// Converte velocidade do vento
export const convertWind = (speed, unit) => {
    if (unit === 'C') return { value: Math.round(speed), unit: 'km/h' };
    // Converte km/h para mph
    return { value: Math.round(speed * 0.621371), unit: 'mph' };
};