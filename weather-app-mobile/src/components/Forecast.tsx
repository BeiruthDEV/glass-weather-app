import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getWeatherInfo, convertTemp } from '../utils/weather';
import { useWeatherContext } from '../context/WeatherContext';

export const Forecast = () => {
    const { forecastData, unit } = useWeatherContext();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Próximos 5 Dias</Text>
            {forecastData.map((day, index) => {
                const date = new Date(day.date + 'T00:00:00');
                const dayName = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(date).slice(0, 3);
                return (
                    <View key={index} style={styles.row}>
                        <Text style={styles.day}>{dayName}</Text>
                        <View style={{ transform: [{ scale: 0.6 }] }}>
                            {getWeatherInfo(day.code).icon}
                        </View>
                        <View style={styles.tempContainer}>
                            <Text style={{ color: 'white', opacity: 0.7 }}>{convertTemp(day.min, unit)}°</Text>
                            <View style={styles.bar} />
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>{convertTemp(day.max, unit)}°</Text>
                        </View>
                    </View>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { width: '100%', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    title: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 15 },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
    day: { color: 'white', width: 40, textTransform: 'capitalize' },
    tempContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, width: 100, justifyContent: 'flex-end' },
    bar: { width: 30, height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2 },
});