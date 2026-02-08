import { useState, useCallback, useRef } from 'react';

const useUndoRedo = (initialState, options = {}) => {
  const {
    maxHistory = 50,
    onUndo,
    onRedo,
  } = options;

  const [state, setState] = useState(initialState);
  const historyRef = useRef([initialState]);
  const indexRef = useRef(0);

  // Check if we can undo
  const canUndo = indexRef.current > 0;

  // Check if we can redo
  const canRedo = indexRef.current < historyRef.current.length - 1;

  // Set state with history tracking
  const set = useCallback((newState) => {
    const actualNewState = typeof newState === 'function' 
      ? newState(state) 
      : newState;

    // Don't add to history if state hasn't changed
    if (JSON.stringify(actualNewState) === JSON.stringify(state)) {
      return;
    }

    // Remove any future states if we're not at the end
    historyRef.current = historyRef.current.slice(0, indexRef.current + 1);
    
    // Add new state
    historyRef.current.push(actualNewState);
    
    // Trim history if it exceeds max
    if (historyRef.current.length > maxHistory) {
      historyRef.current = historyRef.current.slice(-maxHistory);
    }
    
    indexRef.current = historyRef.current.length - 1;
    setState(actualNewState);
  }, [state, maxHistory]);

  // Undo
  const undo = useCallback(() => {
    if (!canUndo) return state;

    indexRef.current -= 1;
    const previousState = historyRef.current[indexRef.current];
    setState(previousState);
    onUndo?.(previousState, state);
    
    return previousState;
  }, [canUndo, state, onUndo]);

  // Redo
  const redo = useCallback(() => {
    if (!canRedo) return state;

    indexRef.current += 1;
    const nextState = historyRef.current[indexRef.current];
    setState(nextState);
    onRedo?.(nextState, state);
    
    return nextState;
  }, [canRedo, state, onRedo]);

  // Go to specific point in history
  const goTo = useCallback((index) => {
    if (index < 0 || index >= historyRef.current.length) return state;
    
    indexRef.current = index;
    const targetState = historyRef.current[index];
    setState(targetState);
    
    return targetState;
  }, [state]);

  // Clear history
  const clear = useCallback((newInitialState = state) => {
    historyRef.current = [newInitialState];
    indexRef.current = 0;
    setState(newInitialState);
  }, [state]);

  // Get history info
  const getHistory = useCallback(() => ({
    past: historyRef.current.slice(0, indexRef.current),
    present: state,
    future: historyRef.current.slice(indexRef.current + 1),
    index: indexRef.current,
    length: historyRef.current.length,
  }), [state]);

  // Create a snapshot/checkpoint
  const checkpoint = useCallback(() => {
    return {
      state,
      index: indexRef.current,
      history: [...historyRef.current],
    };
  }, [state]);

  // Restore from checkpoint
  const restore = useCallback((snapshot) => {
    historyRef.current = [...snapshot.history];
    indexRef.current = snapshot.index;
    setState(snapshot.state);
  }, []);

  return {
    state,
    set,
    undo,
    redo,
    canUndo,
    canRedo,
    goTo,
    clear,
    getHistory,
    checkpoint,
    restore,
    historyLength: historyRef.current.length,
    currentIndex: indexRef.current,
  };
};

export default useUndoRedo;

