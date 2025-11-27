import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
// Importamos os tipos que criamos no passo anterior
import { WeatherData, ForecastItem, HourlyItem, CitySearchResult } from '../types/weather';

// Interface do retorno do Hook (o que ele devolve para quem o usa)
interface UseWeatherReturn {
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

export const useWeather = (): UseWeatherReturn => {
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [forecastData, setForecastData] = useState<ForecastItem[]>([]);
    const [hourlyData, setHourlyData] = useState<HourlyItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [unit, setUnit] = useState<'C' | 'F'>('C');
    const [lastUpdated, setLastUpdated] = useState<string>('');

    const lastLocationRef = useRef<any>(null);

    // 1. Carregar preferências salvas ao iniciar
    useEffect(() => {
        const loadPreferences = async () => {
            try {
                setLoading(true);
                const savedUnit = await AsyncStorage.getItem('@weather_unit');
                if (savedUnit === 'C' || savedUnit === 'F') setUnit(savedUnit);

                const savedLocation = await AsyncStorage.getItem('@weather_location');
                if (savedLocation) {
                    const { lat, lon, name, region, country } = JSON.parse(savedLocation);
                    await fetchWeatherData(lat, lon, name, region, country);
                }
            } catch (e) {
                console.log('Erro ao carregar preferências', e);
            } finally {
                setLoading(false);
            }
        };
        loadPreferences();
    }, []);

    // 2. Alternar Unidade e Salvar
    const toggleUnit = async () => {
        const newUnit = unit === 'C' ? 'F' : 'C';
        setUnit(newUnit);
        try {
            await AsyncStorage.setItem('@weather_unit', newUnit);
        } catch (e) {
            console.log('Erro ao salvar unidade', e);
        }
    };

    // 3. Lógica Central de Busca na API
    const fetchWeatherData = async (lat: number, lon: number, name: string, region: string, country: string) => {
        try {
            // Salva referência para o "Puxar para Atualizar"
            lastLocationRef.current = { lat, lon, name, region, country };

            // Salva no armazenamento local
            AsyncStorage.setItem('@weather_location', JSON.stringify({ lat, lon, name, region, country }));

            const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&hourly=temperature_2m,weather_code,precipitation_probability,is_day&timezone=auto`
            );

            if (!response.ok) throw new Error('Erro na API');
            const data = await response.json();

            // Processar Diário
            const daily = data.daily;
            const formattedForecast: ForecastItem[] = daily.time.map((time: string, index: number) => ({
                date: time,
                code: daily.weather_code[index],
                max: daily.temperature_2m_max[index],
                min: daily.temperature_2m_min[index],
            })).slice(1, 6);

            // Processar Horário
            const hourly = data.hourly;
            const currentHour = new Date().getHours();
            const formattedHourly: HourlyItem[] = hourly.time
                .map((time: string, index: number) => {
                    const date = new Date(time);
                    return {
                        time: date.getHours() + ':00',
                        fullDate: date,
                        temp: hourly.temperature_2m[index],
                        code: hourly.weather_code[index],
                        rain: hourly.precipitation_probability[index],
                        isDay: hourly.is_day[index],
                    };
                })
                .filter((item: HourlyItem) => {
                    const itemHour = item.fullDate.getHours();
                    const itemDay = item.fullDate.getDate();
                    const today = new Date().getDate();
                    return (itemDay === today && itemHour >= currentHour) || (itemDay > today);
                })
                .slice(0, 24);

            const now = new Date();
            setLastUpdated(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));

            setWeatherData({
                cityName: name,
                region: region,
                country: country,
                temperature: data.current.temperature_2m,
                feelsLike: data.current.apparent_temperature,
                humidity: data.current.relative_humidity_2m,
                weatherCode: data.current.weather_code,
                windSpeed: data.current.wind_speed_10m,
                isDay: data.current.is_day,
                timezone: data.timezone,
                sunrise: daily.sunrise[0],
                sunset: daily.sunset[0],
                uvIndex: daily.uv_index_max[0]
            });

            setForecastData(formattedForecast);
            setHourlyData(formattedHourly);

        } catch (err) {
            console.log(err);
            setError('Erro ao carregar dados do clima.');
        }
    };

    // 4. Buscar Cidades (Geocoding)
    const searchCity = async (cityName: string): Promise<CitySearchResult[] | null> => {
        if (!cityName.trim()) return null;
        setLoading(true);
        setError('');
        try {
            const geoResp = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=5&language=pt&format=json`);
            const geoData = await geoResp.json();

            if (!geoData.results?.length) {
                throw new Error('Nenhuma cidade encontrada.');
            }

            setLoading(false);
            return geoData.results;

        } catch (err: any) {
            setError(err.message || 'Erro na busca');
            setLoading(false);
            return null;
        }
    };

    // 5. Buscar GPS
    const fetchUserLocation = async () => {
        setLoading(true);
        setError('');
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setError('Permissão de localização negada');
                setLoading(false);
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            const geoResp = await fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&count=1&language=pt&format=json`);
            const geoData = await geoResp.json();

            let name = "Localização Atual";
            let admin1 = "GPS";
            let country = "--";

            if (geoData.results?.length) {
                name = geoData.results[0].name;
                admin1 = geoData.results[0].admin1;
                country = geoData.results[0].country_code;
            }
            await fetchWeatherData(latitude, longitude, name, admin1, country);

        } catch (err) {
            setError('Erro ao obter localização');
        } finally {
            setLoading(false);
        }
    };

    // 6. Carregar Clima (Wrapper público)
    const loadWeather = async (lat: number, lon: number, name: string, admin1: string, country: string) => {
        setLoading(true);
        await fetchWeatherData(lat, lon, name, admin1, country);
        setLoading(false);
    };

    return {
        weatherData,
        forecastData,
        hourlyData,
        loading,
        error,
        unit,
        lastUpdated,
        toggleUnit,
        searchCity,
        loadWeather,
        fetchUserLocation,
        lastLocationRef
    };
};