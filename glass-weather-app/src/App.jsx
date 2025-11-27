import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import { getWeatherTheme } from './utils/weather';
import SearchBar from './components/SearchBar';
import CurrentWeather from './components/CurrentWeather';
import WeatherDetails from './components/WeatherDetails';
import Forecast from './components/Forecast';
import HourlyForecast from './components/HourlyForecast';
import Footer from './components/Footer';
import Skeleton from './components/Skeleton';

const WeatherApp = () => {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unit, setUnit] = useState('C');

  // Alterna entre Celsius e Fahrenheit
  const toggleUnit = () => {
    setUnit((prev) => (prev === 'C' ? 'F' : 'C'));
  };

  // Função centralizada que busca o clima (API Completa)
  const fetchWeatherData = async (lat, lon, name, region, country) => {
    try {
      // URL com todos os parâmetros necessários: current, daily, hourly, timezone, is_day
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&hourly=temperature_2m,weather_code,precipitation_probability,is_day&timezone=auto`
      );

      if (!weatherResponse.ok) throw new Error('Erro na API de clima');

      const weatherResult = await weatherResponse.json();
      const current = weatherResult.current;
      const daily = weatherResult.daily;
      const hourly = weatherResult.hourly;

      // 1. Processar Previsão Diária (Próximos 5 dias)
      const formattedForecast = daily.time.map((time, index) => ({
        date: time,
        code: daily.weather_code[index],
        max: daily.temperature_2m_max[index],
        min: daily.temperature_2m_min[index],
      })).slice(1, 6);

      // 2. Processar Previsão Horária (Próximas 24h a partir de agora)
      const currentHour = new Date().getHours();
      const formattedHourly = hourly.time
        .map((time, index) => {
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
        .filter(item => {
          const itemHour = item.fullDate.getHours();
          const itemDay = item.fullDate.getDate();
          const today = new Date().getDate();
          // Filtra apenas horas futuras de hoje ou dias seguintes
          return (itemDay === today && itemHour >= currentHour) || (itemDay > today);
        })
        .slice(0, 24);

      // 3. Atualizar hora da última atualização
      const now = new Date();
      setLastUpdated(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));

      // 4. Salvar Dados Principais
      setWeatherData({
        cityName: name,
        region: region,
        country: country,
        temperature: current.temperature_2m,
        feelsLike: current.apparent_temperature,
        humidity: current.relative_humidity_2m,
        weatherCode: current.weather_code,
        windSpeed: current.wind_speed_10m,
        isDay: current.is_day,
        timezone: weatherResult.timezone,
        sunrise: daily.sunrise[0],
        sunset: daily.sunset[0],
        uvIndex: daily.uv_index_max[0]
      });

      setForecastData(formattedForecast);
      setHourlyData(formattedHourly);

    } catch (err) {
      console.error("Erro no fetchWeatherData:", err);
      throw new Error('Erro ao buscar dados do clima.');
    } finally {
      setLoading(false);
    }
  };

  // Busca por Nome da Cidade (Manual)
  const fetchWeather = async () => {
    if (!city) return;
    setLoading(true);
    setError('');

    try {
      const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=pt&format=json`);
      const geoData = await geoResponse.json();

      if (!geoData.results || geoData.results.length === 0) throw new Error('Cidade não encontrada.');

      const { latitude, longitude, name, admin1, country_code } = geoData.results[0];
      await fetchWeatherData(latitude, longitude, name, admin1, country_code);

    } catch (err) {
      console.error("Erro no fetchWeather manual:", err);
      setError(err.message || 'Erro de conexão.');
      setLoading(false);
    }
  };

  // Busca por Geolocalização (GPS)
  const handleLocationClick = () => {
    if (!navigator.geolocation) {
      setError('Seu navegador não suporta geolocalização.');
      return;
    }

    setLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Tenta descobrir o nome da cidade
          const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&count=1&language=pt&format=json`
          );

          if (geoResponse.ok) {
            const geoData = await geoResponse.json();
            if (geoData.results && geoData.results.length > 0) {
              const { name, admin1, country_code } = geoData.results[0];
              setCity(name);
              await fetchWeatherData(latitude, longitude, name, admin1, country_code);
              return;
            }
          }
          // Fallback: Se não achar o nome, usa coordenadas
          console.warn("Nome da cidade não encontrado, usando coordenadas diretas.");
          setCity("Sua Localização");
          await fetchWeatherData(latitude, longitude, "Localização Atual", "GPS", "--");
        } catch (err) {
          console.error("Erro no processo de GPS:", err);
          try {
            await fetchWeatherData(latitude, longitude, "Localização Detectada", "GPS", "--");
          } catch (weatherErr) {
            setError(`Erro ao obter dados: ${err.message}`);
          }
        }
      },
      (error) => {
        console.error("Erro de permissão/GPS:", error);
        let msg = 'Erro desconhecido de GPS.';
        if (error.code === 1) msg = 'Você negou a permissão de localização.';
        if (error.code === 2) msg = 'Sinal de GPS indisponível.';
        if (error.code === 3) msg = 'Tempo limite esgotado ao buscar GPS.';
        setError(msg);
        setLoading(false);
      }
    );
  };

  // Define o tema baseado no clima e se é dia/noite
  const theme = getWeatherTheme(weatherData?.weatherCode, weatherData?.isDay);

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 font-sans transition-all duration-700 bg-gradient-to-br ${theme.bg}`}>
      {/* Container Principal */}
      <div className="w-full max-w-[420px] bg-white/20 backdrop-blur-xl rounded-[40px] shadow-2xl overflow-hidden border border-white/30 text-white relative transition-all duration-500">

        <SearchBar
          city={city}
          setCity={setCity}
          onSearch={fetchWeather}
          onLocation={handleLocationClick}
          loading={loading}
          error={error}
        />

        <div className="min-h-[800px] flex flex-col p-6 pt-24 relative">

          {/* 1. Loading State (Skeleton) */}
          {loading && <Skeleton />}

          {/* 2. Empty State (Tela Inicial) */}
          {!loading && !weatherData && (
            <div className="flex-1 flex flex-col items-center justify-center text-white/70 space-y-4 animate-in fade-in zoom-in">
              <MapPin size={48} className="animate-bounce opacity-50" />
              <p className="text-lg font-light">Explore o clima pelo mundo</p>
            </div>
          )}

          {/* 3. Success State (Dados do Clima) */}
          {!loading && weatherData && (
            <div className="animate-in fade-in zoom-in duration-500 flex flex-col h-full">

              <CurrentWeather
                data={weatherData}
                unit={unit}
                toggleUnit={toggleUnit}
              />

              {hourlyData.length > 0 && (
                <HourlyForecast data={hourlyData} unit={unit} />
              )}

              <WeatherDetails data={weatherData} unit={unit} />

              {forecastData.length > 0 && (
                <Forecast data={forecastData} unit={unit} />
              )}

              <Footer lastUpdated={lastUpdated} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeatherApp;