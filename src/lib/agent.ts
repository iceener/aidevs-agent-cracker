import fs from 'fs';
import {tools} from "./tools";
import {completion} from "./ai";
import {IState} from "../types.dt";
import {availableTools, decidePrompt, describePrompt, planPrompt, reflectionPrompt, ToolsInstruction} from "./prompts";

/*
 * This function logs the content to a markdown file
 */
export function logToMarkdown(type: string, header: string, content: string) {
    let formattedContent;

    switch(type) {
        case 'basic':
            formattedContent = `# ${header}\n${content}\n`;
            break;
        case 'action':
            formattedContent = `## ${header}\n${content}\n`;
            break;
        case 'result':
            formattedContent = `### ${header}\n\`\`\`\n${content}\n\`\`\`\n`;
            break;
        default:
            formattedContent = `${content}\n`;
    }

    fs.appendFileSync('log.md', formattedContent);
}

/*
 * This function plans the next step and updates the state
 */
export const plan = async (state: IState) => {
    state.currentStage = 'plan';
    state.systemPrompt = planPrompt(state);
    state.plan = await completion(state);
    logToMarkdown('basic', 'Planning', `Current plan: ${state.plan}`);
}

/*
 * This function selects the next tool by creating a JSON object and updating the state
 */
export const decide = async (state: IState) => {
    state.currentStage = 'decide';
    state.systemPrompt = decidePrompt(state);
    const nextStep = await completion<{tool: string, _thoughts: string }>(state);
    state.activeTool = {
        name: nextStep.tool,
        description: availableTools[nextStep.tool as keyof ToolsInstruction].description,
        instruction: availableTools[nextStep.tool as keyof ToolsInstruction].instruction
    };
    logToMarkdown('action', 'Decision', `Next move: ${JSON.stringify(nextStep)}`);
}

/*
 * This function generates a payload (JSON object) for the active tool and updates the state
 */
export const describe = async (state: IState) => {
    state.currentStage = 'describe';
    state.systemPrompt = describePrompt(state)
    const nextStep = await completion(state);
    state.activeToolPayload = nextStep;
    logToMarkdown('action', 'Description', `Next step description: ${JSON.stringify(nextStep)}`);
}

/*
* This function executes the active tool and updates the state
 */
export const execute = async (state: IState) => {
    state.currentStage = 'execute';
    if (!state.activeTool) {
        throw new Error('No active tool to execute');
    }
    const result = await tools[state.activeTool?.name as keyof typeof tools](state.activeToolPayload);
    logToMarkdown('result', 'Execution', `Action result: ${JSON.stringify(result)}`);
    state.actionsTaken.push({
        name: state.activeTool?.name as string,
        payload: JSON.stringify(state.activeToolPayload),
        result: result,
        reflection: '',
        tool: state.activeTool.name
    });
}

/*
* This function 'reflects' on the results of the active tool and updates the state
 */
export const reflect = async (state: IState) => {
    state.currentStage = 'reflect';
    state.systemPrompt = reflectionPrompt(state);
    const reflection = await completion(state);
    state.actionsTaken[state.actionsTaken.length - 1].reflection = reflection;
    logToMarkdown('basic', 'Reflection', reflection);
}
