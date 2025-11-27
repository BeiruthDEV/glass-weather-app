import React from 'react';

import { Cloud, Sun, Moon, CloudRain, CloudSnow, CloudLightning, CloudMoon, CloudFog } from 'lucide-react-native';


export const getWeatherTheme = (code: number | undefined, isDay: number = 1): string[] => {
    if (code === undefined) return ['#3B82F6', '#2563EB'];


    if (isDay === 0) {
        if (code <= 3) return ['#2E1065', '#4C1D95', '#0F172A']; // Roxo profundo
        if (code >= 51) return ['#172554', '#1E1B4B', '#020617']; // Chuva noturna
        return ['#111827', '#312E81', '#000000']; // Padrão noite
    }


    if (code === 0) return ['#FBBF24', '#F97316', '#C2410C']; // Ensolarado
    if (code >= 1 && code <= 3) return ['#94A3B8', '#64748B', '#334155']; // Nublado (Cinza metálico)
    if (code >= 45 && code <= 48) return ['#CBD5E1', '#94A3B8', '#64748B']; // Nevoeiro
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return ['#3B82F6', '#1D4ED8', '#172554']; // Chuva
    if (code >= 71 && code <= 86) return ['#A5F3FC', '#22D3EE', '#0891B2']; // Neve
    if (code >= 95) return ['#7C3AED', '#4338CA', '#312E81']; // Tempestade

    return ['#3B82F6', '#0891B2']; // Padrão dia
};


export interface WeatherInfo {
    desc: string;
    icon: React.JSX.Element;
}


export const getWeatherInfo = (code: number, isDay: number = 1): WeatherInfo => {
    const iconColor = "white";
    const iconSize = 90;


    const icons = {
        sun: <Sun size={iconSize} color={iconColor} />,
        moon: <Moon size={iconSize} color={iconColor} />,
        cloud: <Cloud size={iconSize} color={iconColor} />,
        cloudMoon: <CloudMoon size={iconSize} color={iconColor} />,
        rain: <CloudRain size={iconSize} color={iconColor} />,
        snow: <CloudSnow size={iconSize} color={iconColor} />,
        storm: <CloudLightning size={iconSize} color={iconColor} />,
        fog: <CloudFog color={iconColor} size={iconSize} style={{ opacity: 0.7 }
        } />,
    };


    switch (code) {
        case 0:
            return {
                desc: isDay ? 'Céu Limpo' : 'Noite Estrelada',
                icon: isDay ? icons.sun : icons.moon
            };

        case 1:
            return {
                desc: isDay ? 'Quase Limpo' : 'Poucas Nuvens',
                icon: isDay ? icons.sun : icons.moon
            };

        case 2:
            return {
                desc: 'Parcialmente Nublado',
                icon: isDay ? icons.cloud : icons.cloudMoon
            };

        case 3:
            return { desc: 'Encoberto', icon: icons.cloud };

        case 45:
        case 48:
            return { desc: 'Nevoeiro', icon: icons.fog };

        case 51: return { desc: 'Chuvisco Leve', icon: icons.rain };
        case 53: return { desc: 'Chuvisco Moderado', icon: icons.rain };
        case 55: return { desc: 'Chuvisco Denso', icon: icons.rain };

        case 61: return { desc: 'Chuva Fraca', icon: icons.rain };
        case 63: return { desc: 'Chuva Moderada', icon: icons.rain };
        case 65: return { desc: 'Chuva Forte', icon: icons.rain };

        case 71: return { desc: 'Neve Fraca', icon: icons.snow };
        case 73: return { desc: 'Neve Moderada', icon: icons.snow };
        case 75: return { desc: 'Neve Forte', icon: icons.snow };
        case 77: return { desc: 'Granizo Fino', icon: icons.snow };

        case 80: return { desc: 'Pancadas de Chuva', icon: icons.rain };
        case 81: return { desc: 'Pancadas Fortes', icon: icons.rain };
        case 82: return { desc: 'Tempestade Violenta', icon: icons.rain };

        case 85: return { desc: 'Pancadas de Neve', icon: icons.snow };
        case 86: return { desc: 'Neve Intensa', icon: icons.snow };

        case 95: return { desc: 'Tempestade', icon: icons.storm };
        case 96: return { desc: 'Tempestade c/ Granizo', icon: icons.storm };
        case 99: return { desc: 'Tempestade Severa', icon: icons.storm };

        default:
            return { desc: 'Clima Desconhecido', icon: icons.cloud };
    }
};



export const convertTemp = (temp: number, unit: 'C' | 'F'): number => {
    if (unit === 'C') return Math.round(temp);
    return Math.round((temp * 9 / 5) + 32);
};


export const convertWind = (speed: number, unit: 'C' | 'F'): { value: number; unit: string } => {
    if (unit === 'C') return { value: Math.round(speed), unit: 'km/h' };
    return { value: Math.round(speed * 0.621371), unit: 'mph' };
};