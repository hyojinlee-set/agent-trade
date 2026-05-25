import { Router } from 'express';
import type { Request, Response } from 'express';
import type { AgentBidConfig } from './bid.js';

// 구매 에이전트로부터 '수신'하는 협상 요청 타입
interface NegotiateRequest {
  offeredPrice: number;
  offeredDeliveryTimeSec: number;
}

// 구매 에이전트에 반환하는 협상 응답 타입
export interface NegotiateResponse {
  accepted: boolean;
  finalPrice: number;
  finalDeliveryTimeSec: number;
}

// AgentBidConfig의 minPrice, deliveryTimeSec를 그대로 협상 기준으로 활용
export function createNegotiateRouter(config: AgentBidConfig): Router {
  const router = Router();

  // 납기 허용 상한: 기본 납기의 150% 이내까지 수용
  const maxDeliveryTimeSec = Math.round(config.deliveryTimeSec * 1.5);

  router.post('/', (req: Request, res: Response): void => {
    const { offeredPrice, offeredDeliveryTimeSec } = req.body as Partial<NegotiateRequest>;

    if (typeof offeredPrice !== 'number' || offeredPrice <= 0) {
      res.status(400).json({ error: 'offeredPrice는 양수여야 합니다.' });
      return;
    }

    if (typeof offeredDeliveryTimeSec !== 'number' || offeredDeliveryTimeSec <= 0) {
      res.status(400).json({ error: 'offeredDeliveryTimeSec는 양수여야 합니다.' });
      return;
    }

    const priceOk = offeredPrice >= config.minPrice;
    const deliveryOk = offeredDeliveryTimeSec <= maxDeliveryTimeSec;

    if (priceOk && deliveryOk) {
      // 조건 충족 시 제안 그대로 수락
      const response: NegotiateResponse = {
        accepted: true,
        finalPrice: offeredPrice,
        finalDeliveryTimeSec: offeredDeliveryTimeSec,
      };
      res.status(200).json(response);
      return;
    }

    // 조건 불충족 시 거절 + 역제안 (최소 가격, 최대 허용 납기)
    const response: NegotiateResponse = {
      accepted: false,
      finalPrice: priceOk ? offeredPrice : config.minPrice,
      finalDeliveryTimeSec: deliveryOk ? offeredDeliveryTimeSec : maxDeliveryTimeSec,
    };
    res.status(200).json(response);
  });

  return router;
}
