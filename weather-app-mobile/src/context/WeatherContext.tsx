import React, { createContext, useContext, ReactNode } from 'react';
import { useWeather } from '../hooks/useWeather';
import { WeatherData, ForecastItem, HourlyItem, CitySearchResult } from '../types/weather';


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


const WeatherContext = createContext<WeatherContextData>({} as WeatherContextData);


export const WeatherProvider = ({ children }: { children: ReactNode }) => {

    const weatherHook = useWeather();

    return (
        <WeatherContext.Provider value={weatherHook}>
            {children}
        </WeatherContext.Provider>
    );
};


export const useWeatherContext = () => {
    const context = useContext(WeatherContext);
    if (!context) {
        throw new Error('useWeatherContext deve ser usado dentro de um WeatherProvider');
    }
    return context;
};