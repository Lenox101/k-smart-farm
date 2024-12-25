import { useContext, createContext, useState, useEffect } from "react";
import axios from 'axios';

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
    const [weather, setWeather] = useState({});
    const [values, setValues] = useState([]);
    const [place, setPlace] = useState('Nairobi');
    const [thisLocation, setLocation] = useState('');

    // fetch api
    const fetchWeather = async () => {
        const API_KEY = 'cc278052250ea584cdc4a4b417872d95'; // Replace with your OpenWeather API key
        try {
            // Get current weather
            const currentWeather = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?q=${place}&units=metric&appid=${API_KEY}`
            );

            // Get forecast data
            const forecast = await axios.get(
                `https://api.openweathermap.org/data/2.5/forecast?q=${place}&units=metric&appid=${API_KEY}`
            );

            // Set current weather
            setWeather({
                temp: Math.round(currentWeather.data.main.temp),
                humidity: currentWeather.data.main.humidity,
                wspd: currentWeather.data.wind.speed,
                heatindex: Math.round(currentWeather.data.main.feels_like),
                conditions: mapWeatherCondition(currentWeather.data.weather[0].main),
                icon: currentWeather.data.weather[0].icon
            });

            setLocation(currentWeather.data.name);

            // Process forecast data
            // Group forecast data by day
            const dailyForecasts = {};
            forecast.data.list.forEach(item => {
                const date = new Date(item.dt * 1000).toLocaleDateString();
                if (!dailyForecasts[date]) {
                    dailyForecasts[date] = item;
                }
            });

            // Convert to array and take next 6 days
            const dailyData = Object.values(dailyForecasts)
                .slice(0, 7)
                .map(item => ({
                    datetime: new Date(item.dt * 1000).toISOString(),
                    temp: Math.round(item.main.temp),
                    conditions: mapWeatherCondition(item.weather[0].main),
                    icon: item.weather[0].icon
                }));

            setValues(dailyData);

        } catch (e) {
            console.error('Weather API Error:', e);
            setWeather({});
            setLocation('');
            setValues([]);
        }
    };

    useEffect(() => {
        fetchWeather();
    }, [place]);

    return (
        <StateContext.Provider value={{
            weather,
            setPlace,
            values,
            thisLocation,
            place
        }}>
            {children}
        </StateContext.Provider>
    );
}

export const useStateContext = () => useContext(StateContext);

// Helper function to map OpenWeather conditions to our icon set
const mapWeatherCondition = (condition) => {
    switch (condition.toLowerCase()) {
        case 'clear':
            return 'Clear';
        case 'clouds':
            return 'Cloudy';
        case 'rain':
        case 'drizzle':
            return 'Rain';
        case 'thunderstorm':
            return 'Thunder';
        case 'snow':
            return 'Snow';
        case 'mist':
        case 'fog':
        case 'haze':
            return 'Fog';
        default:
            return condition;
    }
};