import express from 'express';
import { perplexityConfig } from './agents/perplexity.js';
import { claudeConfig } from './agents/claude.js';
import { chatgptConfig } from './agents/chatgpt.js';
import { geminiConfig } from './agents/gemini.js';
import { createBidRouter } from './routes/bid.js';
import type { AgentBidConfig } from './routes/bid.js';
import { createNegotiateRouter } from './routes/negotiate.js';
import { createExecuteRouter } from './routes/execute.js'; //execute 라우터 추가

// 포트별 에이전트 설정 매핑
const agentByPort: Record<number, AgentBidConfig> = {
  4001: perplexityConfig,
  4002: claudeConfig,
  4003: chatgptConfig,
  4004: geminiConfig,
};

for (const [portStr, config] of Object.entries(agentByPort)) {
  const app = express();
  app.use(express.json());
  app.use('/bid', createBidRouter(config));
  app.use('/negotiate', createNegotiateRouter(config));
  app.use('/execute', createExecuteRouter(config));
  app.listen(Number(portStr), () => {
    console.log(`[${config.agentId}] 판매 에이전트 서버 실행 중: http://localhost:${portStr}`);
  });
}
