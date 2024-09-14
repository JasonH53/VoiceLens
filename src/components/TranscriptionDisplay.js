// components/TranscriptionDisplay.js
import React from 'react';

function TranscriptionDisplay({ text }) {
  return (
    <div className="transcription">
      <h2>Transcription:</h2>
      <p>{text}</p>
    </div>
  );
}

export default TranscriptionDisplay;