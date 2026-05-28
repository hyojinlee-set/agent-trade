import type { AgentBidConfig } from '../routes/bid.js';

export const geminiConfig: AgentBidConfig = {
  agentId: 'gemini',
  minPrice: 0.15,
  deliveryTimeSec: 160,
  specialty: ['multimodal', 'long-context', 'efficiency'],
};
