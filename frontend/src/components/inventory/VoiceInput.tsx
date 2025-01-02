'use client'

import React, { useState, useEffect } from 'react';

interface VoiceInputProps {
  onTranscript: (transcript: string) => void;
}

export default function VoiceInput({ onTranscript }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Detect browser
  const getBrowserInfo = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Brave")) return "Brave";
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Safari")) return "Safari";
    return "Unknown";
  };

  const browser = getBrowserInfo();

  // Show browser-specific messages
  const getBrowserMessage = () => {
    switch(browser) {
      case "Firefox":
        return "Voice recognition has limited support in Firefox. Consider using Chrome/Chromium for best experience.";
      case "Brave":
        return "Brave's privacy features may block voice recognition. Consider enabling it in settings or use Chrome/Chromium.";
      case "Safari":
        return "Voice recognition has limited support in Safari. Consider using Chrome/Chromium for best experience.";
      default:
        return null;
    }
  };

  const startVoiceRecognition = async () => {
    try {
      // First ensure we have microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Important: Stop the stream immediately after permission check
      stream.getTracks().forEach(track => track.stop());

      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      // Configure recognition
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        console.log('Speech recognition started');
      };

      recognition.onend = () => {
        setIsListening(false);
        console.log('Speech recognition ended');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('Transcript:', transcript);
        onTranscript(transcript);
      };

      recognition.onerror = (event: any) => {
        console.log('Speech recognition error:', event);
        let message = 'Speech recognition error';
        
        switch (event.error) {
          case 'network':
            message = 'Network connection is required for speech recognition';
            break;
          case 'not-allowed':
          case 'permission-denied':
            message = 'Microphone access is required for speech recognition';
            break;
          case 'no-speech':
            message = 'No speech was detected. Please try again.';
            break;
          case 'audio-capture':
            message = 'No microphone was found. Please ensure your microphone is connected.';
            break;
          case 'service-not-allowed':
            message = 'Speech recognition service is not allowed. Please try again later.';
            break;
          default:
            message = `Error: ${event.error}`;
        }
        
        setError(message);
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Error initializing speech recognition:', err);
      setError('Could not start speech recognition. Please check microphone permissions.');
      setIsListening(false);
    }
  };

  return (
    <div className="space-y-2">
      {getBrowserMessage() && (
        <div className="text-amber-600 text-sm mb-2 p-2 bg-amber-50 rounded-lg">
          {getBrowserMessage()}
        </div>
      )}
      <div className="flex items-center gap-2">
        <button
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            isListening ? 'bg-red-500' : 'bg-purple-500'
          } text-white disabled:opacity-50`}
          onClick={startVoiceRecognition}
          disabled={isListening}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
          </svg>
          {isListening ? 'Listening...' : 'Update with Voice'}
        </button>
        
        {isListening && (
          <span className="text-sm text-gray-500">
            Speak now...
          </span>
        )}
      </div>

      {error && (
        <div className="text-red-500 text-sm flex items-center gap-2">
          <span>{error}</span>
          {error.includes('network') && (
            <input
              type="text"
              className="px-2 py-1 border rounded"
              placeholder="Type instead..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  onTranscript((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}