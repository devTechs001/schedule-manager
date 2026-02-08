import { useState, useCallback, useEffect, useRef } from 'react';

const useWebWorker = (workerScript, options = {}) => {
  const { 
    autoTerminate = false,
    timeout = 30000,
  } = options;

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const workerRef = useRef(null);
  const timeoutRef = useRef(null);

  // Create worker from inline script
  const createInlineWorker = useCallback((fn) => {
    const blob = new Blob([`
      self.onmessage = function(e) {
        const fn = ${fn.toString()};
        try {
          const result = fn(e.data);
          if (result instanceof Promise) {
            result.then(r => self.postMessage({ success: true, data: r }))
                  .catch(err => self.postMessage({ success: false, error: err.message }));
          } else {
            self.postMessage({ success: true, data: result });
          }
        } catch (err) {
          self.postMessage({ success: false, error: err.message });
        }
      };
    `], { type: 'application/javascript' });
    return new Worker(URL.createObjectURL(blob));
  }, []);

  // Initialize worker
  useEffect(() => {
    if (typeof workerScript === 'function') {
      workerRef.current = createInlineWorker(workerScript);
    } else if (typeof workerScript === 'string') {
      workerRef.current = new Worker(workerScript);
    }

    if (workerRef.current) {
      workerRef.current.onmessage = (e) => {
        clearTimeout(timeoutRef.current);
        setIsRunning(false);

        if (e.data.success) {
          setResult(e.data.data);
          setError(null);
        } else {
          setError(e.data.error);
          setResult(null);
        }

        if (autoTerminate) {
          workerRef.current?.terminate();
        }
      };

      workerRef.current.onerror = (e) => {
        clearTimeout(timeoutRef.current);
        setIsRunning(false);
        setError(e.message);
      };
    }

    return () => {
      clearTimeout(timeoutRef.current);
      workerRef.current?.terminate();
    };
  }, [workerScript, autoTerminate, createInlineWorker]);

  // Run worker with data
  const run = useCallback((data) => {
    if (!workerRef.current) {
      setError('Worker not initialized');
      return Promise.reject(new Error('Worker not initialized'));
    }

    setIsRunning(true);
    setError(null);

    return new Promise((resolve, reject) => {
      timeoutRef.current = setTimeout(() => {
        setIsRunning(false);
        setError('Worker timeout');
        reject(new Error('Worker timeout'));
      }, timeout);

      const handler = (e) => {
        workerRef.current?.removeEventListener('message', handler);
        if (e.data.success) {
          resolve(e.data.data);
        } else {
          reject(new Error(e.data.error));
        }
      };

      workerRef.current.addEventListener('message', handler);
      workerRef.current.postMessage(data);
    });
  }, [timeout]);

  // Terminate worker
  const terminate = useCallback(() => {
    clearTimeout(timeoutRef.current);
    workerRef.current?.terminate();
    setIsRunning(false);
  }, []);

  return {
    result,
    error,
    isRunning,
    run,
    terminate,
  };
};

// Helper to run heavy computation off main thread
export const runAsync = (fn, data) => {
  return new Promise((resolve, reject) => {
    const blob = new Blob([`
      self.onmessage = function(e) {
        const fn = ${fn.toString()};
        try {
          const result = fn(e.data);
          self.postMessage({ success: true, data: result });
        } catch (err) {
          self.postMessage({ success: false, error: err.message });
        }
      };
    `], { type: 'application/javascript' });

    const worker = new Worker(URL.createObjectURL(blob));

    worker.onmessage = (e) => {
      worker.terminate();
      if (e.data.success) {
        resolve(e.data.data);
      } else {
        reject(new Error(e.data.error));
      }
    };

    worker.onerror = (e) => {
      worker.terminate();
      reject(new Error(e.message));
    };

    worker.postMessage(data);
  });
};

export default useWebWorker;

