import React, { useState } from 'react';
import { FaBolt, FaBatteryFull, FaBatteryHalf, FaBatteryQuarter } from 'react-icons/fa';

const EnergyTracker = ({ onLog }) => {
  const [entries, setEntries] = useState([]);
  const [currentEnergy, setCurrentEnergy] = useState(3);
  const [notes, setNotes] = useState('');

  const energyLevels = [
    { value: 1, label: 'Very Low', icon: FaBatteryQuarter, color: 'red' },
    { value: 2, label: 'Low', icon: FaBatteryQuarter, color: 'orange' },
    { value: 3, label: 'Medium', icon: FaBatteryHalf, color: 'yellow' },
    { value: 4, label: 'High', icon: FaBatteryHalf, color: 'green' },
    { value: 5, label: 'Very High', icon: FaBatteryFull, color: 'emerald' },
  ];

  const logEnergy = () => {
    const entry = {
      id: Date.now(),
      level: currentEnergy,
      notes,
      timestamp: new Date(),
    };
    setEntries([entry, ...entries]);
    onLog?.(entry);
    setNotes('');
  };

  const getAverageEnergy = () => {
    if (entries.length === 0) return 0;
    return (entries.reduce((sum, e) => sum + e.level, 0) / entries.length).toFixed(1);
  };

  const getEnergyPattern = () => {
    const hourlyData = {};
    entries.forEach(e => {
      const hour = new Date(e.timestamp).getHours();
      if (!hourlyData[hour]) hourlyData[hour] = [];
      hourlyData[hour].push(e.level);
    });
    
    let peakHour = null, peakAvg = 0;
    Object.entries(hourlyData).forEach(([hour, levels]) => {
      const avg = levels.reduce((a, b) => a + b, 0) / levels.length;
      if (avg > peakAvg) {
        peakAvg = avg;
        peakHour = parseInt(hour);
      }
    });
    return peakHour !== null ? `${peakHour}:00` : 'Not enough data';
  };

  const getEnergyInfo = (level) => energyLevels.find(e => e.value === level);

  return (
    <div className="bg-surface rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <FaBolt className="text-yellow-500 text-xl" />
        <h3 className="text-lg font-semibold text-content">Energy Tracker</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-surface-sunken rounded-lg text-center">
          <p className="text-3xl font-bold text-primary-600">{getAverageEnergy()}</p>
          <p className="text-sm text-content-muted">Avg Energy</p>
        </div>
        <div className="p-4 bg-surface-sunken rounded-lg text-center">
          <p className="text-lg font-bold text-green-600">{getEnergyPattern()}</p>
          <p className="text-sm text-content-muted">Peak Hour</p>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-content mb-2">
          How's your energy right now?
        </label>
        <div className="flex justify-between gap-2">
          {energyLevels.map((level) => (
            <button
              key={level.value}
              onClick={() => setCurrentEnergy(level.value)}
              className={`flex-1 p-3 rounded-lg flex flex-col items-center transition-all ${
                currentEnergy === level.value
                  ? `bg-surface-sunken ring-2 ring-line`
                  : 'bg-surface-sunken hover:bg-surface-sunken hover:bg-surface-sunken'
              }`}
            >
              <level.icon className={`text-content-muted text-xl mb-1`} />
              <span className="text-xs text-content-muted">{level.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes (e.g., after coffee, post-lunch...)"
          className="w-full px-3 py-2 border border-line rounded-lg bg-white bg-surface-sunken text-content"
        />
      </div>

      <button
        onClick={logEnergy}
        className="w-full px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium"
      >
        Log Energy Level
      </button>

      {entries.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium text-content mb-3">Recent Entries</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {entries.slice(0, 10).map((entry) => {
              const info = getEnergyInfo(entry.level);
              return (
                <div key={entry.id} className="flex items-center justify-between p-2 bg-surface-sunken rounded">
                  <div className="flex items-center gap-2">
                    <info.icon className={`text-content-muted`} />
                    <span className="text-content">{info.label}</span>
                    {entry.notes && (
                      <span className="text-sm text-content-muted">- {entry.notes}</span>
                    )}
                  </div>
                  <span className="text-xs text-content-muted">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnergyTracker;

