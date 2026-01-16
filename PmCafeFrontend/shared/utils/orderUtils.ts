/**
 * 주문 관련 유틸리티 함수
 */

import { Order } from '../types';

/**
 * 다음 주문 번호 계산 (1-12 순환)
 * @param orders 전체 주문 목록
 * @returns 다음 주문 번호 (1-12)
 */
export const getNextOrderNumber = (orders: Order[]): number => {
  if (orders.length === 0) return 1;

  const lastOrder = orders[orders.length - 1];
  return lastOrder.dailyNum === 12 ? 1 : lastOrder.dailyNum + 1;
};

/**
 * 사용 가능한 주문 번호 찾기 (완료 안된 주문 제외)
 * @param orders 전체 주문 목록
 * @returns 사용 가능한 주문 번호 (1-12)
 */
export const getAvailableOrderNumber = (orders: Order[]): number => {
  const usedNumbers = orders
    .filter(o => o.status !== 'COMPLETED')
    .map(o => o.dailyNum);

  // 1~12 중에서 사용 안된 번호 찾기
  for (let num = 1; num <= 12; num++) {
    if (!usedNumbers.includes(num)) {
      return num;
    }
  }

  // 모두 사용중이면 가장 오래된 번호 재사용
  const oldestPending = orders
    .filter(o => o.status !== 'COMPLETED')
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0];

  return oldestPending?.dailyNum || 1;
};

/**
 * UUID 생성
 * @returns 고유한 UUID 문자열
 */
export const generateOrderId = (): string => {
  return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
