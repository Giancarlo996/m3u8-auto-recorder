const axios = require('axios');
const { exec } = require('child_process');
const moment = require('moment');

const m3u8Url = process.env.M3U8_URL;

let isRecording = false;
let monitorInterval;

// Check if the live streaming based on M3U8 content has started
function isLiveStreamingStarted(m3u8Content) {
  const lines = m3u8Content.split('\n');
  const mediaSegmentTags = lines.filter(line => line.startsWith('#EXTINF'));
  return mediaSegmentTags.length > 0;
}

// Start recording
function startRecording() {
  if (isRecording) {
    console.log('Recording is already in progress.');
    return;
  }

  // Get the current time
  const now = moment();
  const formattedDate = now.format('YYYY-MM-DD_HH-mm-ss');
  const outputFilePath = `/data/${formattedDate}_%03d.ts`;

  const ffmpegCommand = `ffmpeg -i ${m3u8Url}  -c copy -f segment -segment_time 60 -reset_timestamps 1 ${outputFilePath}`;
  const ffmpegProcess = exec(ffmpegCommand);

  ffmpegProcess.stdout.on('data', (data) => {
    console.log(`FFmpeg stdout: ${data}`);
  });

  ffmpegProcess.stderr.on('data', (data) => {
    console.error(`FFmpeg stderr: ${data}`);
  });

  ffmpegProcess.on('close', (code) => {
    console.log(`FFmpeg process exited with code ${code}`);
    isRecording = false;
    startMonitoring();
  });

  isRecording = true;
  console.log('Recording started.');
  clearInterval(monitorInterval);
}

// Monitor the M3U8 playlist
async function monitorM3U8() {
  try {
    const response = await axios.get(m3u8Url);
    const m3u8Content = response.data;

    if (isLiveStreamingStarted(m3u8Content)) {
      startRecording();
    }
  } catch (error) {
    if (error.response.status == 404) {
      // Not live yet
      console.log('Not live yet');
    } else {
      console.error('Error occurred while monitoring M3U8:', error);
    }
  }
}

// Start the monitoring process
function startMonitoring() {
  monitorInterval = setInterval(monitorM3U8, 1000);
  console.log('Monitoring started.');
}

// Start the monitoring process
startMonitoring();
