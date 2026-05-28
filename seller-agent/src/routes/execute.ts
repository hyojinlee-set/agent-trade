// execute.ts
// 선택 받은 서버가 LLM을 호출해서 실제로 쿼리를 처리하는 별도 endpoint
import { Router } from 'express';
import type { AgentBidConfig } from './bid.js';

// 에이전트별 특성을 반영한 더미 LLM 응답 생성 (PoC용)
function generateDummyResult(agentId: string, query: string): string {
  switch (agentId) {
    case 'claude':
      // 단계별 분석, 추론 중심
      return (
        `[Claude 분석 결과]\n` +
        `요청: "${query}"\n\n` +
        `1. 맥락 파악: 질문의 핵심 의도를 파악했습니다.\n` +
        `2. 분석: 관련 요소들을 체계적으로 검토했습니다.\n` +
        `3. 결론: 제시된 맥락을 바탕으로 최적의 응답을 도출했습니다.\n\n` +
        `※ Claude API (claude-3-5-sonnet) 호출 완료`
      );

    case 'perplexity':
      // 실시간 검색 결과, 출처 명시
      return (
        `[Perplexity 실시간 검색 결과]\n` +
        `쿼리: "${query}"\n\n` +
        `• 관련 최신 문서 4건을 검색해 핵심 내용을 요약했습니다.\n` +
        `• 출처: 신뢰도 높은 뉴스·공식 문서 참조\n` +
        `• 실시간 데이터 기준 응답 (검색 시각: ${new Date().toLocaleTimeString('ko-KR')})\n\n` +
        `※ Perplexity Sonar API 호출 완료`
      );

    case 'chatgpt':
      // 친근한 대화체, 실용적 조언
      return (
        `[ChatGPT 응답]\n` +
        `"${query}"에 대해 답변드립니다.\n\n` +
        `이 요청은 실용적인 관점에서 접근하면 효과적입니다. ` +
        `핵심 포인트를 정리하면, 목표를 명확히 설정하고 단계별로 실행하는 것이 중요합니다. ` +
        `필요 시 추가 맥락을 제공해 주시면 더 구체적인 답변이 가능합니다.\n\n` +
        `※ OpenAI API (gpt-4o) 호출 완료`
      );

    case 'gemini':
      // 멀티모달·긴 컨텍스트 강조, 간결
      return (
        `[Gemini 처리 결과]\n` +
        `Query: "${query}"\n\n` +
        `멀티모달 컨텍스트 이해를 바탕으로 응답을 생성했습니다. ` +
        `긴 컨텍스트 처리 능력을 활용해 전체 맥락을 검토했으며, ` +
        `효율적인 토큰 사용으로 핵심 내용을 압축 전달합니다.\n\n` +
        `※ Gemini API (gemini-2.0-flash) 호출 완료`
      );

    default:
      return `[${agentId}] "${query}" 처리 완료`;
  }
}

export function createExecuteRouter(config: AgentBidConfig) {
  const router = Router();

  router.post('/', (req, res) => {
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'query는 필수 문자열입니다.' });
      return;
    }

    console.log(`[${config.agentId}] query 수신 → LLM API 호출 중...`);

    res.json({
      agentId: config.agentId,
      query,
      result: generateDummyResult(config.agentId, query),
    });
  });

  return router;
}