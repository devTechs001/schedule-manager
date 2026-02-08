import React, { useState, useEffect } from 'react';
import { FaCar, FaRoute, FaClock, FaExclamationTriangle, FaMapMarkerAlt, FaSync } from 'react-icons/fa';

const TrafficAware = ({ events = [], onUpdateDeparture }) => {
  const [trafficData, setTrafficData] = useState({});
  const [loading, setLoading] = useState(false);

  const defaultEvents = [
    { id: 1, title: 'Client Meeting', location: '456 Business Ave', time: new Date(Date.now() + 3600000), duration: 60 },
    { id: 2, title: 'Lunch with Team', location: '789 Restaurant St', time: new Date(Date.now() + 7200000), duration: 90 },
    { id: 3, title: 'Doctor Appointment', location: '321 Medical Center', time: new Date(Date.now() + 14400000), duration: 45 },
  ];

  const allEvents = events.length > 0 ? events : defaultEvents;

  useEffect(() => {
    // Simulate traffic data fetch
    const fetchTrafficData = async () => {
      setLoading(true);
      await new Promise(r => setTimeout(r, 1500));
      
      const data = {};
      allEvents.forEach(event => {
        data[event.id] = {
          normalDuration: 20 + Math.floor(Math.random() * 20),
          currentDuration: 25 + Math.floor(Math.random() * 30),
          trafficLevel: ['low', 'moderate', 'heavy'][Math.floor(Math.random() * 3)],
          suggestedDeparture: new Date(new Date(event.time).getTime() - (30 + Math.floor(Math.random() * 20)) * 60000),
        };
      });
      
      setTrafficData(data);
      setLoading(false);
    };

    fetchTrafficData();
  }, []);

  const getTrafficColor = (level) => {
    switch (level) {
      case 'low': return 'green';
      case 'moderate': return 'yellow';
      case 'heavy': return 'red';
      default: return 'gray';
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const refreshTraffic = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaCar className="text-primary-600 text-xl" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Traffic-Aware Scheduling</h3>
        </div>
        <button
          onClick={refreshTraffic}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm"
        >
          <FaSync className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading && !Object.keys(trafficData).length ? (
        <div className="text-center py-8 text-gray-500">
          <FaRoute className="mx-auto text-4xl mb-3 animate-pulse" />
          <p>Checking traffic conditions...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {allEvents.map((event) => {
            const traffic = trafficData[event.id];
            if (!traffic) return null;
            
            const trafficColor = getTrafficColor(traffic.trafficLevel);
            const delay = traffic.currentDuration - traffic.normalDuration;
            
            return (
              <div key={event.id} className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{event.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <FaMapMarkerAlt className="text-xs" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <FaClock className="text-xs" />
                      <span>Starts at {formatTime(event.time)}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${trafficColor}-100 dark:bg-${trafficColor}-900/30 text-${trafficColor}-700 dark:text-${trafficColor}-300 capitalize`}>
                    {traffic.trafficLevel} traffic
                  </span>
                </div>

                {/* Travel Info */}
                <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mb-3">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Normal</p>
                    <p className="font-medium text-gray-900 dark:text-white">{traffic.normalDuration} min</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Current</p>
                    <p className={`font-medium ${delay > 5 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                      {traffic.currentDuration} min
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Leave by</p>
                    <p className="font-medium text-primary-600">{formatTime(traffic.suggestedDeparture)}</p>
                  </div>
                </div>

                {/* Alert */}
                {delay > 10 && (
                  <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-700 dark:text-red-300 text-sm">
                    <FaExclamationTriangle />
                    <span>Heavy traffic! Leave {delay} minutes earlier than usual.</span>
                  </div>
                )}

                <button
                  onClick={() => onUpdateDeparture?.(event.id, traffic.suggestedDeparture)}
                  className="mt-3 w-full py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm"
                >
                  Set Departure Reminder
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TrafficAware;

