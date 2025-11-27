import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getWeatherInfo, convertTemp } from '../utils/weather';
import { useWeatherContext } from '../context/WeatherContext'; // <--- Importando Contexto

// Removemos as props da função!
export const CurrentWeather = () => {
    // Pegamos os dados direto do contexto
    const { weatherData, unit, toggleUnit } = useWeatherContext();

    if (!weatherData) return null;

    const weatherInfo = getWeatherInfo(weatherData.weatherCode, weatherData.isDay);

    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                {weatherInfo.icon}
            </View>
            <TouchableOpacity onPress={toggleUnit} activeOpacity={0.7}>
                <Text style={styles.temp}>
                    {convertTemp(weatherData.temperature, unit)}°{unit}
                </Text>
            </TouchableOpacity>
            <Text style={styles.condition}>{weatherInfo.desc}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { alignItems: 'center', marginBottom: 30 },
    iconContainer: { marginBottom: 10 },
    temp: { fontSize: 90, fontWeight: '900', color: 'white' },
    condition: { fontSize: 20, color: 'white', marginTop: -10 },
});