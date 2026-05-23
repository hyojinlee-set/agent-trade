# Seller Agent (B 담당)

## 프로젝트 개요
구매 에이전트로부터 브로드캐스트된 query/budget을 수신하고,
응찰 및 협상 응답을 반환하는 판매 에이전트 서버 4개를 구현한다.

## 기술 스택
- Node.js + TypeScript
- Express
- Perplexity / Anthropic / OpenAI / Gemini API

## 디렉토리 구조
- `src/agents/` — 각 LLM 에이전트 (perplexity.ts, claude.ts, chatgpt.ts, gemini.ts)
- `src/routes/bid.ts` — POST /bid (응찰 처리)
- `src/routes/negotiate.ts` — POST /negotiate (협상 처리)
- `src/index.ts` — 서버 진입점 (포트 4001~4004)

## 주요 API

### POST /bid
구매 에이전트의 브로드캐스트 수신 후 응찰 응답
```json
{
  "agentId": "claude",
  "price": 0.28,
  "deliveryTimeSec": 200,
  "specialty": ["finance", "analysis"]
}
```

### POST /negotiate
구매 에이전트의 협상 제안 수신 후 수락/거절 응답
```json
{
  "accepted": true,
  "finalPrice": 0.24,
  "finalDeliveryTimeSec": 220
}
```

## 포트 구성
- Perplexity: 4001
- Claude: 4002
- ChatGPT: 4003
- Gemini: 4004

## 코딩 규칙
- 변수명: camelCase
- 클래스명: PascalCase
- 주석: 한국어로 작성
- 커밋 메시지: `[타입] 내용` (feat / fix / test / docs)