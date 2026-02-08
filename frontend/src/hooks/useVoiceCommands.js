import { useState, useEffect, useCallback, useRef } from 'react';

const useVoiceCommands = (options = {}) => {
  const {
    onCommand,
    commands = [],
    continuous = false,
    language = 'en-US',
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = continuous;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language;

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          }
        }
        
        if (finalTranscript) {
          setTranscript(finalTranscript);
          processCommand(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        setError(event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        if (continuous && isListening) {
          recognitionRef.current.start();
        } else {
          setIsListening(false);
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [continuous, language]);

  // Process voice command
  const processCommand = useCallback((text) => {
    const lowerText = text.toLowerCase().trim();
    
    for (const cmd of commands) {
      const patterns = Array.isArray(cmd.patterns) ? cmd.patterns : [cmd.patterns];
      
      for (const pattern of patterns) {
        if (typeof pattern === 'string') {
          if (lowerText.includes(pattern.toLowerCase())) {
            onCommand?.(cmd.action, text);
            return;
          }
        } else if (pattern instanceof RegExp) {
          const match = lowerText.match(pattern);
          if (match) {
            onCommand?.(cmd.action, text, match);
            return;
          }
        }
      }
    }
    
    // No matching command found
    onCommand?.('unknown', text);
  }, [commands, onCommand]);

  // Start listening
  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      setError('Speech recognition not supported');
      return;
    }

    try {
      recognitionRef.current.start();
      setIsListening(true);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, [isSupported]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Speak text (text-to-speech)
  const speak = useCallback((text, options = {}) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options.lang || language;
      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;
      speechSynthesis.speak(utterance);
    }
  }, [language]);

  return {
    isListening,
    isSupported,
    transcript,
    error,
    startListening,
    stopListening,
    toggleListening,
    speak,
  };
};

export default useVoiceCommands;

