// Weather Service

class WeatherService {
  constructor() {
    this.apiKey = import.meta.env.VITE_WEATHER_API_KEY || 'demo';
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
    this.cache = {};
    this.cacheExpiry = 600000; // 10 minutes
  }

  // Get current weather
  async getCurrentWeather(location) {
    const cacheKey = `current-${location}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // In production, make actual API call
      // const response = await fetch(`${this.baseUrl}/weather?q=${location}&appid=${this.apiKey}&units=metric`);
      
      // Mock response
      await new Promise(r => setTimeout(r, 500));
      
      const weather = this.generateMockWeather(location);
      this.setCache(cacheKey, weather);
      return weather;
    } catch (error) {
      console.error('Weather API error:', error);
      return this.generateMockWeather(location);
    }
  }

  // Get forecast
  async getForecast(location, days = 5) {
    const cacheKey = `forecast-${location}-${days}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      await new Promise(r => setTimeout(r, 500));
      
      const forecast = Array.from({ length: days }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i + 1);
        return {
          date: date.toISOString().split('T')[0],
          ...this.generateMockDayWeather(),
        };
      });

      this.setCache(cacheKey, forecast);
      return forecast;
    } catch (error) {
      console.error('Forecast API error:', error);
      return [];
    }
  }

  // Get weather for coordinates
  async getWeatherByCoords(lat, lon) {
    const cacheKey = `coords-${lat}-${lon}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    await new Promise(r => setTimeout(r, 500));
    
    const weather = this.generateMockWeather('Current Location');
    this.setCache(cacheKey, weather);
    return weather;
  }

  // Get current location weather
  async getCurrentLocationWeather() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const weather = await this.getWeatherByCoords(
            position.coords.latitude,
            position.coords.longitude
          );
          resolve(weather);
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  // Generate mock weather data
  generateMockWeather(location) {
    const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy', 'Stormy'];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    
    return {
      location,
      temperature: Math.round(15 + Math.random() * 20),
      feelsLike: Math.round(14 + Math.random() * 20),
      humidity: Math.round(40 + Math.random() * 40),
      windSpeed: Math.round(5 + Math.random() * 20),
      condition,
      icon: this.getWeatherIcon(condition),
      description: condition.toLowerCase(),
      updatedAt: new Date().toISOString(),
    };
  }

  // Generate mock day weather
  generateMockDayWeather() {
    const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy'];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    
    return {
      tempHigh: Math.round(20 + Math.random() * 15),
      tempLow: Math.round(10 + Math.random() * 10),
      condition,
      icon: this.getWeatherIcon(condition),
      precipitation: Math.round(Math.random() * 100),
    };
  }

  // Get weather icon
  getWeatherIcon(condition) {
    const icons = {
      'Sunny': '☀️',
      'Partly Cloudy': '⛅',
      'Cloudy': '☁️',
      'Rainy': '🌧️',
      'Stormy': '⛈️',
      'Snowy': '🌨️',
    };
    return icons[condition] || '🌡️';
  }

  // Get weather impact on schedule
  getScheduleImpact(weather) {
    const impacts = [];

    if (weather.condition === 'Rainy' || weather.condition === 'Stormy') {
      impacts.push({
        type: 'travel',
        message: 'Consider extra travel time due to weather',
        severity: 'warning',
      });
    }

    if (weather.temperature > 35) {
      impacts.push({
        type: 'outdoor',
        message: 'Outdoor activities may be uncomfortable',
        severity: 'info',
      });
    }

    return impacts;
  }

  // Cache helpers
  getFromCache(key) {
    const cached = this.cache[key];
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.cache[key] = { data, timestamp: Date.now() };
  }

  clearCache() {
    this.cache = {};
  }
}

export const weatherService = new WeatherService();
export default weatherService;

