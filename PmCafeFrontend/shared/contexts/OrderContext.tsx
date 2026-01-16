/**
 * 주문 관리 Context
 * Props Drilling 문제 해결 및 전역 상태 관리
 * ✅ 실제 API 연동 완료
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order, OrderStatus } from '../../types';
import { orderApi } from '../api/orders';
import { logger } from '../utils/logger';

interface OrderContextType {
  orders: Order[];
  nextOrderNumber: number;
  isLoading: boolean;
  error: string | null;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  resetOrderNumber: () => void;
  refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [nextOrderNumber, setNextOrderNumber] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🆕 주문 목록 불러오기 (초기 로드 및 주기적 갱신)
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await orderApi.getOrders({ limit: 100 });
      setOrders(response.orders);

      // 다음 주문 번호 계산
      if (response.orders.length > 0) {
        const latestOrder = response.orders[0];
        const newNum = latestOrder.dailyNum === 12 ? 1 : latestOrder.dailyNum + 1;
        setNextOrderNumber(newNum);
      } else {
        setNextOrderNumber(1);
      }

      logger.debug('Orders fetched successfully', { count: response.orders.length });
    } catch (err) {
      const message = err instanceof Error ? err.message : '주문 목록을 불러오는데 실패했습니다';
      setError(message);
      logger.error('Failed to fetch orders', { error: err });
    } finally {
      setIsLoading(false);
    }
  };

  // 🆕 컴포넌트 마운트 시 주문 목록 불러오기
  useEffect(() => {
    fetchOrders();
  }, []);

  // 🆕 30초마다 자동 갱신 (폴링)
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchOrders();
    }, 30000); // 30초

    return () => clearInterval(intervalId);
  }, []);

  const addOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]); // 최신 주문을 앞에 추가
    // 다음 주문 번호 업데이트
    const newNum = order.dailyNum === 12 ? 1 : order.dailyNum + 1;
    setNextOrderNumber(newNum);
    logger.info('Order added', { orderId: order.orderId, dailyNum: order.dailyNum });
  };

  // 🆕 주문 상태 변경 (API 호출)
  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      // API 호출
      await orderApi.updateOrderStatus(orderId, { status });

      // 로컬 상태 업데이트
      setOrders(prev => prev.map(order =>
        order.orderId === orderId
          ? {
              ...order,
              status,
              ...(status === 'COMPLETED' ? { completedAt: new Date() } : {})
            }
          : order
      ));

      logger.info('Order status updated', { orderId, status });
    } catch (err) {
      const message = err instanceof Error ? err.message : '주문 상태 변경에 실패했습니다';
      setError(message);
      logger.error('Failed to update order status', { orderId, status, error: err });
      throw err;
    }
  };

  const resetOrderNumber = () => {
    setNextOrderNumber(1);
  };

  const refreshOrders = async () => {
    await fetchOrders();
  };

  return (
    <OrderContext.Provider value={{
      orders,
      nextOrderNumber,
      isLoading,
      error,
      addOrder,
      updateOrderStatus,
      resetOrderNumber,
      refreshOrders
    }}>
      {children}
    </OrderContext.Provider>
  );
};

/**
 * useOrders Hook
 * 주문 관련 상태와 함수를 쉽게 사용하기 위한 커스텀 훅
 */
export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
