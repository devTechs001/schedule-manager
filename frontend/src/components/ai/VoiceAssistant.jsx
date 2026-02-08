import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaStop } from 'react-icons/fa';

const VoiceAssistant = ({ onCommand, onTranscript }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);
      
      if (finalTranscript && onTranscript) {
        onTranscript(finalTranscript);
      }
    };

    recognitionRef.current.onerror = (event) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      if (transcript && onCommand) {
        onCommand(transcript);
      }
    } else {
      setTranscript('');
      setError(null);
      recognitionRef.current?.start();
    }
    setIsListening(!isListening);
  }, [isListening, transcript, onCommand]);

  return (
    <div className="flex flex-col items-center p-4">
      <button
        onClick={toggleListening}
        disabled={!!error}
        className={`p-4 rounded-full transition-all duration-300 ${
          isListening
            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
            : 'bg-primary-600 hover:bg-primary-700'
        } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isListening ? <FaStop size={24} /> : <FaMicrophone size={24} />}
      </button>
      
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        {isListening ? 'Listening...' : 'Click to speak'}
      </p>

      {transcript && (
        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg max-w-md">
          <p className="text-sm text-gray-700 dark:text-gray-300">{transcript}</p>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default VoiceAssistant;

