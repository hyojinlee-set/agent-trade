import type { AgentBidConfig } from '../routes/bid.js';

export const chatgptConfig: AgentBidConfig = {
  agentId: 'chatgpt',
  minPrice: 0.20,
  deliveryTimeSec: 180,
  specialty: ['general', 'creative', 'coding'],
};
