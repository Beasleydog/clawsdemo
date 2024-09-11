"use client";

import { useState, useEffect, useRef } from "react";
import pipeVideo from "./camera/pipeVideo";
import useSpokenText from "./voice/useSpokenText";
import determineResponse from "./api/aiResponse/determineResponse";
import abilities from "./api/aiResponse/abilities";

const launchPhrase = "Computer";

export default function Home() {
  const { spokenText, setSpokenText } = useSpokenText();
  const [manualSpokenText, setManualSpokenText] = useState("");

  const [response, setResponse] = useState("");
  const [askingAI, setAskingAI] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    console.log("spokenText", spokenText);
    if (
      spokenText &&
      spokenText.toLowerCase().includes(launchPhrase.toLowerCase())
    ) {
      setAskingAI(true);
      determineResponse(spokenText).then((responseText) => {
        abilities.forEach((ability) => {
          if (responseText.includes(ability.token)) {
            ability.handler();
          }
        });

        const thinkingStart = responseText.indexOf("<thinking>");
        const thinkingEnd = responseText.indexOf("</thinking>");

        if (thinkingStart !== -1 && thinkingEnd !== -1) {
          const cleanedResponse =
            responseText.slice(0, thinkingStart) +
            responseText.slice(thinkingEnd + 11);
          setResponse(cleanedResponse.trim());
        } else {
          setResponse(responseText.trim());
        }
      });
      setTimeout(() => {
        setAskingAI(false);
      }, 1000);
    }
  }, [spokenText]);

  useEffect(() => {
    if (window.piping) return;
    window.piping = true;
    if (videoRef.current) {
      console.log("piping video");
      pipeVideo(videoRef.current);
    }
  }, [videoRef]);

  return (
    <>
      <div className="z-30 fixed">
        <input
          type="text"
          value={manualSpokenText}
          ref={inputRef}
          onChange={(e) => setManualSpokenText(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white p-2 rounded-md"
          onClick={() => setSpokenText(manualSpokenText)}
        >
          Speak
        </button>
      </div>
      <div
        className={`absolute top-0 left-0 w-full h-full z-10 flex items-end justify-center`}
        style={{
          transition: "box-shadow 0.5s ease-in-out",
          boxShadow: `#40a4f4 0 0 ${askingAI ? "40px" : "0px"} inset`,
        }}
      >
        <div
          className={`text-2xl ${
            response && "p-4 m-4 rounded-2xl bg-white border-2 border-gray-200"
          }`}
        >
          {response}
        </div>
      </div>
      <video
        ref={videoRef}
        className="w-full h-full bg-black top-0 left-0 absolute"
        style={{
          transform: "scaleX(-1)",
        }}
      />
    </>
  );
}
