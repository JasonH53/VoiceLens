import React from 'react';

function TextToSpeech({ text }) {
  const handleSpeak = () => {
    // Here you would integrate with Google Cloud TTS API
    // For demonstration, we're using the browser's built-in speech synthesis
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <button onClick={handleSpeak}>Speak</button>
  );
}

export default TextToSpeech;