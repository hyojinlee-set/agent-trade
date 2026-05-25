import type { AgentBidConfig } from '../routes/bid.js';

export const claudeConfig: AgentBidConfig = {
  agentId: 'claude',
  minPrice: 0.25,
  deliveryTimeSec: 200,
  specialty: ['analysis', 'coding', 'reasoning'],
};
