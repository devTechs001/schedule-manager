import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const PerformanceContext = createContext();

export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
};

export const PerformanceProvider = ({ children }) => {
  const [metrics, setMetrics] = useState({
    pageLoadTime: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    firstInputDelay: 0,
    cumulativeLayoutShift: 0,
    timeToInteractive: 0,
  });
  const [resourceMetrics, setResourceMetrics] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const observerRef = useRef(null);

  // Collect performance metrics
  useEffect(() => {
    if (typeof window === 'undefined' || !window.performance) return;

    const collectMetrics = () => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      
      const fcp = paint.find(p => p.name === 'first-contentful-paint');
      
      setMetrics(prev => ({
        ...prev,
        pageLoadTime: navigation?.loadEventEnd - navigation?.startTime || 0,
        firstContentfulPaint: fcp?.startTime || 0,
      }));
    };

    // Wait for page load
    if (document.readyState === 'complete') {
      collectMetrics();
    } else {
      window.addEventListener('load', collectMetrics);
      return () => window.removeEventListener('load', collectMetrics);
    }
  }, []);

  // Observe LCP
  useEffect(() => {
    if (typeof PerformanceObserver === 'undefined') return;

    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        setMetrics(prev => ({
          ...prev,
          largestContentfulPaint: lastEntry.startTime,
        }));
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

      return () => lcpObserver.disconnect();
    } catch (e) {
      console.warn('LCP observer not supported');
    }
  }, []);

  // Start performance monitoring
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    
    // Collect resource timing
    const resources = performance.getEntriesByType('resource');
    setResourceMetrics(resources.map(r => ({
      name: r.name,
      type: r.initiatorType,
      duration: r.duration,
      size: r.transferSize,
    })));
  }, []);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
  }, []);

  // Measure custom timing
  const measureTiming = useCallback((name, fn) => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    return {
      result,
      duration: end - start,
      name,
    };
  }, []);

  // Mark timing point
  const markTiming = useCallback((name) => {
    if (performance.mark) {
      performance.mark(name);
    }
  }, []);

  // Measure between marks
  const measureBetweenMarks = useCallback((name, startMark, endMark) => {
    if (performance.measure) {
      try {
        performance.measure(name, startMark, endMark);
        const measures = performance.getEntriesByName(name);
        return measures[measures.length - 1]?.duration || 0;
      } catch (e) {
        return 0;
      }
    }
    return 0;
  }, []);

  // Get memory usage (if available)
  const getMemoryUsage = useCallback(() => {
    if (performance.memory) {
      return {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
      };
    }
    return null;
  }, []);

  // Calculate performance score
  const getPerformanceScore = useCallback(() => {
    const { largestContentfulPaint, firstInputDelay, cumulativeLayoutShift } = metrics;
    
    // Simplified scoring based on Core Web Vitals thresholds
    let score = 100;
    
    if (largestContentfulPaint > 4000) score -= 30;
    else if (largestContentfulPaint > 2500) score -= 15;
    
    if (firstInputDelay > 300) score -= 30;
    else if (firstInputDelay > 100) score -= 15;
    
    if (cumulativeLayoutShift > 0.25) score -= 30;
    else if (cumulativeLayoutShift > 0.1) score -= 15;
    
    return Math.max(0, score);
  }, [metrics]);

  const value = {
    metrics,
    resourceMetrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    measureTiming,
    markTiming,
    measureBetweenMarks,
    getMemoryUsage,
    getPerformanceScore,
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
};

export default PerformanceContext;

