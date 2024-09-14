"use server";

import { Groq } from "groq-sdk";
import abilities from "./abilities";
import { Todo } from "../types";

function abilityToText(ability: (typeof abilities)[number]) {
  return `Name: ${ability.name}
Description: ${ability.description}
When to use: ${ability.whenToUse}
Token: ${ability.token}
`;
}

function getPrompt(todos: Todo[]) {
  const todosText =
    todos.length > 0
      ? `Current Todos:
${todos
  .map(
    (todo) => `- [${todo.completed ? "x" : " "}] ${todo.task} (ID: ${todo.id})`
  )
  .join("\n")}`
      : "You have no current todos.";

  return `You are a helpful assistant. You can perform the following actions:
${abilities.map(abilityToText).join("\n")}

${todosText}

To use an ability with parameters, include the token followed by a colon and the parameter.
You MUST use the exact text of the token. Ensure you use the "<" and ">" characters.
For example, your output should include:
"<ABILITY_TOKEN:PARAMETERS>"

Your output must be formatted like this:
"<thinking>
Planning and ability usage goes here.
</thinking>
Response text goes here"

Thinking text is not visible to the user.
Use the thinking section to determine what to respond and what abilities to use.
If you're going to use an ability, you must use the token with appropriate parameters in the thinking section.

Note that the user is not able to respond to your message. Do not phrase it as if they can.
`;
}

export default async function determineResponse(text: string, todos: Todo[]) {
  console.log(text);

  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: getPrompt(todos),
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
