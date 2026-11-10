import React, { useState, useEffect } from 'react';
import { FaCar, FaRoute, FaClock, FaExclamationTriangle, FaMapMarkerAlt, FaArrowRight, FaSyncAlt } from 'react-icons/fa';

const TrafficWidget = ({ 
  origin = 'Home',
  destination = 'Office',
  onRouteSelect,
  compact = false,
}) => {
  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    const fetchTraffic = async () => {
      setLoading(true);
      await new Promise(r => setTimeout(r, 1000));

      setRoutes([
        { id: 1, name: 'Fastest Route', via: 'Highway 101', distance: '12.5 km', duration: 18, delay: 3, traffic: 'moderate' },
        { id: 2, name: 'Alternative', via: 'Downtown', distance: '10.2 km', duration: 25, delay: 8, traffic: 'heavy' },
        { id: 3, name: 'Scenic Route', via: 'Coastal Road', distance: '15.8 km', duration: 22, delay: 0, traffic: 'light' },
      ]);

      setIncidents([
        { id: 1, type: 'accident', location: 'Highway 101, Mile 5', severity: 'moderate' },
        { id: 2, type: 'construction', location: 'Main St & 5th Ave', severity: 'low' },
      ]);

      setSelectedRoute(1);
      setLoading(false);
    };

    fetchTraffic();
  }, [origin, destination]);

  const getTrafficColor = (traffic) => {
    switch (traffic) {
      case 'light': return 'green';
      case 'moderate': return 'yellow';
      case 'heavy': return 'red';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <div className="bg-surface rounded-lg shadow-lg p-4 animate-pulse">
        <div className="h-32 bg-surface-sunken rounded-lg" />
      </div>
    );
  }

  if (compact) {
    const bestRoute = routes[0];
    return (
      <div className="bg-surface rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <FaCar className="text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-content-muted">{origin} → {destination}</p>
              <p className="font-bold text-content">{bestRoute?.duration} min</p>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs bg-surface-sunken text-content-muted`}>
            {bestRoute?.traffic}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <FaCar className="text-primary-600 text-xl" />
          <h3 className="text-lg font-semibold text-content">Traffic</h3>
        </div>
        <button onClick={() => setLoading(true)} className="p-2 text-content-muted hover:bg-surface-sunken rounded-lg">
          <FaSyncAlt />
        </button>
      </div>

      {/* Route Header */}
      <div className="flex items-center gap-2 p-3 bg-surface-sunken rounded-lg mb-4">
        <FaMapMarkerAlt className="text-green-500" />
        <span className="text-sm text-content">{origin}</span>
        <FaArrowRight className="text-content-subtle mx-2" />
        <FaMapMarkerAlt className="text-red-500" />
        <span className="text-sm text-content">{destination}</span>
      </div>

      {/* Routes */}
      <div className="space-y-2 mb-4">
        {routes.map((route) => {
          const color = getTrafficColor(route.traffic);
          const isSelected = selectedRoute === route.id;
          return (
            <button
              key={route.id}
              onClick={() => { setSelectedRoute(route.id); onRouteSelect?.(route); }}
              className={`w-full p-3 rounded-lg text-left transition-colors ${
                isSelected
                  ? 'border-2 border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-2 border-line hover:border-line'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-content">{route.name}</span>
                <div className="flex items-center gap-2">
                  <FaClock className="text-content-subtle text-xs" />
                  <span className="font-bold text-content">{route.duration} min</span>
                  {route.delay > 0 && (
                    <span className="text-xs text-red-500">+{route.delay}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-content-muted">
                <span>via {route.via}</span>
                <div className="flex items-center gap-2">
                  <span>{route.distance}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs bg-surface-sunken text-content-muted capitalize`}>
                    {route.traffic}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Incidents */}
      {incidents.length > 0 && (
        <div>
          <p className="text-sm font-medium text-content mb-2">Traffic Incidents</p>
          <div className="space-y-2">
            {incidents.map((incident) => (
              <div key={incident.id} className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <FaExclamationTriangle className="text-yellow-500" />
                <div className="flex-1">
                  <p className="text-sm text-content capitalize">{incident.type}</p>
                  <p className="text-xs text-content-muted">{incident.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrafficWidget;

