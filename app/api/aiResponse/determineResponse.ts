"use server";

import { Groq } from "groq-sdk";
import abilities from "./abilities";

function abilityToText(ability: (typeof abilities)[number]) {
  return `Name: ${ability.name}
  Description: ${ability.description}
  When to use: ${ability.whenToUse}
  Token: ${ability.token}
  `;
}
function getPrompt() {
  return `You are a helpful assistant. You can perform the following actions:
  ${abilities.map(abilityToText).join("\n")}

  To use an ability, you MUST include the token in the response.
  Note that you do not have to use an ability, only if its relevant to the users request.

  Your output must be formatted like this:
  "<thinking>
  Planning and ability usage goes here.
  </thinking>
  Response text goes here"

  Thinking text is not visible to the user.
  Use the thinking section to determine what to respond and what abilities to use.
  If you're going to use an ability, you must use the token in the thinking section.
  `;
}

export default async function determineResponse(text: string) {
  console.log(text);

  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: getPrompt(),
        },
        {
          role: "user",
          content: text,
        },
      ],
      model: "llama-3.1-70b-versatile",
    });
    const responseText =
      completion.choices[0]?.message?.content || "No response generated";

    return responseText;
  } catch (error) {
    console.error("Error calling Groq API:", error);
    throw new Error("Failed to generate response");
  }
}
