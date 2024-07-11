import 'dotenv/config'
import fs from "fs";
import { Hono } from 'hono';
import {IState} from "./types.dt";
import {completion} from "./lib/ai";
import { serve } from '@hono/node-server';
import {finalAnswerPrompt} from "./lib/prompts";
import {decide, describe, execute, logToMarkdown, plan, reflect} from "./lib/agent";

// Initialize the Hono app
const app = new Hono();

// Define the route for the POST request
app.post('/', async (context) => {
  const { messages = [] } = await context.req.json();

  // Grab the last message from the messages array
  const message = messages.at(-1)
  if (!message) {
    return context.json({choices: [{message: {"role": "assistant", content: "Please provide a prompt to continue."}}]});
  }

  // Clear the log file in the main directory
  fs.writeFileSync('log.md', '');

  // Initialize simple state
  const state: IState = {
    currentStage: 'init', currentStep: 1, maxSteps: 15,
    messages: [], systemPrompt: '', plan: '', actionsTaken: []
  };
  // Add the message to the state
  state.messages = [message];

  while (state.activeTool?.name !== 'final_answer' && state.currentStep <= state.maxSteps) {
    await plan(state); // Plan the next step and return *thoughts*
    await decide(state);  // Decide on which tool to use next
    if (state.activeTool?.name === 'final_answer') break; // Exit loop if final answer is reached
    await describe(state); // Describe how to use the tool
    await execute(state); // Actually use the tool
    await reflect(state); // Reflect on the results
    state.currentStep++; // Increment the current step
  }

  state.systemPrompt = finalAnswerPrompt(state); // Set the system prompt to the final answer prompt
  const answer = await completion(state); // Get the final answer
  logToMarkdown('result', 'Final Answer', `${JSON.stringify(answer)}`); // Log the final answer to the markdown file

  return context.json({ // Send JSON response to the client
    choices: [
        {message: {role: "assistant", content: answer}}
    ]
  });
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port
});
