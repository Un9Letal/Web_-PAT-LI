import { config } from 'dotenv';
config();

import '@/ai/flows/customer-escalation-to-human-agent-flow.ts';
import '@/ai/flows/customer-catalog-access-via-chatbot-flow.ts';
import '@/ai/flows/customer-product-inquiry-and-recommendation-flow.ts';
import '@/ai/flows/admin-inventory-optimization-flow.ts';
import '@/ai/flows/admin-lead-strategy-flow.ts';
