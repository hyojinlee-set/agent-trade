import type { AgentBidConfig } from '../routes/bid.js';

export const claudeConfig: AgentBidConfig = {
  agentId: 'claude',
  minPrice: 0.25,
  respondSpeedSec: 200,
  expertise: ['analysis', 'coding', 'reasoning'],
};
