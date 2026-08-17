import React, { createContext, useContext, useReducer, useEffect } from 'react';

const PerformanceContext = createContext();

const initialState = {
  metrics: {
    pageLoadTime: 0,
    apiResponseTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    bundleSize: 0,
    errorRate: 0,
    userInteractions: 0,
  },
  alerts: [],
  isMonitoring: false,
  performanceThresholds: {
    pageLoadTime: 3000, // 3 seconds
    apiResponseTime: 1000, // 1 second
    renderTime: 100, // 100ms
    memoryUsage: 50, // 50MB
    errorRate: 0.01, // 1%
  },
  recommendations: [],
};

const performanceReducer = (state, action) => {
  switch (action.type) {
    case 'SET_MONITORING':
      return { ...state, isMonitoring: action.payload };
    
    case 'UPDATE_METRICS':
      return {
        ...state,
        metrics: { ...state.metrics, ...action.payload },
      };
    
    case 'ADD_ALERT':
      return {
        ...state,
        alerts: [...state.alerts, action.payload],
      };
    
    case 'CLEAR_ALERTS':
      return { ...state, alerts: [] };
    
    case 'ADD_RECOMMENDATION':
      return {
        ...state,
        recommendations: [...state.recommendations, action.payload],
      };
    
    case 'CLEAR_RECOMMENDATIONS':
      return { ...state, recommendations: [] };
    
    case 'UPDATE_THRESHOLDS':
      return {
        ...state,
        performanceThresholds: { ...state.performanceThresholds, ...action.payload },
      };
    
    default:
      return state;
  }
};

