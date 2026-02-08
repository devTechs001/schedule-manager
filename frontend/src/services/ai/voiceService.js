// Voice recognition and text-to-speech service

class VoiceService {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
    this.onResult = null;
    this.onError = null;
    this.voices = [];
    this.init();
  }

  init() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event) => {
        const result = event.results[event.results.length - 1];
        const transcript = result[0].transcript;
        const isFinal = result.isFinal;
        this.onResult?.(transcript, isFinal);
      };

      this.recognition.onerror = (event) => {
        this.isListening = false;
        this.onError?.(event.error);
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };
    }

    // Load available voices
    if (this.synthesis) {
      this.synthesis.onvoiceschanged = () => {
        this.voices = this.synthesis.getVoices();
      };
      this.voices = this.synthesis.getVoices();
    }
  }

  // Start listening
  startListening(options = {}) {
    if (!this.recognition) {
      throw new Error('Speech recognition not supported');
    }

    if (options.language) {
      this.recognition.lang = options.language;
    }
    if (options.continuous !== undefined) {
      this.recognition.continuous = options.continuous;
    }
    if (options.onResult) {
      this.onResult = options.onResult;
    }
    if (options.onError) {
      this.onError = options.onError;
    }

    this.recognition.start();
    this.isListening = true;
  }

  // Stop listening
  stopListening() {
    if (this.recognition) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  // Text-to-speech
  speak(text, options = {}) {
    if (!this.synthesis) {
      throw new Error('Speech synthesis not supported');
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;
    utterance.lang = options.language || 'en-US';

    if (options.voiceName) {
      const voice = this.voices.find(v => v.name === options.voiceName);
      if (voice) utterance.voice = voice;
    }

    if (options.onEnd) {
      utterance.onend = options.onEnd;
    }

    this.synthesis.speak(utterance);
    return utterance;
  }

  // Stop speaking
  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  // Get available voices
  getVoices() {
    return this.voices;
  }

  // Check if supported
  isSupported() {
    return {
      recognition: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
      synthesis: !!window.speechSynthesis,
    };
  }

  // Parse voice command
  parseCommand(transcript) {
    const commands = {
      'create task': /create (?:a )?(?:new )?task(?: called)? (.+)/i,
      'schedule meeting': /schedule (?:a )?meeting(?: with)? (.+)/i,
      'set reminder': /(?:set )?(?:a )?reminder (?:to )?(.+)/i,
      'open calendar': /open (?:the )?calendar/i,
      'show tasks': /show (?:my )?(?:all )?tasks/i,
      'search': /search (?:for )?(.+)/i,
    };

    for (const [action, pattern] of Object.entries(commands)) {
      const match = transcript.match(pattern);
      if (match) {
        return { action, params: match[1] || null, matched: true };
      }
    }

    return { action: 'unknown', params: transcript, matched: false };
  }
}

export const voiceService = new VoiceService();
export default voiceService;

