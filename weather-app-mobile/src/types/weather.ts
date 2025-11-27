// Definição dos formatos de dados que usamos no App

export interface WeatherData {
    cityName: string;
    region: string;
    country: string;
    temperature: number;
    feelsLike: number;
    humidity: number;
    weatherCode: number;
    windSpeed: number;
    isDay: number;
    timezone: string;
    sunrise: string;
    sunset: string;
    uvIndex: number;
}

export interface ForecastItem {
    date: string;
    code: number;
    max: number;
    min: number;
}

export interface HourlyItem {
    time: string;
    fullDate: Date; // Note que aqui guardamos o objeto Date
    temp: number;
    code: number;
    rain: number;
    isDay: number;
}

// Interface para o resultado da busca de cidades
export interface CitySearchResult {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    admin1?: string;
    country_code?: string;
    country?: string;
}