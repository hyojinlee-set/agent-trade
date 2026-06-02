import type { AgentBidConfig } from '../routes/bid.js';

export const geminiConfig: AgentBidConfig = {
  agentId: 'gemini',
  minPrice: 0.15,
  respondSpeedSec: 160,
  expertise: ['multimodal', 'long-context', 'efficiency'],
};
