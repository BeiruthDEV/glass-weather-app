import React, { useState } from 'react';
import { Search, Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind, MapPin, Loader2, Droplets, ThermometerSun } from 'lucide-react';

const WeatherApp = () => {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getWeatherTheme = (code) => {
    if (code === undefined) return { bg: 'from-blue-400 to-blue-600', text: 'text-blue-100', iconColor: 'text-white' };
    if (code === 0) return { bg: 'from-orange-400 to-amber-500', text: 'text-amber-100', iconColor: 'text-yellow-300' };
    if (code >= 1 && code <= 3) return { bg: 'from-slate-400 to-slate-600', text: 'text-slate-100', iconColor: 'text-slate-200' };
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return { bg: 'from-blue-700 to-slate-800', text: 'text-blue-200', iconColor: 'text-blue-300' };
    if (code >= 71 && code <= 77) return { bg: 'from-teal-100 to-teal-300', text: 'text-teal-700', iconColor: 'text-white' };
    if (code >= 95 && code <= 99) return { bg: 'from-indigo-800 to-purple-900', text: 'text-purple-200', iconColor: 'text-yellow-400' };
    return { bg: 'from-blue-500 to-cyan-600', text: 'text-blue-100', iconColor: 'text-white' };
  };

  const getWeatherInfo = (code) => {
    const theme = getWeatherTheme(code);
    const iconClass = `w-24 h-24 drop-shadow-lg ${theme.iconColor}`;
    if (code === 0) return { desc: 'Ensolarado', icon: <Sun className={iconClass} /> };
    if (code >= 1 && code <= 3) return { desc: 'Nublado', icon: <Cloud className={iconClass} /> };
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return { desc: 'Chuvoso', icon: <CloudRain className={iconClass} /> };
    if (code >= 71 && code <= 77) return { desc: 'Neve', icon: <CloudSnow className={iconClass} /> };
    if (code >= 95 && code <= 99) return { desc: 'Tempestade', icon: <CloudLightning className={iconClass} /> };
    return { desc: 'Nublado', icon: <Cloud className={iconClass} /> };
  };

  const fetchWeather = async () => {
    if (!city) return;
    setLoading(true);
    setError('');

    try {
      const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=pt&format=json`);
      const geoData = await geoResponse.json();

      if (!geoData.results || geoData.results.length === 0) throw new Error('Cidade não encontrada.');

      const { latitude, longitude, name, admin1, country_code } = geoData.results[0];

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m`
      );
      const weatherResult = await weatherResponse.json();
      const current = weatherResult.current;

      setWeatherData({
        cityName: name,
        region: admin1,
        country: country_code,
        temperature: current.temperature_2m,
        feelsLike: current.apparent_temperature,
        humidity: current.relative_humidity_2m,
        weatherCode: current.weather_code,
        windSpeed: current.wind_speed_10m
      });
    } catch (err) {
      setError(err.message || 'Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => { if (e.key === 'Enter') fetchWeather(); };
  const theme = getWeatherTheme(weatherData?.weatherCode);

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 font-sans transition-all duration-700 bg-gradient-to-br ${theme.bg}`}>
      <div className="w-full max-w-[360px] bg-white/20 backdrop-blur-xl rounded-[40px] shadow-2xl overflow-hidden border border-white/30 text-white relative">
        <div className="absolute top-6 left-6 right-6 z-20">
          <div className="relative group">
            <input
              type="text"
              placeholder="Buscar cidade..."
              className="w-full pl-5 pr-12 py-3.5 bg-black/20 border border-white/10 rounded-2xl focus:outline-none focus:bg-black/30 transition-all text-white placeholder-white/60 backdrop-blur-sm"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button
              onClick={fetchWeather}
              disabled={loading}
              className="absolute right-2 top-2 p-1.5 bg-white/20 rounded-xl hover:bg-white/30 transition-colors disabled:opacity-50 text-white"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
            </button>
          </div>
          {error && <div className="mt-2 bg-red-500/80 backdrop-blur text-white text-xs py-2 px-4 rounded-xl text-center animate-in fade-in slide-in-from-top-2">{error}</div>}
        </div>

        <div className="min-h-[640px] flex flex-col justify-between p-6 pt-24 relative">
          {!weatherData && !loading && (
            <div className="flex-1 flex flex-col items-center justify-center text-white/70 space-y-4">
              <MapPin size={48} className="animate-bounce opacity-50" />
              <p className="text-lg font-light">Explore o clima pelo mundo</p>
            </div>
          )}

          {!loading && weatherData && (
            <div className="flex-1 flex flex-col animate-in fade-in zoom-in duration-500">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold tracking-tight drop-shadow-md">{weatherData.cityName}</h2>
                <p className="text-sm font-medium text-white/80 uppercase tracking-widest mt-1">{weatherData.region}, {weatherData.country}</p>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center -mt-6">
                <div className="mb-2 transform transition-transform hover:scale-110 duration-500">{getWeatherInfo(weatherData.weatherCode).icon}</div>
                <div className="relative">
                  <span className="text-8xl font-black tracking-tighter drop-shadow-xl">{Math.round(weatherData.temperature)}°</span>
                  <div className="text-center text-xl font-medium mt-[-10px] text-white/90">{getWeatherInfo(weatherData.weatherCode).desc}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-8">
                <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-md border border-white/10 flex flex-col items-center justify-center gap-1">
                  <Wind size={20} className="text-white/80" />
                  <span className="text-sm font-bold">{Math.round(weatherData.windSpeed)}</span>
                  <span className="text-[10px] text-white/60 uppercase">km/h</span>
                </div>
                <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-md border border-white/10 flex flex-col items-center justify-center gap-1">
                  <Droplets size={20} className="text-white/80" />
                  <span className="text-sm font-bold">{weatherData.humidity}%</span>
                  <span className="text-[10px] text-white/60 uppercase">Umidade</span>
                </div>
                <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-md border border-white/10 flex flex-col items-center justify-center gap-1">
                  <ThermometerSun size={20} className="text-white/80" />
                  <span className="text-sm font-bold">{Math.round(weatherData.feelsLike)}°</span>
                  <span className="text-[10px] text-white/60 uppercase">Sensação</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeatherApp;