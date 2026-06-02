import type { AgentBidConfig } from '../routes/bid.js';

export const perplexityConfig: AgentBidConfig = {
  agentId: 'perplexity',
  minPrice: 0.18,
  respondSpeedSec: 150,
  expertise: ['search', 'realtime', 'research'],
};
