import 'dotenv/config'
import fs from "fs";
import { join } from 'path'
import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static'
import {IState} from "./types.dt";
import {completion} from "./lib/ai";
import { serve } from '@hono/node-server';
import {finalAnswerPrompt} from "./lib/prompts";
import {decide, describe, execute, logToMarkdown, plan, reflect} from "./lib/agent";
import {writeFile, mkdir} from "node:fs/promises";

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

app.post('/upload', async (c) => {
  const body = await c.req.parseBody()
  const file = body.file as File
  const fileName = body.file_name as string
  if (!file || !fileName) {
    return c.json({ error: 'Missing file or file_name' }, 400)
  }
  const uploadsDir = join(process.cwd(), 'uploads')
  const uploadPath = join(uploadsDir, fileName)
  try {
    await mkdir(uploadsDir, { recursive: true })
    const arrayBuffer = await file.arrayBuffer()
    await writeFile(uploadPath, Buffer.from(arrayBuffer))
    return c.json({ uploaded_file: `${process.env.UPLOAD_DOMAIN}/uploads/${fileName}` })
  } catch (error) {
    console.error('Upload failed:', error)
    return c.json({ error: 'Upload failed' }, 500)
  }
})
app.get('/uploads/*', serveStatic({ root: './' }))

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port
});
