import React, { useState, useRef, useEffect } from 'react';
import VideoCapture from './components/VideoCapture';
import TranscriptionDisplay from './components/TranscriptionDisplay';
import LanguageSelector from './components/LanguageSelector';
import TextToSpeech from './components/TextToSpeech';
import EmotionDisplay from './components/EmotionDisplay';
import './App.css';

function App() {
  const [transcription, setTranscription] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [emotion, setEmotion] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    // Here you would call your translation API when the transcription changes
    // For demonstration, we're just setting it to the same text
    setTranslatedText(transcription);
  }, [transcription]);

  const handleTranscription = async (videoBlob) => {
    setIsProcessing(true);
    
    // Simulating API calls with setTimeout
    setTimeout(() => {
      // Here you would call the Symphonic Labs API to get the transcription
      setTranscription("This is a placeholder transcription.");
      
      // You would also call your emotion detection API here
      setEmotion("Neutral");
      
      setIsProcessing(false);
    }, 2000); // Simulating a 2-second process
  };

  return (
    <div className="App">
      <header>
        <h1>LipSync AI</h1>
        <p>Transcribe, Translate, and Emote in Real-Time</p>
      </header>

      <main>
        <div className="content-area">
          <div className="video-section">
            <VideoCapture videoRef={videoRef} onTranscription={handleTranscription} />
          </div>

          {isProcessing ? (
            <div className="processing-message">
              <p>Processing your video...</p>
              <div className="loader"></div>
            </div>
          ) : (
            transcription && (
              <div className="result-section">
                <div className="transcription-box">
                  <h2>Original Transcription</h2>
                  <TranscriptionDisplay text={transcription} />
                  <EmotionDisplay emotion={emotion} />
                </div>

                <div className="translation-box">
                  <h2>Translation</h2>
                  <LanguageSelector 
                    selectedLanguage={selectedLanguage} 
                    onLanguageChange={setSelectedLanguage} 
                  />
                  <TranscriptionDisplay text={translatedText} />
                  <TextToSpeech text={translatedText} />
                </div>
              </div>
            )
          )}
        </div>
      </main>

      <footer>
        <p>Created for Hack The North 2024 - VoiceLens</p>
      </footer>
    </div>
  );
}

export default App;