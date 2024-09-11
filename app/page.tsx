"use client";

import { useState, useEffect } from "react";
import useSpokenText from "./voice/useSpokenText";
import determineResponse from "./api/aiResponse/determineResponse";
import abilities from "./api/aiResponse/abilities";

export default function Home() {
  const spokenText = useSpokenText();
  const [response, setResponse] = useState("");

  useEffect(() => {
    if (spokenText) {
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
    }
  }, [spokenText]);

  return (
    <>
      <div>{spokenText}</div>
      <div>{response}</div>
    </>
  );
}
