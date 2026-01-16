/**
 * Order API
 */
import apiClient from './client';
import { Order, PaymentMode } from '../../types';

export interface CreateOrderRequest {
  payType: PaymentMode;
  cellId?: number;
  items: {
    menuId: number;
    menuName: string;
    menuPrice: number;
    quantity: number;
    selectedOptions: {
      groupName: string;
      items: {
        name: string;
        price: number;
      }[];
    }[];
  }[];
  totalAmount: number;
}

export interface OrderListParams {
  status?: string;
  payType?: string;
  limit?: number;
  offset?: number;
}

export interface UpdateOrderStatusRequest {
  status: string;
}

export const orderApi = {
  /**
   * 주문 생성
   */
  createOrder: async (orderData: CreateOrderRequest): Promise<Order> => {
    const response = await apiClient.post('/api/v1/orders', orderData);
    return response;
  },

  /**
   * 주문 목록 조회
   */
  getOrders: async (params?: OrderListParams): Promise<{
    orders: Order[];
    total: number;
    limit: number;
    offset: number;
  }> => {
    const response = await apiClient.get('/api/v1/orders', { params });
    return response;
  },

  /**
   * 주문 상태 변경
   */
  updateOrderStatus: async (
    orderId: string,
    statusData: UpdateOrderStatusRequest
  ): Promise<Order> => {
    const response = await apiClient.patch(
      `/api/v1/orders/${orderId}/status`,
      statusData
    );
    return response;
  },
};
