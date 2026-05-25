import express from 'express';
import { perplexityConfig } from './agents/perplexity.js';
import { claudeConfig } from './agents/claude.js';
import { chatgptConfig } from './agents/chatgpt.js';
import { geminiConfig } from './agents/gemini.js';
import { createBidRouter } from './routes/bid.js';
import type { AgentBidConfig } from './routes/bid.js';
import { createNegotiateRouter } from './routes/negotiate.js';

// 포트별 에이전트 설정 매핑
const agentByPort: Record<number, AgentBidConfig> = {
  4001: perplexityConfig,
  4002: claudeConfig,
  4003: chatgptConfig,
  4004: geminiConfig,
};

const port = Number(process.env.PORT ?? 4001);
const agentConfig = agentByPort[port];

if (!agentConfig) {
  console.error(`지원하지 않는 포트입니다: ${port} (허용: 4001~4004)`);
  process.exit(1);
}

const app = express();
app.use(express.json());

app.use('/bid', createBidRouter(agentConfig));
app.use('/negotiate', createNegotiateRouter(agentConfig));

app.listen(port, () => {
  console.log(`[${agentConfig.agentId}] 판매 에이전트 서버 실행 중: http://localhost:${port}`);
});
