import Anthropic from "@anthropic-ai/sdk";

export type Stage = 'init' | 'plan' | 'decide' | 'describe' | 'reflect' | 'execute' | 'final';

export interface ITool {
    name: string;
    instruction: string;
    description: string;
}

export interface IAction {
    name: string;
    payload: string;
    result: string;
    reflection: string;
    tool: string;
}

export interface IState {
    systemPrompt: string; // current system prompt
    messages: Anthropic.Messages.MessageParam[]; // all messages in the conversation

    currentStage: Stage; // stage on which system prompt depends
    currentStep: number;
    maxSteps: number;

    activeTool?: ITool;
    activeToolPayload?: any;

    plan: string;
    actionsTaken: IAction[];
}