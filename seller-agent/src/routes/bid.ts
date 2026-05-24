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
  deliveryTimeSec: number;
  specialty: string[];
}

// 각 에이전트가 주입하는 설정 타입
export interface AgentBidConfig {
  agentId: string;
  minPrice: number;
  deliveryTimeSec: number;
  specialty: string[];
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

    // 예산이 최소 응찰 가격에 못 미치면 거절
    if (budget < config.minPrice) {
      res.status(422).json({
        error: `예산(${budget})이 최소 응찰 가격(${config.minPrice})보다 낮습니다.`,
      });
      return;
    }

    // 예산의 85%로 경쟁력 있는 가격 제시 (최소 가격 이상)
    const price = Math.max(config.minPrice, Math.round(budget * 0.85 * 100) / 100);

    const response: BidResponse = {
      agentId: config.agentId,
      price,
      deliveryTimeSec: config.deliveryTimeSec,
      specialty: config.specialty,
    };

    res.status(200).json(response);
  });

  return router;
}