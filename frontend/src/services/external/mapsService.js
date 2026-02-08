// Maps and Location Service

class MapsService {
  constructor() {
    this.apiKey = import.meta.env.VITE_MAPS_API_KEY || 'demo';
    this.geocodeCache = {};
  }

  // Geocode address to coordinates
  async geocode(address) {
    if (this.geocodeCache[address]) {
      return this.geocodeCache[address];
    }

    await new Promise(r => setTimeout(r, 500));

    // Mock geocoding result
    const result = {
      address,
      lat: 40.7128 + (Math.random() - 0.5) * 0.1,
      lng: -74.0060 + (Math.random() - 0.5) * 0.1,
      formattedAddress: `${address}, City, Country`,
      placeId: `place-${Date.now()}`,
    };

    this.geocodeCache[address] = result;
    return result;
  }

  // Reverse geocode coordinates to address
  async reverseGeocode(lat, lng) {
    await new Promise(r => setTimeout(r, 500));

    return {
      lat,
      lng,
      address: `${Math.abs(lat).toFixed(4)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lng).toFixed(4)}°${lng >= 0 ? 'E' : 'W'}`,
      formattedAddress: '123 Example Street, City, Country',
      components: {
        street: '123 Example Street',
        city: 'City',
        state: 'State',
        country: 'Country',
        postalCode: '12345',
      },
    };
  }

  // Search for places
  async searchPlaces(query, options = {}) {
    await new Promise(r => setTimeout(r, 800));

    const { type, radius = 5000 } = options;

    return Array.from({ length: 5 }, (_, i) => ({
      id: `place-${i}`,
      name: `${query} ${i + 1}`,
      address: `${100 + i} Example St`,
      type: type || 'establishment',
      rating: (3.5 + Math.random() * 1.5).toFixed(1),
      distance: Math.round(Math.random() * radius),
      isOpen: Math.random() > 0.3,
      lat: 40.7128 + (Math.random() - 0.5) * 0.05,
      lng: -74.0060 + (Math.random() - 0.5) * 0.05,
    }));
  }

  // Get place details
  async getPlaceDetails(placeId) {
    await new Promise(r => setTimeout(r, 500));

    return {
      id: placeId,
      name: 'Example Place',
      address: '123 Example Street, City, Country',
      phone: '+1-555-123-4567',
      website: 'https://example.com',
      rating: 4.5,
      reviews: 120,
      hours: {
        monday: '9:00 AM - 6:00 PM',
        tuesday: '9:00 AM - 6:00 PM',
        wednesday: '9:00 AM - 6:00 PM',
        thursday: '9:00 AM - 6:00 PM',
        friday: '9:00 AM - 6:00 PM',
        saturday: '10:00 AM - 4:00 PM',
        sunday: 'Closed',
      },
      photos: [],
      lat: 40.7128,
      lng: -74.0060,
    };
  }

  // Get directions
  async getDirections(origin, destination, mode = 'driving') {
    await new Promise(r => setTimeout(r, 1000));

    const baseTime = mode === 'driving' ? 20 : mode === 'transit' ? 35 : mode === 'walking' ? 60 : 15;
    const duration = baseTime + Math.random() * 30;

    return {
      origin,
      destination,
      mode,
      distance: (2 + Math.random() * 20).toFixed(1),
      duration: Math.round(duration),
      steps: [
        { instruction: 'Head north on Main St', distance: '0.5 km', duration: 3 },
        { instruction: 'Turn right onto Oak Ave', distance: '1.2 km', duration: 5 },
        { instruction: 'Continue onto Highway 101', distance: '8.0 km', duration: 10 },
        { instruction: 'Take exit 42 toward Downtown', distance: '0.8 km', duration: 2 },
        { instruction: 'Arrive at destination', distance: '0.1 km', duration: 1 },
      ],
    };
  }

  // Calculate distance between two points
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  toRad(deg) {
    return deg * (Math.PI / 180);
  }

  // Get current location
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          reject(error);
        },
        { enableHighAccuracy: true }
      );
    });
  }

  // Watch position
  watchPosition(callback, errorCallback) {
    if (!navigator.geolocation) {
      errorCallback?.(new Error('Geolocation not supported'));
      return null;
    }

    return navigator.geolocation.watchPosition(
      (position) => {
        callback({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      errorCallback,
      { enableHighAccuracy: true }
    );
  }

  // Stop watching position
  clearWatch(watchId) {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }
  }

  // Get nearby places
  async getNearbyPlaces(lat, lng, type, radius = 1000) {
    return this.searchPlaces(type, { type, radius });
  }
}

export const mapsService = new MapsService();
export default mapsService;

