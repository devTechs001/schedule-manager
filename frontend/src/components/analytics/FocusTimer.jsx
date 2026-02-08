import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaPlay, FaPause, FaRedo, FaCog, FaCoffee } from 'react-icons/fa';

const FocusTimer = ({ onSessionComplete }) => {
  const [mode, setMode] = useState('focus'); // focus, shortBreak, longBreak
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef(null);

  const durations = {
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionComplete();
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);

  const handleSessionComplete = useCallback(() => {
    setIsRunning(false);
    if (mode === 'focus') {
      setSessions((prev) => prev + 1);
      onSessionComplete?.({ type: 'focus', duration: durations.focus });
      // Auto switch to break
      if ((sessions + 1) % 4 === 0) {
        setMode('longBreak');
        setTimeLeft(durations.longBreak);
      } else {
        setMode('shortBreak');
        setTimeLeft(durations.shortBreak);
      }
    } else {
      setMode('focus');
      setTimeLeft(durations.focus);
    }
  }, [mode, sessions, onSessionComplete]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(durations[mode]);
  };

  const switchMode = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(durations[newMode]);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((durations[mode] - timeLeft) / durations[mode]) * 100;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-center gap-2 mb-6">
        {['focus', 'shortBreak', 'longBreak'].map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === m
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {m === 'focus' ? 'Focus' : m === 'shortBreak' ? 'Short Break' : 'Long Break'}
          </button>
        ))}
      </div>

      <div className="relative w-48 h-48 mx-auto mb-6">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="96" cy="96" r="88"
            className="stroke-gray-200 dark:stroke-gray-700"
            fill="none" strokeWidth="8"
          />
          <circle
            cx="96" cy="96" r="88"
            className={`${mode === 'focus' ? 'stroke-primary-500' : 'stroke-green-500'}`}
            fill="none" strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={553}
            strokeDashoffset={553 - (progress / 100) * 553}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-gray-900 dark:text-white">
            {formatTime(timeLeft)}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
            {mode === 'focus' ? 'Focus Time' : 'Break'}
          </span>
        </div>
      </div>

      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={toggleTimer}
          className={`p-4 rounded-full ${
            isRunning ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-primary-600 hover:bg-primary-700'
          } text-white transition-colors`}
        >
          {isRunning ? <FaPause size={20} /> : <FaPlay size={20} />}
        </button>
        <button
          onClick={resetTimer}
          className="p-4 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          <FaRedo size={20} />
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
        <FaCoffee />
        <span>Sessions completed: {sessions}</span>
      </div>
    </div>
  );
};

export default FocusTimer;

