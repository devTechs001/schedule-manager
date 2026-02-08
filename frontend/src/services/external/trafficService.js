// Traffic Service

class TrafficService {
  constructor() {
    this.apiKey = import.meta.env.VITE_TRAFFIC_API_KEY || 'demo';
    this.cache = {};
    this.cacheExpiry = 300000; // 5 minutes
  }

  // Get traffic conditions for route
  async getTrafficConditions(origin, destination) {
    const cacheKey = `route-${origin}-${destination}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    await new Promise(r => setTimeout(r, 1000));

    const conditions = this.generateMockTrafficData(origin, destination);
    this.setCache(cacheKey, conditions);
    return conditions;
  }

  // Get ETA with traffic
  async getETAWithTraffic(origin, destination, departureTime = new Date()) {
    const traffic = await this.getTrafficConditions(origin, destination);
    
    const baseMinutes = traffic.duration;
    const trafficDelay = traffic.delay;
    
    const eta = new Date(departureTime.getTime() + (baseMinutes + trafficDelay) * 60000);
    
    return {
      eta,
      duration: baseMinutes + trafficDelay,
      baseDuration: baseMinutes,
      delay: trafficDelay,
      trafficLevel: traffic.level,
    };
  }

  // Get multiple route options
  async getRouteOptions(origin, destination) {
    await new Promise(r => setTimeout(r, 1000));

    return [
      {
        id: 'fastest',
        name: 'Fastest Route',
        duration: Math.round(15 + Math.random() * 30),
        distance: (5 + Math.random() * 20).toFixed(1),
        trafficLevel: ['light', 'moderate', 'heavy'][Math.floor(Math.random() * 3)],
        tolls: Math.random() > 0.5,
      },
      {
        id: 'shortest',
        name: 'Shortest Route',
        duration: Math.round(20 + Math.random() * 35),
        distance: (4 + Math.random() * 15).toFixed(1),
        trafficLevel: ['light', 'moderate'][Math.floor(Math.random() * 2)],
        tolls: false,
      },
      {
        id: 'eco',
        name: 'Eco-Friendly Route',
        duration: Math.round(25 + Math.random() * 40),
        distance: (6 + Math.random() * 18).toFixed(1),
        trafficLevel: 'light',
        tolls: false,
      },
    ];
  }

  // Get traffic incidents
  async getIncidents(location, radius = 10) {
    await new Promise(r => setTimeout(r, 500));

    return Array.from({ length: Math.floor(Math.random() * 5) }, (_, i) => ({
      id: `incident-${i}`,
      type: ['accident', 'construction', 'event', 'roadwork'][Math.floor(Math.random() * 4)],
      severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      description: `Traffic incident ${i + 1}`,
      location: `${(Math.random() * radius).toFixed(2)} km away`,
      delay: Math.round(Math.random() * 20),
      reportedAt: new Date(Date.now() - Math.random() * 3600000),
    }));
  }

  // Get optimal departure time
  async getOptimalDepartureTime(origin, destination, arrivalTime) {
    await new Promise(r => setTimeout(r, 500));

    const hoursBefore = [0.5, 1, 1.5, 2, 2.5];
    
    return hoursBefore.map(hours => {
      const departureTime = new Date(arrivalTime.getTime() - hours * 3600000);
      const estimatedDuration = 20 + Math.random() * 30;
      
      return {
        departureTime,
        arrivalTime: new Date(departureTime.getTime() + estimatedDuration * 60000),
        duration: Math.round(estimatedDuration),
        trafficLevel: hours > 1.5 ? 'light' : 'moderate',
        recommended: hours === 1.5,
      };
    });
  }

  // Generate mock traffic data
  generateMockTrafficData(origin, destination) {
    const levels = ['light', 'moderate', 'heavy'];
    const level = levels[Math.floor(Math.random() * levels.length)];
    const baseDuration = 15 + Math.random() * 45;
    const delayMultiplier = { light: 0, moderate: 0.2, heavy: 0.5 };

    return {
      origin,
      destination,
      duration: Math.round(baseDuration),
      delay: Math.round(baseDuration * delayMultiplier[level]),
      distance: (5 + Math.random() * 30).toFixed(1),
      level,
      congestion: {
        light: level === 'light' ? 100 : level === 'moderate' ? 30 : 10,
        moderate: level === 'moderate' ? 60 : 20,
        heavy: level === 'heavy' ? 80 : 10,
      },
      updatedAt: new Date().toISOString(),
    };
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

  // Calculate buffer time for meeting
  calculateBufferTime(trafficLevel) {
    const buffers = {
      light: 5,
      moderate: 15,
      heavy: 30,
    };
    return buffers[trafficLevel] || 10;
  }
}

export const trafficService = new TrafficService();
export default trafficService;

