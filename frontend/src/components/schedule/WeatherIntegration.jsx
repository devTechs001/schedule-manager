import React, { useState, useEffect } from 'react';
import { FaSun, FaCloud, FaCloudRain, FaSnowflake, FaWind, FaExclamationTriangle, FaCalendarAlt, FaBolt } from 'react-icons/fa';

const WeatherIntegration = ({ events = [], location = 'New York', onSuggestReschedule }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  const defaultEvents = [
    { id: 1, title: 'Outdoor Team Building', isOutdoor: true, date: new Date(Date.now() + 86400000) },
    { id: 2, title: 'Client Golf Meeting', isOutdoor: true, date: new Date(Date.now() + 172800000) },
    { id: 3, title: 'Office Meeting', isOutdoor: false, date: new Date(Date.now() + 259200000) },
  ];

  const allEvents = events.length > 0 ? events : defaultEvents;

  useEffect(() => {
    // Simulate weather fetch
    const fetchWeather = async () => {
      setLoading(true);
      await new Promise(r => setTimeout(r, 1000));
      
      const conditions = ['sunny', 'cloudy', 'rainy', 'stormy'];
      const forecast = [];
      
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        forecast.push({
          date,
          condition: conditions[Math.floor(Math.random() * conditions.length)],
          high: 60 + Math.floor(Math.random() * 20),
          low: 45 + Math.floor(Math.random() * 15),
          precipitation: Math.floor(Math.random() * 100),
          wind: 5 + Math.floor(Math.random() * 20),
        });
      }
      
      setWeather({
        current: {
          temp: 72,
          condition: 'sunny',
          humidity: 45,
          wind: 8,
        },
        forecast,
      });
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
      default: return FaSun;
    }
  };

  const getWeatherColor = (condition) => {
    switch (condition) {
      case 'sunny': return 'yellow';
      case 'cloudy': return 'gray';
      case 'rainy': return 'blue';
      case 'stormy': return 'purple';
      case 'snowy': return 'cyan';
      default: return 'gray';
    }
  };

  const getEventWeather = (eventDate) => {
    if (!weather) return null;
    const dayDiff = Math.floor((new Date(eventDate).getTime() - Date.now()) / 86400000);
    return weather.forecast[Math.min(dayDiff, weather.forecast.length - 1)];
  };

  const isBadWeather = (condition) => ['rainy', 'stormy', 'snowy'].includes(condition);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="text-center py-8 text-gray-500">
          <FaSun className="mx-auto text-4xl mb-3 animate-spin" />
          <p>Loading weather data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaSun className="text-yellow-500 text-xl" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Weather & Events</h3>
        </div>
        <span className="text-sm text-gray-500">{location}</span>
      </div>

      {/* Current Weather */}
      {weather && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Current Weather</p>
              <p className="text-4xl font-bold">{weather.current.temp}°F</p>
              <p className="capitalize">{weather.current.condition}</p>
            </div>
            <FaSun className="text-6xl opacity-80" />
          </div>
          <div className="flex gap-4 mt-4 text-sm">
            <span>💧 {weather.current.humidity}% humidity</span>
            <span>💨 {weather.current.wind} mph wind</span>
          </div>
        </div>
      )}

      {/* 7-Day Forecast */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">7-Day Forecast</h4>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {weather?.forecast.map((day, i) => {
            const WeatherIcon = getWeatherIcon(day.condition);
            const color = getWeatherColor(day.condition);
            return (
              <div key={i} className="flex-shrink-0 text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg w-20">
                <p className="text-xs text-gray-500 mb-1">
                  {i === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                </p>
                <WeatherIcon className={`mx-auto text-${color}-500 text-xl mb-1`} />
                <p className="text-sm font-medium text-gray-900 dark:text-white">{day.high}°</p>
                <p className="text-xs text-gray-500">{day.low}°</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Outdoor Events Alerts */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Outdoor Events</h4>
        <div className="space-y-3">
          {allEvents.filter(e => e.isOutdoor).map((event) => {
            const eventWeather = getEventWeather(event.date);
            if (!eventWeather) return null;
            
            const WeatherIcon = getWeatherIcon(eventWeather.condition);
            const hasBadWeather = isBadWeather(eventWeather.condition);
            
            return (
              <div
                key={event.id}
                className={`p-4 rounded-lg border-2 ${
                  hasBadWeather
                    ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-white">{event.title}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <WeatherIcon className={`text-${getWeatherColor(eventWeather.condition)}-500`} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{eventWeather.high}°F</span>
                  </div>
                </div>
                
                {hasBadWeather && (
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                      <FaExclamationTriangle />
                      <span>{eventWeather.precipitation}% chance of rain</span>
                    </div>
                    <button
                      onClick={() => onSuggestReschedule?.(event)}
                      className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg"
                    >
                      Suggest Reschedule
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeatherIntegration;

