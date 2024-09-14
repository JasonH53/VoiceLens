import React from 'react';

function EmotionDisplay({ emotion }) {
  return (
    <div className="emotion">
      <h3>Detected Emotion:</h3>
      <p>{emotion}</p>
    </div>
  );
}

export default EmotionDisplay;