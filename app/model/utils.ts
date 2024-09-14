"use client";

import { useState, useEffect } from "react";

const useDetectPalm = () => {
  const [cv, setCv] = useState(null);
  const [palmClassifier, setPalmClassifier] = useState(null);

  useEffect(() => {
    const loadHaarCascade = async () => {
      const response = await fetch("/cascade.xml");
      const buffer = await response.arrayBuffer();
      const data = new Uint8Array(buffer);
      cv.FS_createDataFile("/", "cascade.xml", data, true, false, false);
      const classifier = new cv.CascadeClassifier();
      classifier.load("cascade.xml");
      console.log("classifier", classifier);
      setPalmClassifier(classifier);
    };

    if (cv) loadHaarCascade();
  }, [cv]);

  useEffect(() => {
    const int = setInterval(() => {
      if (window.cv) {
        setCv(window.cv);
        clearInterval(int);
      }
    }, 100);
  }, []);

  const detectPalm = async (imageData, callback) => {
    setCv((currentCv) => {
      setPalmClassifier((currentPalmClassifier) => {
        if (!currentCv || !currentPalmClassifier) {
          return [];
        }

        const src = currentCv.matFromImageData(imageData);
        const gray = new currentCv.Mat();
        currentCv.cvtColor(src, gray, currentCv.COLOR_RGBA2GRAY);

        const palms = new currentCv.RectVector();
        currentPalmClassifier.detectMultiScale(gray, palms);

        const detectedPalms = [];
        for (let i = 0; i < palms.size(); ++i) {
          const palm = palms.get(i);
          detectedPalms.push({
            x: palm.x,
            y: palm.y,
            width: palm.width,
            height: palm.height,
          });
        }

        src.delete();
        gray.delete();
        palms.delete();

        callback(detectedPalms);
        return currentPalmClassifier;
      });
      return currentCv;
    });
  };

  return {
    detectPalm,
  };
};

export default useDetectPalm;
