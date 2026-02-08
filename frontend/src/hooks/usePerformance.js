import { useState, useCallback, useEffect, useRef } from 'react';

const usePerformance = (options = {}) => {
  const {
    enableMonitoring = true,
    sampleRate = 1000, // ms
    warningThreshold = 50, // ms for long tasks
  } = options;

  const [metrics, setMetrics] = useState({
    fps: 0,
    memory: null,
    longTasks: [],
    resourceTiming: [],
  });
  const [isMonitoring, setIsMonitoring] = useState(false);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const rafIdRef = useRef(null);

  // Measure FPS
  const measureFPS = useCallback(() => {
    const now = performance.now();
    frameCountRef.current++;

    if (now - lastTimeRef.current >= sampleRate) {
      const fps = Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current));
      setMetrics(prev => ({ ...prev, fps }));
      frameCountRef.current = 0;
      lastTimeRef.current = now;
    }

    if (isMonitoring) {
      rafIdRef.current = requestAnimationFrame(measureFPS);
    }
  }, [isMonitoring, sampleRate]);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    rafIdRef.current = requestAnimationFrame(measureFPS);

    // Long task observer
    if (typeof PerformanceObserver !== 'undefined') {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.duration > warningThreshold) {
              setMetrics(prev => ({
                ...prev,
                longTasks: [...prev.longTasks.slice(-10), {
                  duration: entry.duration,
                  startTime: entry.startTime,
                  name: entry.name,
                }],
              }));
            }
          });
        });
        observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        console.warn('Long task observer not supported');
      }
    }
  }, [measureFPS, warningThreshold]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }
  }, []);

  // Get memory info
  const getMemoryInfo = useCallback(() => {
    if (performance.memory) {
      return {
        usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / 1048576),
        totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / 1048576),
        jsHeapSizeLimit: Math.round(performance.memory.jsHeapSizeLimit / 1048576),
      };
    }
    return null;
  }, []);

  // Measure component render time
  const measureRender = useCallback((componentName, renderFn) => {
    const start = performance.now();
    const result = renderFn();
    const duration = performance.now() - start;

    if (duration > warningThreshold) {
      console.warn(`Slow render: ${componentName} took ${duration.toFixed(2)}ms`);
    }

    return { result, duration };
  }, [warningThreshold]);

  // Create performance mark
  const mark = useCallback((name) => {
    performance.mark(name);
  }, []);

  // Measure between marks
  const measure = useCallback((name, startMark, endMark) => {
    try {
      performance.measure(name, startMark, endMark);
      const measures = performance.getEntriesByName(name);
      return measures[measures.length - 1]?.duration || 0;
    } catch (e) {
      return 0;
    }
  }, []);

  // Get resource timing
  const getResourceTiming = useCallback(() => {
    return performance.getEntriesByType('resource').map(r => ({
      name: r.name.split('/').pop(),
      type: r.initiatorType,
      duration: Math.round(r.duration),
      size: r.transferSize,
    }));
  }, []);

  // Clear performance entries
  const clearEntries = useCallback(() => {
    performance.clearMarks();
    performance.clearMeasures();
    performance.clearResourceTimings();
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    getMemoryInfo,
    measureRender,
    mark,
    measure,
    getResourceTiming,
    clearEntries,
  };
};

export default usePerformance;