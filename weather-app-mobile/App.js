import React, { useState, useCallback, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar, Modal, FlatList, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage'; // <--- IMPORTANTE
import { Search, MapPin, Wind, Droplets, ThermometerSun, RefreshCw, X, ChevronRight, Sun, Moon, SunDim } from 'lucide-react-native';
import { getWeatherTheme, getWeatherInfo, convertTemp, convertWind } from './src/utils/weather';

export default function App() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [unit, setUnit] = useState('C');
  const [lastUpdated, setLastUpdated] = useState('');

  const [searchResults, setSearchResults] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  const lastLocationRef = useRef(null);

  // --- 1. CARREGAR PREFERÊNCIAS AO INICIAR ---
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setLoading(true);
        // Carregar Unidade
        const savedUnit = await AsyncStorage.getItem('@weather_unit');
        if (savedUnit) setUnit(savedUnit);

        // Carregar Última Localização
        const savedLocation = await AsyncStorage.getItem('@weather_location');
        if (savedLocation) {
          const { lat, lon, name, region, country } = JSON.parse(savedLocation);
          // Se tiver salvo, carrega o clima direto
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

  // --- 2. SALVAR UNIDADE AO TROCAR ---
  const toggleUnit = async () => {
    const newUnit = unit === 'C' ? 'F' : 'C';
    setUnit(newUnit);
    try {
      await AsyncStorage.setItem('@weather_unit', newUnit);
    } catch (e) {
      console.log('Erro ao salvar unidade', e);
    }
  };

  // Formata hora
  const formatTime = (isoString, timezone) => {
    if (!isoString) return '--:--';
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit', minute: '2-digit', timeZone: timezone,
    }).format(date);
  };

  const fetchWeatherData = async (lat, lon, name, region, country) => {
    try {
      // Salva referência para Refresh
      lastLocationRef.current = { lat, lon, name, region, country };

      // --- 3. SALVAR LOCALIZAÇÃO NO ARMAZENAMENTO ---
      AsyncStorage.setItem('@weather_location', JSON.stringify({ lat, lon, name, region, country }));

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&hourly=temperature_2m,weather_code,precipitation_probability,is_day&timezone=auto`
      );
      if (!response.ok) throw new Error('Erro na API');
      const data = await response.json();

      // Processar Diário
      const daily = data.daily;
      const formattedForecast = daily.time.map((time, index) => ({
        date: time,
        code: daily.weather_code[index],
        max: daily.temperature_2m_max[index],
        min: daily.temperature_2m_min[index],
      })).slice(1, 6);

      // Processar Horário
      const hourly = data.hourly;
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
      setCity(name);

    } catch (err) {
      console.log(err);
      setError('Erro ao carregar dados do clima.');
    }
  };

  const onRefresh = useCallback(async () => {
    if (lastLocationRef.current) {
      setRefreshing(true);
      const { lat, lon, name, region, country } = lastLocationRef.current;
      await fetchWeatherData(lat, lon, name, region, country);
      setRefreshing(false);
    }
  }, []);

  const loadWeather = async (lat, lon, name, admin1, country) => {
    setLoading(true);
    setModalVisible(false);
    await fetchWeatherData(lat, lon, name, admin1, country);
    setLoading(false);
  };

  const searchCities = async () => {
    if (!city.trim()) return;
    setLoading(true);
    setError('');
    try {
      const geoResp = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=5&language=pt&format=json`);
      const geoData = await geoResp.json();

      if (!geoData.results?.length) {
        throw new Error('Nenhuma cidade encontrada.');
      }

      if (geoData.results.length === 1) {
        const { latitude, longitude, name, admin1, country_code } = geoData.results[0];
        loadWeather(latitude, longitude, name, admin1, country_code);
      } else {
        setSearchResults(geoData.results);
        setModalVisible(true);
        setLoading(false);
      }

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleLocation = async () => {
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
      loadWeather(latitude, longitude, name, admin1, country);

    } catch (err) {
      setError('Erro ao obter localização');
      setLoading(false);
    }
  };

  const themeColors = getWeatherTheme(weatherData?.weatherCode, weatherData?.isDay);
  const weatherInfo = weatherData ? getWeatherInfo(weatherData.weatherCode, weatherData.isDay) : null;

  return (
    <LinearGradient colors={themeColors} style={styles.container}>
      <StatusBar barStyle="light-content" />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione a Cidade</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={searchResults}
              keyExtractor={(item) => `${item.id}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.cityItem}
                  onPress={() => loadWeather(item.latitude, item.longitude, item.name, item.admin1, item.country_code)}
                >
                  <View>
                    <Text style={styles.cityNameList}>{item.name}</Text>
                    <Text style={styles.cityDetailsList}>
                      {[item.admin1, item.country].filter(Boolean).join(', ')}
                    </Text>
                  </View>
                  <ChevronRight size={20} color="#ccc" />
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
          }
        >

          <View style={styles.searchContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Buscar cidade..."
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={city}
                onChangeText={setCity}
                onSubmitEditing={searchCities}
                returnKeyType="search"
              />
              <TouchableOpacity onPress={searchCities} style={styles.searchIcon}>
                <Search size={20} color="white" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={handleLocation} style={styles.locButton}>
              <MapPin size={24} color="white" />
            </TouchableOpacity>
          </View>

          {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

          {loading && !refreshing && <ActivityIndicator size="large" color="#fff" style={{ marginTop: 50 }} />}

          {!loading && !weatherData && (
            <View style={styles.emptyState}>
              <MapPin size={64} color="rgba(255,255,255,0.5)" />
              <Text style={styles.emptyText}>Explore o clima pelo mundo</Text>
            </View>
          )}

          {!loading && weatherData && (
            <View style={styles.content}>
              <View style={styles.header}>
                <Text style={styles.cityName}>{weatherData.cityName}</Text>
                <Text style={styles.region}>{weatherData.region}, {weatherData.country}</Text>
              </View>

              <View style={styles.currentWeather}>
                {weatherInfo.icon}
                <TouchableOpacity onPress={toggleUnit}>
                  <Text style={styles.temp}>{convertTemp(weatherData.temperature, unit)}°{unit}</Text>
                </TouchableOpacity>
                <Text style={styles.condition}>{weatherInfo.desc}</Text>
              </View>

              {hourlyData.length > 0 && (
                <View style={styles.hourlyContainer}>
                  <Text style={styles.sectionTitle}>Previsão Horária</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                    {hourlyData.map((hour, index) => (
                      <View key={index} style={styles.hourlyCard}>
                        <Text style={styles.hourlyTime}>{hour.time}</Text>
                        <View style={{ transform: [{ scale: 0.5 }] }}>
                          {getWeatherInfo(hour.code, hour.isDay).icon}
                        </View>
                        <Text style={styles.hourlyTemp}>{convertTemp(hour.temp, unit)}°</Text>
                        {hour.rain > 0 && <Text style={styles.hourlyRain}>{hour.rain}%</Text>}
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}

              <View style={styles.detailsGrid}>
                <View style={styles.card}>
                  <Wind size={24} color="white" />
                  <Text style={styles.cardValue}>{convertWind(weatherData.windSpeed, unit).value}</Text>
                  <Text style={styles.cardLabel}>{convertWind(weatherData.windSpeed, unit).unit}</Text>
                </View>
                <View style={styles.card}>
                  <Droplets size={24} color="white" />
                  <Text style={styles.cardValue}>{weatherData.humidity}%</Text>
                  <Text style={styles.cardLabel}>Umidade</Text>
                </View>
                <View style={styles.card}>
                  <ThermometerSun size={24} color="white" />
                  <Text style={styles.cardValue}>{convertTemp(weatherData.feelsLike, unit)}°</Text>
                  <Text style={styles.cardLabel}>Sensação</Text>
                </View>
                <View style={styles.card}>
                  <SunDim size={24} color="white" />
                  <Text style={styles.cardValue}>{weatherData.uvIndex}</Text>
                  <Text style={styles.cardLabel}>Índice UV</Text>
                </View>
                <View style={styles.card}>
                  <Sun size={24} color="white" />
                  <Text style={styles.cardValue}>{formatTime(weatherData.sunrise, weatherData.timezone)}</Text>
                  <Text style={styles.cardLabel}>Nascer</Text>
                </View>
                <View style={styles.card}>
                  <Moon size={24} color="white" />
                  <Text style={styles.cardValue}>{formatTime(weatherData.sunset, weatherData.timezone)}</Text>
                  <Text style={styles.cardLabel}>Pôr do Sol</Text>
                </View>
              </View>

              <View style={styles.forecastContainer}>
                <Text style={styles.sectionTitle}>Próximos 5 Dias</Text>
                {forecastData.map((day, index) => {
                  const date = new Date(day.date + 'T00:00:00');
                  const dayName = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(date).slice(0, 3);
                  return (
                    <View key={index} style={styles.forecastRow}>
                      <Text style={styles.forecastDay}>{dayName}</Text>
                      <View style={{ transform: [{ scale: 0.6 }] }}>
                        {getWeatherInfo(day.code).icon}
                      </View>
                      <View style={styles.forecastTemp}>
                        <Text style={{ color: 'white', opacity: 0.7 }}>{convertTemp(day.min, unit)}°</Text>
                        <View style={styles.tempBar} />
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>{convertTemp(day.max, unit)}°</Text>
                      </View>
                    </View>
                  )
                })}
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Dados via Open-Meteo</Text>
                <View style={styles.updateBadge}>
                  <RefreshCw size={10} color="#6EE7B7" />
                  <Text style={styles.updateText}>Atualizado às {lastUpdated}</Text>
                </View>
              </View>

            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 60, flexGrow: 1 },
  searchContainer: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  inputWrapper: { flex: 1, position: 'relative' },
  input: { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 16, padding: 14, paddingRight: 45, color: 'white', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  searchIcon: { position: 'absolute', right: 12, top: 14 },
  locButton: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  errorBox: { backgroundColor: 'rgba(220, 38, 38, 0.8)', padding: 10, borderRadius: 10, marginBottom: 10 },
  errorText: { color: 'white', textAlign: 'center' },
  emptyState: { alignItems: 'center', marginTop: 100, gap: 10 },
  emptyText: { color: 'rgba(255,255,255,0.7)', fontSize: 18 },
  content: { alignItems: 'center', width: '100%' },
  header: { alignItems: 'center', marginBottom: 20 },
  cityName: { fontSize: 32, fontWeight: 'bold', color: 'white', textShadowColor: 'rgba(0,0,0,0.2)', textShadowRadius: 4 },
  region: { color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: 1 },
  currentWeather: { alignItems: 'center', marginBottom: 30 },
  temp: { fontSize: 90, fontWeight: '900', color: 'white' },
  condition: { fontSize: 20, color: 'white', marginTop: -10 },

  hourlyContainer: { width: '100%', marginBottom: 30 },
  hourlyCard: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 10, borderRadius: 20, alignItems: 'center', minWidth: 70, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  hourlyTime: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginBottom: -5 },
  hourlyTemp: { color: 'white', fontWeight: 'bold', marginTop: -5 },
  hourlyRain: { color: '#93C5FD', fontSize: 10, fontWeight: 'bold' },

  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%', gap: 10, marginBottom: 30 },
  card: { width: '31%', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: 15, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 0 },
  cardValue: { color: 'white', fontSize: 16, fontWeight: 'bold', marginTop: 5 },
  cardLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10, textTransform: 'uppercase' },

  forecastContainer: { width: '100%', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  sectionTitle: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 15 },
  forecastRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
  forecastDay: { color: 'white', width: 40, textTransform: 'capitalize' },
  forecastTemp: { flexDirection: 'row', alignItems: 'center', gap: 10, width: 100, justifyContent: 'flex-end' },
  tempBar: { width: 30, height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2 },
  footer: { marginTop: 30, alignItems: 'center', gap: 5, marginBottom: 20 },
  footerText: { color: 'rgba(255,255,255,0.4)', fontSize: 10, textTransform: 'uppercase' },
  updateBadge: { flexDirection: 'row', gap: 5, backgroundColor: 'rgba(6, 78, 59, 0.4)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  updateText: { color: '#6EE7B7', fontSize: 10 },

  modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '50%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  cityItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  cityNameList: { fontSize: 16, fontWeight: '600', color: '#333' },
  cityDetailsList: { fontSize: 12, color: '#666', marginTop: 2 }
});