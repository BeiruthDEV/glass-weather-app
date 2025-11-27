import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { getWeatherInfo, convertTemp } from '../utils/weather';
import { useWeatherContext } from '../context/WeatherContext';

export const HourlyForecast = () => {
    const { hourlyData, unit } = useWeatherContext();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Previsão Horária</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                {hourlyData.map((hour, index) => (
                    <View key={index} style={styles.card}>
                        <Text style={styles.time}>{hour.time}</Text>
                        <View style={{ transform: [{ scale: 0.5 }] }}>
                            {getWeatherInfo(hour.code, hour.isDay).icon}
                        </View>
                        <Text style={styles.temp}>{convertTemp(hour.temp, unit)}°</Text>
                        {hour.rain > 0 && <Text style={styles.rain}>{hour.rain}%</Text>}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { width: '100%', marginBottom: 30 },
    title: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 15 },
    card: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 10, borderRadius: 20, alignItems: 'center', minWidth: 70, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    time: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginBottom: -5 },
    temp: { color: 'white', fontWeight: 'bold', marginTop: -5 },
    rain: { color: '#93C5FD', fontSize: 10, fontWeight: 'bold' },
});