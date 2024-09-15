import React, { useState, useRef, useEffect } from 'react';
import VideoCapture from './components/VideoCapture';
import TranscriptionDisplay from './components/TranscriptionDisplay';
import LanguageSelector from './components/LanguageSelector';
import './App.css';
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.REACT_APP_GROQ_API_KEY, dangerouslyAllowBrowser: true });

function App() {
  const [transcription, setTranscription] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const videoRef = useRef(null);
  const speechSynthesisRef = useRef(null);

  async function onLanguageChange(lang) {
    setSelectedLanguage(lang);
    console.log(lang);
    if (lang == "en") {
      setTranslatedText(transcription);
      return;
    }
    await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Translate the following English text to ${lang}: ${transcription}. Respond only with the translated text without quotation marks`,
        },
      ],
      model: "llama3-8b-8192",
    }).then(chatCompletion => {
      console.log(transcription);
      const out = chatCompletion.choices[0]?.message?.content || "";
      console.log(out)
      setTranslatedText(out);
    });

  }

  useEffect(() => {
    speechSynthesisRef.current = window.speechSynthesis;
    return () => {
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (transcription) {
      setTranslatedText(transcription);
      speakText(transcription);
    }
  }, [transcription]);

  const handleTranscription = async (transcriptionResult) => {
    setTranscription(transcriptionResult);
    setIsProcessing(false);
  };

  const speakText = (text) => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedLanguage;
      speechSynthesisRef.current.speak(utterance);
    }
  };

  const handleRepeat = () => {
    speakText(translatedText);
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setTranscription('');
    setTranslatedText('');
    setIsProcessing(false);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setIsProcessing(true);
  };

  return (
    <div className="App">
      <header>
        <h1>VoiceLens</h1>
        <p>Transcribe, Translate, and Emote in Real-Time</p>
      </header>

      <main>
        <div className="content-area">
          <div className="video-section">
            <VideoCapture 
              videoRef={videoRef} 
              onTranscription={handleTranscription} 
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
              isRecording={isRecording}
            />
          </div>

          {isProcessing && (
            <div className="processing-message">
              <p>Processing your video...</p>
              <div className="loader"></div>
            </div>
          )}

          {!isRecording && !isProcessing && transcription && (
            <div className="result-section">
              <div className="transcription-box">
                <h2>Original Transcription</h2>
                <TranscriptionDisplay text={transcription} />
              </div>

              <div className="translation-box">
                <h2>Translation</h2>
                <LanguageSelector 
                  selectedLanguage={selectedLanguage} 
                  onLanguageChange={setSelectedLanguage} 
                />
                <TranscriptionDisplay text={translatedText} />
                <button onClick={handleRepeat} disabled={!translatedText}>
                  Repeat
                </button>
              </div>
            </div>
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