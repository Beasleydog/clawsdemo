"use client";

import { useState, useEffect, useRef } from "react";
import pipeVideo from "./camera/pipeVideo";
import useSpokenText from "./voice/useSpokenText";
import determineResponse from "./api/aiResponse/determineResponse";
import abilities from "./api/aiResponse/abilities";
// import useDetectPalm from "./model/utils";

const launchPhrase = "Computer";

export default function Home() {
  const { spokenText, setSpokenText } = useSpokenText();
  const [manualSpokenText, setManualSpokenText] = useState("");
  const [palmCords, setPalmCords] = useState({ x: 0, y: 0, w: 0, h: 0 });

  const [response, setResponse] = useState("");
  const [askingAI, setAskingAI] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // const { detectPalm } = useDetectPalm();

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
    if ((window as any).piping) return;
    (window as any).piping = true;
    if (videoRef.current) {
      console.log("piping video");
      pipeVideo(videoRef.current);
    }
    return () => {
      (window as any).piping = false;
    };
  }, [videoRef]);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const detect = async () => {
      if (!(window as any).cv) return;
      if (videoRef.current && ctx) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        console.log("imageData", imageData);
        try {
          const palms = await detectPalm(imageData, (palms) => {
            console.log("palms", palms);
            if (palms.length > 0) {
              setPalmCords({
                x: palms[0].x,
                y: palms[0].y,
                w: palms[0].width,
                h: palms[0].height,
              });
            }
          });
        } catch (error) {
          console.error("Error detecting faces:", error);
        }
      }
    };

    // setInterval(detect, 1000);
  }, []);

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
        style={{
          position: "absolute",
          top: palmCords.y,
          left: palmCords.x,
          width: palmCords.w,
          height: palmCords.h,
          border: "2px solid red",
          zIndex: 1000,
        }}
      ></div>

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
        autoPlay
        muted
      />
    </>
  );
}
