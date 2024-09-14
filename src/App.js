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
  const videoRef = useRef(null);

  useEffect(() => {
    // Here you would call your translation API when the transcription changes
    // For demonstration, we're just setting it to the same text
    setTranslatedText(transcription);
  }, [transcription]);

  const handleTranscription = async (videoBlob) => {
    // Here you would call the Symphonic Labs API to get the transcription
    // For demonstration, we're just setting a placeholder text
    setTranscription("This is a placeholder transcription.");
    
    // You would also call your emotion detection API here
    setEmotion("Neutral");
  };

  return (
    <div className="App">
      <h1>LipSync AI</h1>
      <VideoCapture videoRef={videoRef} onTranscription={handleTranscription} />
      <TranscriptionDisplay text={transcription} />
      <LanguageSelector 
        selectedLanguage={selectedLanguage} 
        onLanguageChange={setSelectedLanguage} 
      />
      <TranscriptionDisplay text={translatedText} />
      <TextToSpeech text={translatedText} />
      <EmotionDisplay emotion={emotion} />
    </div>
  );
}

export default App;