/**
 * 주문 제출 Hook
 * - 주문 생성 로직
 * - 에러 처리
 * - 로딩 상태 관리
 */

import { useState, useCallback } from 'react';
import { useOrders } from '../../../shared/contexts/OrderContext';
import { Order, PaymentMode, CellInfo, CartItem } from '../../../types';
import { getNextOrderNumber, generateOrderId } from '../../../shared/utils/orderUtils';

interface CreateOrderData {
  payType: PaymentMode;
  cellInfo?: CellInfo;
  items: CartItem[];
  totalAmount: number;
}

interface OrderSubmitResult {
  success: boolean;
  order?: Order;
  error?: string;
}

export const useOrderSubmit = () => {
  const { orders, addOrder } = useOrders();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitOrder = useCallback(async (orderData: CreateOrderData): Promise<OrderSubmitResult> => {
    setIsSubmitting(true);
    setError(null);

    try {
      // 유효성 검사
      if (!orderData.items || orderData.items.length === 0) {
        throw new Error('장바구니가 비어있습니다');
      }

      if (orderData.payType === 'CELL' && !orderData.cellInfo) {
        throw new Error('셀 정보가 없습니다');
      }

      if (orderData.payType === 'CELL' && orderData.cellInfo!.balance < orderData.totalAmount) {
        throw new Error(`포인트가 부족합니다 (잔액: ${orderData.cellInfo!.balance.toLocaleString()}원)`);
      }

      // 주문 번호 계산
      const nextDailyNum = getNextOrderNumber(orders);

      // 주문 생성
      const newOrder: Order = {
        orderId: generateOrderId(),
        dailyNum: nextDailyNum,
        payType: orderData.payType,
        cellInfo: orderData.cellInfo,
        items: orderData.items,
        totalAmount: orderData.totalAmount,
        status: 'PENDING',
        createdAt: new Date()
      };

      // 실제 환경에서는 API 호출
      // await api.createOrder(newOrder);

      addOrder(newOrder);

      return { success: true, order: newOrder };
    } catch (err) {
      const message = err instanceof Error ? err.message : '주문 처리 중 오류가 발생했습니다';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsSubmitting(false);
    }
  }, [orders, addOrder]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    submitOrder,
    isSubmitting,
    error,
    clearError
  };
};
