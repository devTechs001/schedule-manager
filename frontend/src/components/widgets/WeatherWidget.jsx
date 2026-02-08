import React, { useState, useEffect } from 'react';
import { FaSun, FaCloud, FaCloudRain, FaSnowflake, FaBolt, FaWind, FaTint, FaThermometerHalf, FaMapMarkerAlt, FaSyncAlt } from 'react-icons/fa';

const WeatherWidget = ({ location = 'New York', onLocationChange, compact = false }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [forecast, setForecast] = useState([]);

  // Simulated weather data
  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      await new Promise(r => setTimeout(r, 800));
      
      const conditions = ['sunny', 'cloudy', 'rainy', 'stormy'];
      const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
      
      setWeather({
        condition: randomCondition,
        temperature: Math.floor(Math.random() * 30) + 10,
        humidity: Math.floor(Math.random() * 40) + 40,
        wind: Math.floor(Math.random() * 20) + 5,
        feelsLike: Math.floor(Math.random() * 30) + 8,
      });

      setForecast([
        { day: 'Mon', condition: 'sunny', high: 24, low: 16 },
        { day: 'Tue', condition: 'cloudy', high: 22, low: 15 },
        { day: 'Wed', condition: 'rainy', high: 18, low: 12 },
        { day: 'Thu', condition: 'cloudy', high: 20, low: 14 },
        { day: 'Fri', condition: 'sunny', high: 25, low: 17 },
      ]);
      
      setLoading(false);
    };

    fetchWeather();
  }, [location]);

  const getWeatherIcon = (condition) => {
    switch (condition) {
      case 'sunny': return FaSun;
      case 'cloudy': return FaCloud;
      case 'rainy': return FaCloudRain;
      case 'stormy': return FaBolt;
      case 'snowy': return FaSnowflake;
      default: return FaCloud;
    }
  };

  const getWeatherColor = (condition) => {
    switch (condition) {
      case 'sunny': return 'text-yellow-500';
      case 'cloudy': return 'text-gray-400';
      case 'rainy': return 'text-blue-500';
      case 'stormy': return 'text-purple-500';
      case 'snowy': return 'text-cyan-400';
      default: return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 animate-pulse">
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>
    );
  }

  const WeatherIcon = weather ? getWeatherIcon(weather.condition) : FaCloud;

  if (compact) {
    return (
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <WeatherIcon className="text-3xl text-yellow-300" />
            <div>
              <p className="text-2xl font-bold">{weather?.temperature}°C</p>
              <p className="text-sm opacity-80 capitalize">{weather?.condition}</p>
            </div>
          </div>
          <div className="text-right text-sm">
            <p className="flex items-center gap-1"><FaMapMarkerAlt /> {location}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FaMapMarkerAlt />
          <span className="font-medium">{location}</span>
        </div>
        <button onClick={() => setLoading(true)} className="p-2 hover:bg-white/10 rounded-lg">
          <FaSyncAlt className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-5xl font-bold">{weather?.temperature}°</p>
          <p className="text-lg capitalize opacity-90">{weather?.condition}</p>
          <p className="text-sm opacity-75">Feels like {weather?.feelsLike}°</p>
        </div>
        <WeatherIcon className="text-6xl text-yellow-300" />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-white/10 rounded-lg">
          <FaTint className="mx-auto mb-1" />
          <p className="text-sm opacity-75">Humidity</p>
          <p className="font-bold">{weather?.humidity}%</p>
        </div>
        <div className="text-center p-3 bg-white/10 rounded-lg">
          <FaWind className="mx-auto mb-1" />
          <p className="text-sm opacity-75">Wind</p>
          <p className="font-bold">{weather?.wind} km/h</p>
        </div>
        <div className="text-center p-3 bg-white/10 rounded-lg">
          <FaThermometerHalf className="mx-auto mb-1" />
          <p className="text-sm opacity-75">Feels</p>
          <p className="font-bold">{weather?.feelsLike}°</p>
        </div>
      </div>

      <div className="border-t border-white/20 pt-4">
        <p className="text-sm mb-3 opacity-75">5-Day Forecast</p>
        <div className="flex justify-between">
          {forecast.map((day) => {
            const DayIcon = getWeatherIcon(day.condition);
            return (
              <div key={day.day} className="text-center">
                <p className="text-xs opacity-75">{day.day}</p>
                <DayIcon className="mx-auto my-1 text-lg" />
                <p className="text-xs">
                  <span className="font-bold">{day.high}°</span>
                  <span className="opacity-75"> {day.low}°</span>
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;

