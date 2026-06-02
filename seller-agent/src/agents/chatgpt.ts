import type { AgentBidConfig } from '../routes/bid.js';

export const chatgptConfig: AgentBidConfig = {
  agentId: 'chatgpt',
  minPrice: 0.20,
  respondSpeedSec: 180,
  expertise: ['general', 'creative', 'coding'],
};
