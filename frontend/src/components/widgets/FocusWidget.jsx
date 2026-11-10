import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FaBrain, FaPlay, FaPause, FaRedo, FaCog, FaCheck, FaCoffee } from 'react-icons/fa';

const FocusWidget = ({ 
  defaultDuration = 25,
  breakDuration = 5,
  onComplete,
  onStart,
  compact = false,
}) => {
  const [duration, setDuration] = useState(defaultDuration);
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const intervalRef = useRef(null);

  /*
   * handleComplete was previously declared *below* this effect and called from
   * inside it. In a const-arrow function that is a temporal-dead-zone error the
   * first time the clock hits zero, which would unmount the whole app (there is
   * no error boundary above this widget). It is now declared first and wrapped
   * in useCallback so the dependency list is honest.
   */
  const handleComplete = useCallback(() => {
    setIsRunning(false);
    if (!isBreak) {
      setSessions((count) => count + 1);
      setIsBreak(true);
      setTimeLeft(breakDuration * 60);
      onComplete?.({ type: 'focus' });
    } else {
      setIsBreak(false);
      setTimeLeft(duration * 60);
      onComplete?.({ type: 'break' });
    }
  }, [isBreak, breakDuration, duration, onComplete]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      handleComplete();
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft, handleComplete]);

  const handleStart = () => {
    setIsRunning(true);
    onStart?.();
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(isBreak ? breakDuration * 60 : duration * 60);
  };



  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = isBreak 
    ? ((breakDuration * 60 - timeLeft) / (breakDuration * 60)) * 100
    : ((duration * 60 - timeLeft) / (duration * 60)) * 100;

  if (compact) {
    return (
      <div className={`rounded-lg shadow-lg p-4 ${isBreak ? 'bg-green-500' : 'bg-primary-600'} text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isBreak ? <FaCoffee className="text-xl" /> : <FaBrain className="text-xl" />}
            <div>
              <p className="text-2xl font-bold font-mono">{formatTime(timeLeft)}</p>
              <p className="text-xs opacity-80">{isBreak ? 'Break Time' : 'Focus Time'}</p>
            </div>
          </div>
          <button
            onClick={isRunning ? handlePause : handleStart}
            className="w-10 h-10 rounded-full bg-surface/20 flex items-center justify-center hover:bg-surface/30"
          >
            {isRunning ? <FaPause /> : <FaPlay />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaBrain className="text-primary-600 text-xl" />
          <h3 className="text-lg font-semibold text-content">Focus Timer</h3>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 text-content-muted hover:bg-surface-sunken rounded-lg"
        >
          <FaCog />
        </button>
      </div>

      {/* Timer Display */}
      <div className={`relative mx-auto w-48 h-48 rounded-full flex items-center justify-center mb-6 ${
        isBreak ? 'bg-green-100 dark:bg-green-900/30' : 'bg-primary-100 dark:bg-primary-900/30'
      }`}>
        {/* Progress Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle cx="96" cy="96" r="88" fill="none" stroke="currentColor" strokeWidth="8"
            className="text-content-subtle dark:text-content" />
          <circle cx="96" cy="96" r="88" fill="none" stroke="currentColor" strokeWidth="8"
            strokeDasharray={2 * Math.PI * 88} strokeDashoffset={2 * Math.PI * 88 * (1 - progress / 100)}
            strokeLinecap="round"
            className={isBreak ? 'text-green-500' : 'text-primary-500'}
          />
        </svg>
        <div className="text-center z-10">
          <p className="text-4xl font-bold font-mono text-content">
            {formatTime(timeLeft)}
          </p>
          <p className={`text-sm ${isBreak ? 'text-green-600' : 'text-primary-600'}`}>
            {isBreak ? 'Break' : 'Focus'}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={handleReset}
          className="w-12 h-12 rounded-full bg-surface-sunken flex items-center justify-center hover:bg-surface-sunken"
        >
          <FaRedo className="text-content-muted" />
        </button>
        <button
          onClick={isRunning ? handlePause : handleStart}
          className={`w-16 h-16 rounded-full flex items-center justify-center text-white ${
            isBreak ? 'bg-green-500 hover:bg-green-600' : 'bg-primary-600 hover:bg-primary-700'
          }`}
        >
          {isRunning ? <FaPause className="text-xl" /> : <FaPlay className="text-xl ml-1" />}
        </button>
        <button
          onClick={handleComplete}
          className="w-12 h-12 rounded-full bg-surface-sunken flex items-center justify-center hover:bg-surface-sunken"
        >
          <FaCheck className="text-content-muted" />
        </button>
      </div>

      {/* Sessions Counter */}
      <div className="flex items-center justify-center gap-2">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full ${
              i < sessions % 4 ? 'bg-primary-500' : 'bg-surface-sunken'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-content-muted">{sessions} sessions today</span>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mt-4 p-4 bg-surface-sunken rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-content-muted mb-1 block">Focus (min)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => { setDuration(Number(e.target.value)); setTimeLeft(Number(e.target.value) * 60); }}
                className="w-full px-3 py-2 border rounded-lg bg-surface-raised border-line"
              />
            </div>
            <div>
              <label className="text-xs text-content-muted mb-1 block">Break (min)</label>
              <input
                type="number"
                value={breakDuration}
                className="w-full px-3 py-2 border rounded-lg bg-surface-raised border-line"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FocusWidget;

