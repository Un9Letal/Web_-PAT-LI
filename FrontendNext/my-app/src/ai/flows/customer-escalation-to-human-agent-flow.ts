'use server';
/**
 * @fileOverview A Genkit flow to handle customer messages and determine if an escalation to a human agent is required.
 *
 * - customerEscalationToHumanAgent - A function that processes a customer message for escalation.
 * - CustomerEscalationToHumanAgentInput - The input type for the customerEscalationToHumanAgent function.
 * - CustomerEscalationToHumanAgentOutput - The return type for the customerEscalationToHumanAgent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CustomerEscalationToHumanAgentInputSchema = z.object({
  userMessage: z.string().describe('The message from the customer.'),
  systemPrompt: z.string().describe('The system prompt for the AI, including instructions for escalation detection and general bot behavior.'),
});
export type CustomerEscalationToHumanAgentInput = z.infer<typeof CustomerEscalationToHumanAgentInputSchema>;

const CustomerEscalationToHumanAgentOutputSchema = z.object({
  escalateToHuman: z.boolean().describe('True if the customer requested to speak to a human agent.'),
  botResponse: z.string().describe('The AI bot\'s direct response. If escalation is requested, it will contain "[DERIVAR_ASESOR]", otherwise a regular response.'),
});
export type CustomerEscalationToHumanAgentOutput = z.infer<typeof CustomerEscalationToHumanAgentOutputSchema>;

const ESCALATION_KEYWORD = '[DERIVAR_ASESOR]';

export async function customerEscalationToHumanAgent(input: CustomerEscalationToHumanAgentInput): Promise<CustomerEscalationToHumanAgentOutput> {
  return customerEscalationToHumanAgentFlow(input);
}

const customerEscalationPrompt = ai.definePrompt({
  name: 'customerEscalationPrompt',
  input: {schema: CustomerEscalationToHumanAgentInputSchema},
  output: {schema: z.string()}, // The raw text response from the model
  prompt: `{{{systemPrompt}}}

User: {{{userMessage}}}
Bot: `,
});

const customerEscalationToHumanAgentFlow = ai.defineFlow(
  {
    name: 'customerEscalationToHumanAgentFlow',
    inputSchema: CustomerEscalationToHumanAgentInputSchema,
    outputSchema: CustomerEscalationToHumanAgentOutputSchema,
  },
  async (input) => {
    const { output: rawBotResponse } = await customerEscalationPrompt(input);

    const responseText = rawBotResponse ?? '';
    const escalate = responseText.includes(ESCALATION_KEYWORD);

    return {
      escalateToHuman: escalate,
      botResponse: responseText,
    };
  }
);
