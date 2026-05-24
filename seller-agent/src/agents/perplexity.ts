import type { AgentBidConfig } from '../routes/bid.js';

export const perplexityConfig: AgentBidConfig = {
  agentId: 'perplexity',
  minPrice: 0.18,
  deliveryTimeSec: 150,
  specialty: ['search', 'realtime', 'research'], 
};
