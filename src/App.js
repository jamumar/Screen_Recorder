import React, { useState } from 'react';
import { Button, Container, Grid } from '@mui/material';
import { PlayArrow, Stop } from '@mui/icons-material';

function ScreenRecorder() {
  // State variables to manage the screen stream, media recorder, recorded chunks, and recording state
  const [screenStream, setScreenStream] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [recording, setRecording] = useState(false);

  // Function to start capturing screen and audio
  const startCapture = async () => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const combinedStream = new MediaStream([...screenStream.getTracks(), ...audioStream.getTracks()]);
      setScreenStream(combinedStream);

      // Clear recordedChunks and mediaRecorder when starting a new capture
      setRecordedChunks([]);
      setMediaRecorder(null);
      setRecording(false);
    } catch (error) {
      console.error('Error capturing screen:', error);
    }
  };

  // Function to start recording
  const startRecording = () => {
    try {
      const recorder = new MediaRecorder(screenStream);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const recordedBlob = new Blob(chunks, { type: 'video/webm' });
        setRecordedChunks(chunks);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  // Function to stop recording and screen sharing
  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        setScreenStream(null);
      }
    }
  };

  // Function to download the recorded video
  const downloadRecording = () => {
    if (recordedChunks.length === 0) {
      console.warn('No recorded data available for download.');
      return;
    }

    const recordedBlob = new Blob(recordedChunks, { type: 'video/webm' });
    const downloadUrl = URL.createObjectURL(recordedBlob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = downloadUrl;
    a.download = 'recorded-video.mp4';
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(downloadUrl);
  };

  return (
    <Container>
      <Grid container spacing={2} alignItems="center" justifyContent="center">
        {/* Button to start a new capture */}
        <Grid item>
          <Button variant="contained" color="primary" onClick={startCapture}>
            New Capture
          </Button>
        </Grid>
        {/* Render the "Start Recording" button when there's a screenStream and not recording */}
        {screenStream && !recording && (
          <Grid item>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<PlayArrow />}
              onClick={startRecording}
            >
              Start Recording
            </Button>
          </Grid>
        )}
        {/* Render the "Stop Recording" button when mediaRecorder is available and recording */}
        {mediaRecorder && recording && (
          <Grid item>
            <Button
              variant="contained"
              color="error"
              startIcon={<Stop />}
              onClick={stopRecording}
            >
              Stop Recording
            </Button>
          </Grid>
        )}
      </Grid>
      {/* Conditional rendering of the video preview based on recordedChunks */}
      {recordedChunks.length > 0 && (
        <video controls style={{ marginTop: '20px', width: '100%' }}>
          {recordedChunks.map((chunk, index) => (
            <source key={index} src={URL.createObjectURL(chunk)} type="video/webm" />
          ))}
        </video>
      )}
      {/* Button to download the recorded video */}
      <Button
        variant="outlined"
        color="primary"
        onClick={downloadRecording}
        style={{ marginTop: '20px' }}
      >
        Download Video (MP4)
      </Button>
    </Container>
  );
}

export default ScreenRecorder;
