// Start of Selection
"use client";

import { useState, useEffect, useRef } from "react";
import pipeVideo from "./camera/pipeVideo";
import useSpokenText from "./voice/useSpokenText";
import determineResponse from "./api/aiResponse/determineResponse";
import abilities from "./api/aiResponse/abilities";
import { Todo } from "./api/aiResponse/types";

const launchPhrase = "Hey Computer";

export default function Home() {
  const { spokenText, setSpokenText } = useSpokenText();
  const [manualText, setManualText] = useState("");
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
        // Start of Selection
        // Start of Selection
        const tokenRegex = /<([^>]+)>/g;

        const processedResponse = responseText.replace(
          tokenRegex,
          (match, content) => {
            const [token, param] = content.split(":");
            const ability = abilities.find(
              (a) => a.token.toLowerCase() === token.toLowerCase()
            );
            if (ability) {
              ability.handler(param, setTodos);
              return "";
            } else {
              console.warn(`Unknown ability token: ${token}`);
              return match;
            }
          }
        );

        const cleanedText = processedResponse.replace(
          /<thinking>[\s\S]*?<\/thinking>/g,
          ""
        );

        setResponse(cleanedText.trim());
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

  const handleSend = () => {
    if (manualText.trim() !== "") {
      setSpokenText(manualText);
      setManualText("");
    }
  };

  return (
    <>
      <div
        className={`absolute top-0 left-0 w-full h-full z-10 flex flex-col items-center justify-end`}
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
        {/* Input Box and Send Button */}
        <div className="flex mb-4 hidden">
          <input
            type="text"
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            placeholder="Type your command..."
            className="px-2 py-1 border border-gray-300 rounded-l"
          />
          <button
            onClick={handleSend}
            className="px-4 py-1 bg-blue-500 text-white rounded-r"
          >
            Send
          </button>
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
