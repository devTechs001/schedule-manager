import { useState, useEffect, useRef, useCallback } from 'react';

const useLazyLoading = (options = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    triggerOnce = true,
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const elementRef = useRef(null);
  const observerRef = useRef(null);

  // Set up intersection observer
  useEffect(() => {
    if (!elementRef.current || (triggerOnce && hasLoaded)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        
        if (entry.isIntersecting) {
          setHasLoaded(true);
          if (triggerOnce) {
            observer.disconnect();
          }
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(elementRef.current);
    observerRef.current = observer;

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce, hasLoaded]);

  // Manually trigger load
  const load = useCallback(() => {
    setHasLoaded(true);
    setIsIntersecting(true);
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
  }, []);

  // Reset loading state
  const reset = useCallback(() => {
    setHasLoaded(false);
    setIsIntersecting(false);
  }, []);

  return {
    ref: elementRef,
    isIntersecting,
    hasLoaded,
    load,
    reset,
  };
};

// Hook for lazy loading images
export const useLazyImage = (src, options = {}) => {
  const { placeholder = '', onLoad, onError } = options;
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { ref, hasLoaded } = useLazyLoading(options);

  useEffect(() => {
    if (!hasLoaded || !src) return;

    const img = new Image();
    img.src = src;

    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
      onLoad?.();
    };

    img.onerror = (e) => {
      setError(e);
      setIsLoading(false);
      onError?.(e);
    };
  }, [hasLoaded, src, onLoad, onError]);

  return {
    ref,
    src: imageSrc,
    isLoading,
    error,
    hasLoaded,
  };
};

// Hook for lazy loading components
export const useLazyComponent = (importFn, options = {}) => {
  const [Component, setComponent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { ref, hasLoaded } = useLazyLoading(options);

  useEffect(() => {
    if (!hasLoaded) return;

    setIsLoading(true);

    importFn()
      .then((module) => {
        setComponent(() => module.default);
        setIsLoading(false);
      })
      .catch((e) => {
        setError(e);
        setIsLoading(false);
      });
  }, [hasLoaded, importFn]);

  return {
    ref,
    Component,
    isLoading,
    error,
    hasLoaded,
  };
};

// Hook for infinite scroll
export const useInfiniteScroll = (loadMore, options = {}) => {
  const { hasMore = true, isLoading = false } = options;
  const { ref, isIntersecting } = useLazyLoading({ 
    ...options, 
    triggerOnce: false 
  });

  useEffect(() => {
    if (isIntersecting && hasMore && !isLoading) {
      loadMore();
    }
  }, [isIntersecting, hasMore, isLoading, loadMore]);

  return { ref, isLoading };
};

export default useLazyLoading;

