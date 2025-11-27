import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar, Modal, FlatList, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, MapPin, RefreshCw, X, ChevronRight } from 'lucide-react-native';
import { getWeatherTheme } from './src/utils/weather';
import { WeatherProvider, useWeatherContext } from './src/context/WeatherContext';
import { CitySearchResult } from './src/types/weather';

// Importando Componentes
import { CurrentWeather } from './src/components/CurrentWeather';
import { HourlyForecast } from './src/components/HourlyForecast';
import { WeatherDetails } from './src/components/WeatherDetails';
import { Forecast } from './src/components/Forecast';

const WeatherContent = () => {
  const {
    weatherData, forecastData, hourlyData, loading, error, lastUpdated,
    searchCity, loadWeather, fetchUserLocation, lastLocationRef
  } = useWeatherContext();

  const [city, setCity] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [searchResults, setSearchResults] = useState<CitySearchResult[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const handleSearch = async () => {
    const results = await searchCity(city);
    if (results) {
      if (results.length === 1) {
        const { latitude, longitude, name, admin1, country_code } = results[0];
        loadWeather(latitude, longitude, name, admin1 || '', country_code || '');
      } else {
        setSearchResults(results);
        setModalVisible(true);
      }
    }
  };

  const onSelectCity = (item: CitySearchResult) => {
    setModalVisible(false);
    setCity(item.name);
    loadWeather(item.latitude, item.longitude, item.name, item.admin1 || '', item.country_code || '');
  };

  const onRefresh = useCallback(async () => {
    if (lastLocationRef.current) {
      setRefreshing(true);
      const { lat, lon, name, region, country } = lastLocationRef.current;
      await loadWeather(lat, lon, name, region, country);
      setRefreshing(false);
    }
  }, [lastLocationRef, loadWeather]);

  const themeColors = getWeatherTheme(weatherData?.weatherCode, weatherData?.isDay) as [string, string, ...string[]];

  return (
    <LinearGradient colors={themeColors} style={styles.container}>
      <StatusBar barStyle="light-content" />

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione a Cidade</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><X size={24} color="#333" /></TouchableOpacity>
            </View>
            <FlatList
              data={searchResults}
              keyExtractor={(item) => `${item.id}`}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.cityItem} onPress={() => onSelectCity(item)}>
                  <View>
                    <Text style={styles.cityNameList}>{item.name}</Text>
                    <Text style={styles.cityDetailsList}>{[item.admin1, item.country].filter(Boolean).join(', ')}</Text>
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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
        >

          <View style={styles.searchContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Buscar cidade..."
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={city}
                onChangeText={setCity}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
              <TouchableOpacity onPress={handleSearch} style={styles.searchIcon}>
                <Search size={20} color="white" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={fetchUserLocation} style={styles.locButton}>
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

              {/* Componentes Normais (Sem AnimatedCard) */}
              <CurrentWeather />
              {hourlyData.length > 0 && <HourlyForecast />}
              <WeatherDetails />
              {forecastData.length > 0 && <Forecast />}

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
};

export default function App() {
  return (
    <WeatherProvider>
      <WeatherContent />
    </WeatherProvider>
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