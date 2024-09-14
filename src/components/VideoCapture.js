// components/VideoCapture.js
import React, { useState, useEffect, useRef } from 'react';

function VideoCapture({ videoRef, onTranscription }) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    if (videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          videoRef.current.srcObject = stream;
          mediaRecorderRef.current = new MediaRecorder(stream);

          mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
              chunksRef.current.push(event.data);
            }
          };

          mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: 'video/mp4' });
            chunksRef.current = [];
            saveVideo(blob);
            onTranscription(blob);
          };
        })
        .catch(err => console.error("Error accessing the webcam:", err));
    }
  }, [videoRef, onTranscription]);

  const handleStartStop = () => {
    if (isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      mediaRecorderRef.current.start();
      setIsRecording(true);
    }
  };

  const saveVideo = (blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const blob = new Blob(chunksRef.current, { type: 'video/webm' });
    document.body.appendChild(a);
    a.style = 'display: none';
    a.href = url;
    a.download = 'recorded-video.webm';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      <video ref={videoRef} autoPlay muted />
      <button onClick={handleStartStop}>
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
    </div>
  );
}

export default VideoCapture;