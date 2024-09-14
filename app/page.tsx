"use client";

import { useState, useEffect, useRef } from "react";
import pipeVideo from "./camera/pipeVideo";
import useSpokenText from "./voice/useSpokenText";
import determineResponse from "./api/aiResponse/determineResponse";
import abilities from "./api/aiResponse/abilities";
import { Todo } from "./api/aiResponse/types";

const launchPhrase = "Computer";

export default function Home() {
  const { spokenText, setSpokenText } = useSpokenText();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [response, setResponse] = useState("");
  const [askingAI, setAskingAI] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    console.log("spokenText", spokenText);
    if (
      spokenText &&
      spokenText.toLowerCase().includes(launchPhrase.toLowerCase())
    ) {
      setAskingAI(true);
      determineResponse(spokenText, todos).then((responseText) => {
        console.log("AI Response:", responseText);

        // Handle all tokens using the original responseText
        const tokenRegex = /<(\w+?)(?::([^>]+))?>/g; // Updated regex to match tokens with and without params
        let match;
        let processedResponse = responseText;

        while ((match = tokenRegex.exec(responseText)) !== null) {
          const token = match[1];
          const param = match[2]; // 'param' can be undefined
          console.log("Detected Token:", token);
          console.log("Parameter:", param);
          const ability = abilities.find((a) => a.token === token);
          if (ability) {
            ability.handler(param, setTodos);
            // Remove the token from the processed response
            processedResponse = processedResponse.replace(match[0], "");
            // Reset regex lastIndex to handle dynamic string modification
            tokenRegex.lastIndex = 0;
          } else {
            console.warn(`Unknown ability token: ${token}`);
          }
        }

        // Remove the thinking section after handling tokens
        let cleanedText = processedResponse.replace(
          /<thinking>[\s\S]*?<\/thinking>/g,
          ""
        );

        setResponse(cleanedText.trim());
      });
      setTimeout(() => {
        setAskingAI(false);
      }, 1000);
    }
  }, [spokenText]); // Removed 'todos' from dependency array

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
          console.error("Error detecting palms:", error);
        }
      }
    };

    // setInterval(detect, 1000);
  }, []);

  return (
    <>
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

      {/* Todo List UI */}
      <div className="absolute top-4 right-4 w-1/4 bg-white p-4 rounded shadow-lg">
        <h2 className="text-xl mb-2">Todo List</h2>
        <ul>
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex justify-between items-center mb-2"
            >
              <span>{todo.task}</span>
              <button
                onClick={() =>
                  setTodos((prev) => prev.filter((t) => t.id !== todo.id))
                }
                className="text-red-500"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
