import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Wind, Droplets, ThermometerSun, Sun, Moon, SunDim } from 'lucide-react-native';
import { convertTemp, convertWind } from '../utils/weather';
import { useWeatherContext } from '../context/WeatherContext';

export const WeatherDetails = () => {
    const { weatherData, unit } = useWeatherContext();

    if (!weatherData) return null;

    const formatTime = (iso: string, tz: string) => {
        if (!iso) return '--:--';
        return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: tz }).format(new Date(iso));
    };


    interface DetailCardProps {
        icon: React.ElementType;
        value: string | number;
        label: string;
    }

    const DetailCard = ({ icon: Icon, value, label }: DetailCardProps) => (
        <View style={styles.card}>
            <Icon size={24} color="white" />
            <Text style={styles.value}>{value}</Text>
            <Text style={styles.label}>{label}</Text>
        </View>
    );

    return (
        <View style={styles.grid}>
            <DetailCard icon={Wind} value={`${convertWind(weatherData.windSpeed, unit).value} ${convertWind(weatherData.windSpeed, unit).unit}`} label="Vento" />
            <DetailCard icon={Droplets} value={`${weatherData.humidity}%`} label="Umidade" />
            <DetailCard icon={ThermometerSun} value={`${convertTemp(weatherData.feelsLike, unit)}°`} label="Sensação" />
            <DetailCard icon={SunDim} value={weatherData.uvIndex} label="Índice UV" />
            <DetailCard icon={Sun} value={formatTime(weatherData.sunrise, weatherData.timezone)} label="Nascer" />
            <DetailCard icon={Moon} value={formatTime(weatherData.sunset, weatherData.timezone)} label="Pôr do Sol" />
        </View>
    );
};

const styles = StyleSheet.create({
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%', gap: 10, marginBottom: 30 },
    card: { width: '31%', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: 15, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    value: { color: 'white', fontSize: 16, fontWeight: 'bold', marginTop: 5 },
    label: { color: 'rgba(255,255,255,0.6)', fontSize: 10, textTransform: 'uppercase' },
});