import React, { createContext, useContext, ReactNode } from 'react';
import { useWeather } from '../hooks/useWeather';
import { WeatherData, ForecastItem, HourlyItem, CitySearchResult } from '../types/weather';

// Definindo o formato do nosso Contexto
interface WeatherContextData {
    weatherData: WeatherData | null;
    forecastData: ForecastItem[];
    hourlyData: HourlyItem[];
    loading: boolean;
    error: string;
    unit: 'C' | 'F';
    lastUpdated: string;
    toggleUnit: () => void;
    searchCity: (cityName: string) => Promise<CitySearchResult[] | null>;
    loadWeather: (lat: number, lon: number, name: string, admin1: string, country: string) => Promise<void>;
    fetchUserLocation: () => Promise<void>;
    lastLocationRef: React.MutableRefObject<any>;
}

// Criando o Contexto
const WeatherContext = createContext<WeatherContextData>({} as WeatherContextData);

// Criando o Provider (o componente que vai envolver o App)
export const WeatherProvider = ({ children }: { children: ReactNode }) => {
    // Aqui usamos o Hook que já criamos!
    const weatherHook = useWeather();

    return (
        <WeatherContext.Provider value={weatherHook}>
            {children}
        </WeatherContext.Provider>
    );
};

// Hook personalizado para facilitar o uso do contexto
export const useWeatherContext = () => {
    const context = useContext(WeatherContext);
    if (!context) {
        throw new Error('useWeatherContext deve ser usado dentro de um WeatherProvider');
    }
    return context;
};