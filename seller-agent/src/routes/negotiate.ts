import { Router } from 'express';
import type { Request, Response } from 'express';
import type { AgentBidConfig } from './bid.js';

// 구매 에이전트로부터 수신하는 협상 요청 타입
// query는 선택 필드 — 없어도 동작하며, 있으면 키워드 기반 가격 전략에 활용
interface NegotiateRequest {
  offeredPrice: number;
  offeredRespondSpeedSec: number;
  query?: string;
}

// 구매 에이전트에 반환하는 협상 응답 타입
export interface NegotiateResponse {
  accepted: boolean;
  finalPrice: number;
  finalRespondSpeedSec: number;
  reason: string; // PoC 디버깅용 수락·거절 사유
}

// query가 에이전트 전문 분야(expertise)와 일치하면 프리미엄, 미일치면 기본값
// bid.ts와 동일한 로직 — 응찰과 협상 가격 기준을 일치시키기 위해 복사 유지
function queryPriceMultiplier(query: string, expertise: string[]): number {
  const q = query.toLowerCase();
  return expertise.some(s => q.includes(s.toLowerCase())) ? 1.2 : 1.0;
}

export function createNegotiateRouter(config: AgentBidConfig): Router {
  const router = Router();

  // 납기 허용 상한: 기본 납기의 150% 이내까지 수용
  const maxRespondSpeedSec = Math.round(config.respondSpeedSec * 1.5);

  router.post('/', (req: Request, res: Response): void => {
    const {
      offeredPrice,
      offeredRespondSpeedSec,
      query = '',
    } = req.body as Partial<NegotiateRequest>;

    if (typeof offeredPrice !== 'number' || offeredPrice <= 0) {
      res.status(400).json({ error: 'offeredPrice는 양수여야 합니다.' });
      return;
    }

    if (typeof offeredRespondSpeedSec !== 'number' || offeredRespondSpeedSec <= 0) {
      res.status(400).json({ error: 'offeredRespondSpeedSec는 양수여야 합니다.' });
      return;
    }

    const multiplier = queryPriceMultiplier(query, config.expertise);
    const effectiveMinPrice = Math.round(config.minPrice * multiplier * 100) / 100;

    const priceOk = offeredPrice >= effectiveMinPrice;
    const deliveryOk = offeredRespondSpeedSec <= maxRespondSpeedSec;

    // 가격·납기 모두 충족 → 수락
    if (priceOk && deliveryOk) {
      res.status(200).json({
        accepted: true,
        finalPrice: offeredPrice,
        finalRespondSpeedSec: offeredRespondSpeedSec,
        reason: '수락 — 가격·납기 조건 충족',
      } satisfies NegotiateResponse);
      return;
    }

    // 가격은 충족, 납기 초과 → 납기 조정 역제안
    if (priceOk && !deliveryOk) {
      res.status(200).json({
        accepted: false,
        finalPrice: offeredPrice,
        finalRespondSpeedSec: maxRespondSpeedSec,
        reason: `거절 — 납기 초과 (허용 상한: ${maxRespondSpeedSec}s)`,
      } satisfies NegotiateResponse);
      return;
    }

    // 가격 조건 불충족 → 갭 비율 기반 역제안
    // gapRatio: 오퍼가 낮을수록 크고, 구매자가 올려올수록 0에 수렴
    // counterPrice: gapRatio에 비례해 높게 시작하다가 자연스럽게 effectiveMinPrice로 수렴
    const gapRatio = (effectiveMinPrice - offeredPrice) / effectiveMinPrice;
    const counterPrice = Math.round(effectiveMinPrice * (1 + gapRatio * 0.5) * 100) / 100;

    res.status(200).json({
      accepted: false,
      finalPrice: counterPrice,
      finalRespondSpeedSec: deliveryOk ? offeredRespondSpeedSec : maxRespondSpeedSec,
      reason:
        `거절 — 실효 최소가: ${effectiveMinPrice} (쿼리 가중치 ×${multiplier}), ` +
        `갭: ${Math.round(gapRatio * 100)}%, 역제안: ${counterPrice}`,
    } satisfies NegotiateResponse);
  });

  return router;
}
