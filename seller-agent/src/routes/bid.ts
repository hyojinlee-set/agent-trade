import { Router } from 'express';
import type { Request, Response } from 'express';

// 구매 에이전트로부터 수신하는 입찰 요청 타입
interface BidRequest {
  query: string;
  budget: number;
}

// 구매 에이전트에 반환하는 입찰 응답 타입
export interface BidResponse {
  agentId: string;
  price: number;
  respondSpeedSec: number;
  expertise: string[];
}

// 각 에이전트가 주입하는 설정 타입
export interface AgentBidConfig {
  agentId: string;
  minPrice: number;
  respondSpeedSec: number;
  expertise: string[];
}

// query가 에이전트 전문 분야(expertise)와 일치하면 프리미엄, 미일치면 기본값
// negotiate.ts와 동일한 로직 — 응찰과 협상 가격 기준을 일치시키기 위해 복사 유지
function queryPriceMultiplier(query: string, expertise: string[]): number {
  const q = query.toLowerCase();
  return expertise.some(s => q.includes(s.toLowerCase())) ? 1.2 : 1.0;
}

export function createBidRouter(config: AgentBidConfig): Router {
  const router = Router();

  router.post('/', (req: Request, res: Response): void => {
    const { query, budget } = req.body as Partial<BidRequest>;

    if (typeof query !== 'string' || !query.trim()) {
      res.status(400).json({ error: 'query는 필수 문자열입니다.' });
      return;
    }

    if (typeof budget !== 'number' || budget <= 0) {
      res.status(400).json({ error: 'budget은 양수여야 합니다.' });
      return;
    }

    // expertise 매칭 여부에 따라 실효 최소 응찰가 산정
    const multiplier = queryPriceMultiplier(query, config.expertise);
    const effectiveMinPrice = Math.round(config.minPrice * multiplier * 100) / 100;

    if (budget < effectiveMinPrice) {
      res.status(422).json({
        error: `예산(${budget})이 최소 응찰 가격(${effectiveMinPrice})보다 낮습니다.`,
      });
      return;
    }

    // 예산의 85%로 경쟁력 있는 가격 제시 (실효 최소가 이상)
    const price = Math.max(effectiveMinPrice, Math.round(budget * 0.85 * 100) / 100);

    const response: BidResponse = {
      agentId: config.agentId,
      price,
      respondSpeedSec: config.respondSpeedSec,
      expertise: config.expertise,
    };

    res.status(200).json(response);
  });

  return router;
}