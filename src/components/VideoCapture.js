// components/VideoCapture.js
import React, { useState, useEffect, useRef } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

function VideoCapture({ videoRef, onTranscription }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const ffmpegRef = useRef(new FFmpeg());

  useEffect(() => {
    if (videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          videoRef.current.srcObject = stream;
          
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

          mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: 'video/webm' });
            chunksRef.current = [];
            convertToMp4AndSave(blob);
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

  const convertToMp4AndSave = async (webmBlob) => {
    setIsConverting(true);
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
      const mp4Blob = new Blob([data.buffer], { type: 'video/mp4' });

      const url = URL.createObjectURL(mp4Blob);
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.style = 'display: none';
      a.href = url;
      a.download = 'recorded-video.mp4';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error converting video:', error);
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div>
      <video ref={videoRef} autoPlay muted />
      <button onClick={handleStartStop} disabled={isConverting}>
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      {isConverting && <p>Converting video to MP4...</p>}
    </div>
  );
}

export default VideoCapture;