export const PerformanceProvider = ({ children }) => {
  const [state, dispatch] = useReducer(performanceReducer, initialState);

  useEffect(() => {
    if (state.isMonitoring) {
      startMonitoring();
    }
    return () => {
      stopMonitoring();
    };
  }, [state.isMonitoring]);

  const startMonitoring = () => {
    // Monitor page load time
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigationEntries = performance.getEntriesByType('navigation');
      if (navigationEntries.length > 0) {
        const loadTime = navigationEntries[0].loadEventEnd - navigationEntries[0].startTime;
        dispatch({
          type: 'UPDATE_METRICS',
          payload: { pageLoadTime: Math.round(loadTime) },
        });
        checkThreshold('pageLoadTime', loadTime);
      }
    }

    // Monitor memory usage
    if ('memory' in performance) {
      const memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024; // MB
      dispatch({
        type: 'UPDATE_METRICS',
        payload: { memoryUsage: Math.round(memoryUsage * 100) / 100 },
      });
      checkThreshold('memoryUsage', memoryUsage);
    }

    // Monitor API response times
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        dispatch({
          type: 'UPDATE_METRICS',
          payload: { apiResponseTime: Math.round(responseTime) },
        });
        checkThreshold('apiResponseTime', responseTime);
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        dispatch({
          type: 'UPDATE_METRICS',
          payload: { apiResponseTime: Math.round(responseTime) },
        });
        
        throw error;
      }
    };

    // Monitor user interactions
    let interactionCount = 0;
    const trackInteraction = () => {
      interactionCount++;
      dispatch({
        type: 'UPDATE_METRICS',
        payload: { userInteractions: interactionCount },
      });
    };

    document.addEventListener('click', trackInteraction);
    document.addEventListener('keydown', trackInteraction);

    // Monitor render times using MutationObserver
    const observer = new MutationObserver((mutations) => {
      const startTime = performance.now();
      requestAnimationFrame(() => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        
        dispatch({
          type: 'UPDATE_METRICS',
          payload: { renderTime: Math.round(renderTime * 100) / 100 },
        });
        checkThreshold('renderTime', renderTime);
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    return () => {
      window.fetch = originalFetch;
      document.removeEventListener('click', trackInteraction);
      document.removeEventListener('keydown', trackInteraction);
      observer.disconnect();
    };
  };

  const stopMonitoring = () => {
    // Cleanup is handled in the return function of startMonitoring
  };

  const checkThreshold = (metric, value) => {
    const threshold = state.performanceThresholds[metric];
    if (value > threshold) {
      dispatch({
        type: 'ADD_ALERT',
        payload: {
          id: Date.now(),
          metric,
          value,
          threshold,
          severity: value > threshold * 2 ? 'high' : 'medium',
          timestamp: new Date().toISOString(),
          message: `${metric} (${value}) exceeds threshold (${threshold})`,
        },
      });

      // Generate recommendations
      generateRecommendation(metric, value, threshold);
    }
  };

  const generateRecommendation = (metric, value, threshold) => {
    let recommendation = null;

    switch (metric) {
      case 'pageLoadTime':
        if (value > threshold) {
          recommendation = {
            id: Date.now(),
            type: 'optimization',
            metric,
            message: 'Consider lazy loading components and optimizing bundle size',
            priority: 'high',
          };
        }
        break;
      
      case 'apiResponseTime':
        if (value > threshold) {
          recommendation = {
            id: Date.now(),
            type: 'api',
            metric,
            message: 'API responses are slow. Consider implementing caching or optimizing database queries',
            priority: 'medium',
          };
        }
        break;
      
      case 'memoryUsage':
        if (value > threshold) {
          recommendation = {
            id: Date.now(),
            type: 'memory',
            metric,
            message: 'High memory usage detected. Check for memory leaks and optimize data structures',
            priority: 'high',
          };
        }
        break;
      
      case 'renderTime':
        if (value > threshold) {
          recommendation = {
            id: Date.now(),
            type: 'render',
            metric,
            message: 'Slow render times detected. Consider virtualization or reducing component complexity',
            priority: 'medium',
          };
        }
        break;
    }

    if (recommendation) {
      dispatch({ type: 'ADD_RECOMMENDATION', payload: recommendation });
    }
  };

  const trackCustomMetric = (name, value, unit = 'ms') => {
    dispatch({
      type: 'UPDATE_METRICS',
      payload: { [name]: value },
    });

    // Check against custom threshold if it exists
    const threshold = state.performanceThresholds[name];
    if (threshold && value > threshold) {
      checkThreshold(name, value);
    }
  };

  const startPerformanceMonitoring = () => {
    dispatch({ type: 'SET_MONITORING', payload: true });
  };

  const stopPerformanceMonitoring = () => {
    dispatch({ type: 'SET_MONITORING', payload: false });
  };

  const clearAlerts = () => {
    dispatch({ type: 'CLEAR_ALERTS' });
  };

  const clearRecommendations = () => {
    dispatch({ type: 'CLEAR_RECOMMENDATIONS' });
  };

  const updateThresholds = (newThresholds) => {
    dispatch({ type: 'UPDATE_THRESHOLDS', payload: newThresholds });
  };

  const getPerformanceReport = () => {
    return {
      metrics: state.metrics,
      alerts: state.alerts,
      recommendations: state.recommendations,
      timestamp: new Date().toISOString(),
      healthScore: calculateHealthScore(),
    };
  };

  const calculateHealthScore = () => {
    const { metrics, performanceThresholds } = state;
    let score = 100;
    let factors = 0;

    Object.keys(metrics).forEach(metric => {
      const threshold = performanceThresholds[metric];
      if (threshold && typeof metrics[metric] === 'number') {
        factors++;
        if (metrics[metric] > threshold) {
          const overage = (metrics[metric] - threshold) / threshold;
          score -= Math.min(50, overage * 50);
        }
      }
    });

    return factors > 0 ? Math.max(0, Math.round(score)) : 100;
  };

  const value = {
    ...state,
    startPerformanceMonitoring,
    stopPerformanceMonitoring,
    trackCustomMetric,
    clearAlerts,
    clearRecommendations,
    updateThresholds,
    getPerformanceReport,
    calculateHealthScore,
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
};

export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
};

export default PerformanceContext;
