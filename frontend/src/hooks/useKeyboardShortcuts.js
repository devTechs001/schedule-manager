import { useEffect, useCallback, useRef } from 'react';

const useKeyboardShortcuts = (shortcuts = [], options = {}) => {
  const { 
    enabled = true,
    preventDefault = true,
    stopPropagation = false,
    ignoreInputs = true,
  } = options;

  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  const parseShortcut = useCallback((shortcut) => {
    const parts = shortcut.toLowerCase().split('+');
    return {
      ctrl: parts.includes('ctrl') || parts.includes('control'),
      alt: parts.includes('alt'),
      shift: parts.includes('shift'),
      meta: parts.includes('meta') || parts.includes('cmd') || parts.includes('command'),
      key: parts.filter(p => !['ctrl', 'control', 'alt', 'shift', 'meta', 'cmd', 'command'].includes(p))[0],
    };
  }, []);

  const matchShortcut = useCallback((event, shortcut) => {
    const parsed = parseShortcut(shortcut);
    
    return (
      event.ctrlKey === parsed.ctrl &&
      event.altKey === parsed.alt &&
      event.shiftKey === parsed.shift &&
      event.metaKey === parsed.meta &&
      event.key.toLowerCase() === parsed.key
    );
  }, [parseShortcut]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event) => {
      // Ignore if focused on input elements
      if (ignoreInputs) {
        const target = event.target;
        const tagName = target.tagName.toLowerCase();
        const isInput = tagName === 'input' || tagName === 'textarea' || target.isContentEditable;
        
        // Allow shortcuts with Ctrl/Cmd even in inputs
        if (isInput && !event.ctrlKey && !event.metaKey) {
          return;
        }
      }

      for (const { shortcut, action, description } of shortcutsRef.current) {
        const shortcuts = Array.isArray(shortcut) ? shortcut : [shortcut];
        
        for (const sc of shortcuts) {
          if (matchShortcut(event, sc)) {
            if (preventDefault) {
              event.preventDefault();
            }
            if (stopPropagation) {
              event.stopPropagation();
            }
            action(event);
            return;
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, preventDefault, stopPropagation, ignoreInputs, matchShortcut]);

  // Register a new shortcut dynamically
  const registerShortcut = useCallback((shortcut, action, description = '') => {
    shortcutsRef.current = [...shortcutsRef.current, { shortcut, action, description }];
  }, []);

  // Unregister a shortcut
  const unregisterShortcut = useCallback((shortcut) => {
    shortcutsRef.current = shortcutsRef.current.filter(s => s.shortcut !== shortcut);
  }, []);

  // Get all registered shortcuts
  const getShortcuts = useCallback(() => {
    return shortcutsRef.current.map(({ shortcut, description }) => ({
      shortcut,
      description,
    }));
  }, []);

  // Format shortcut for display
  const formatShortcut = useCallback((shortcut) => {
    const isMac = navigator.platform.toUpperCase().includes('MAC');
    
    return shortcut
      .replace(/ctrl/gi, isMac ? '⌃' : 'Ctrl')
      .replace(/alt/gi, isMac ? '⌥' : 'Alt')
      .replace(/shift/gi, isMac ? '⇧' : 'Shift')
      .replace(/meta|cmd|command/gi, isMac ? '⌘' : 'Win')
      .replace(/\+/g, isMac ? '' : '+')
      .replace(/(\w)/g, (match) => match.toUpperCase());
  }, []);

  return {
    registerShortcut,
    unregisterShortcut,
    getShortcuts,
    formatShortcut,
  };
};

// Common shortcuts preset
export const commonShortcuts = {
  save: 'ctrl+s',
  undo: 'ctrl+z',
  redo: 'ctrl+shift+z',
  copy: 'ctrl+c',
  paste: 'ctrl+v',
  cut: 'ctrl+x',
  selectAll: 'ctrl+a',
  find: 'ctrl+f',
  newItem: 'ctrl+n',
  delete: 'delete',
  escape: 'escape',
  enter: 'enter',
  commandPalette: 'ctrl+k',
  help: 'ctrl+/',
};

export default useKeyboardShortcuts;

