import React, { useState, useEffect, useRef } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import './VideoCapture.css';

function VideoCapture({ videoRef, onTranscription }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const ffmpegRef = useRef(new FFmpeg());

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      
      const options = { mimeType: 'video/webm' };
      
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.error(`${options.mimeType} is not supported`);
        return;
      }

      mediaRecorderRef.current = new MediaRecorder(stream, options);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        chunksRef.current = [];
        await processVideo(blob);
      };

      return stream;
    } catch (err) {
      console.error("Error accessing the webcam:", err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      videoRef.current.srcObject = null;
    }
  };

  const handleStartStop = async () => {
    if (isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopCamera();
    } else {
      const stream = await startCamera();
      if (stream) {
        mediaRecorderRef.current.start();
        setIsRecording(true);
      }
    }
  };

  const processVideo = async (webmBlob) => {
    setIsProcessing(true);
    try {
      const mp4Blob = await convertToMp4(webmBlob);
      const transcription = await transcribeVideo(mp4Blob);
      onTranscription(transcription);
    } catch (error) {
      console.error('Error processing video:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const convertToMp4 = async (webmBlob) => {
    try {
      const ffmpeg = ffmpegRef.current;
      if (!ffmpeg.loaded) {
        await ffmpeg.load();
      }

      const inputFileName = 'input.webm';
      const outputFileName = 'output.mp4';

      await ffmpeg.writeFile(inputFileName, await fetchFile(webmBlob));

      await ffmpeg.exec(['-i', inputFileName, '-c:v', 'libx264', '-preset', 'fast', '-c:a', 'aac', outputFileName]);

      const data = await ffmpeg.readFile(outputFileName);
      return new Blob([data.buffer], { type: 'video/mp4' });
    } catch (error) {
      console.error('Error converting video:', error);
      throw error;
    }
  };

  const transcribeVideo = async (mp4Blob) => {
    const formData = new FormData();
    formData.append("video", mp4Blob, "input.mp4");

    try {
      const response = await fetch("https://symphoniclabs--symphonet-vsr-modal-htn-model-upload-static-htn.modal.run", {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.text();
      return result;
    } catch (error) {
      console.error('Error transcribing video:', error);
      throw error;
    }
  };

  return (
    <div className="video-capture">
      <video ref={videoRef} autoPlay muted className="webcam-video" />
      <button 
        onClick={handleStartStop} 
        disabled={isProcessing}
        className={`record-button ${isRecording ? 'recording' : ''}`}
      >
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      {isProcessing && <p className="processing-message">Processing video...</p>}
    </div>
  );
}

export default VideoCapture;