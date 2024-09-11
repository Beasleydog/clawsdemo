"use client";

import { useState, useEffect } from "react";
import { VAD } from "web-vad";
import AudioWorkletURL from "web-vad/dist/worklet.js?worker&url";

export default function useSpokenText() {
  const [spokenText, setSpokenText] = useState("");

  useEffect(() => {
    if (window.started) {
      return;
    }
    window.started = true;

    const startRecording = async () => {
      try {
        const localAudioTrack = await navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then((stream) => stream.getAudioTracks()[0]);
        const stream = new MediaStream([localAudioTrack]);

        const vad = new VAD({
          workletURL: "https://unpkg.com/web-vad/dist/worklet.js?worker&url",
          modelUrl: "/silero_vad.onnx",
          stream,
          onSpeechStart: () => {
            console.log("speaking start");
          },
          onVADMisfire: () => {
            console.log("misfire");
          },
          onSpeechEnd: (audioData: Float32Array) => {
            console.log("speaking end");
            console.log(audioData);
            extractTextFromAudio(audioData);
          },
        });

        // Initialize and load models
        await vad.init();

        // Start when ready
        vad.start();

        console.log(vad.state);
      } catch (error) {
        console.error("Error starting VAD:", error);
      }
    };

    startRecording();
  }, []);

  async function extractTextFromAudio(audioData: Float32Array) {
    // Convert Float32Array to Int16Array
    const int16Array = new Int16Array(audioData.length);
    for (let i = 0; i < audioData.length; i++) {
      int16Array[i] = Math.max(
        -32768,
        Math.min(32767, Math.floor(audioData[i] * 32767))
      );
    }

    // Create WAV file
    const wavBuffer = createWavBuffer(int16Array);

    // Create a Blob from the WAV buffer
    const audioBlob = new Blob([wavBuffer], { type: "audio/wav" });
    console.log(audioBlob);
    try {
      const response = await fetch("/api/extractText", {
        method: "POST",
        body: audioBlob,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setSpokenText(result.text);
    } catch (error) {
      console.error("Error extracting text from audio:", error);
    }
  }

  function createWavBuffer(samples: Int16Array, sampleRate = 16000) {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    // Write WAV header
    writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(view, 8, "WAVE");
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, "data");
    view.setUint32(40, samples.length * 2, true);

    // Write PCM samples
    for (let i = 0; i < samples.length; i++) {
      view.setInt16(44 + i * 2, samples[i], true);
    }

    return buffer;
  }

  function writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  return spokenText;
}
