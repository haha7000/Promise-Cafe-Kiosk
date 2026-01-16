/**
 * Settlements API
 */
import { apiClient } from './client';

export interface DailySettlement {
  id: number;
  date: string; // YYYY-MM-DD
  totalOrders: number;
  totalRevenue: number;
  personalOrders: number;
  personalRevenue: number;
  cellOrders: number;
  cellRevenue: number;
  isConfirmed: boolean;
  confirmedBy?: {
    id: number;
    name: string;
  };
  confirmedAt?: string;
  notes?: string;
  createdAt: string;
}

export interface SettlementListParams {
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  isConfirmed?: boolean;
}

export const settlementApi = {
  /**
   * 정산 목록 조회
   */
  getSettlements: async (params?: SettlementListParams): Promise<DailySettlement[]> => {
    return apiClient.get('/api/v1/settlements', { params });
  },

  /**
   * 특정 날짜 정산 조회
   */
  getSettlementByDate: async (date: string): Promise<DailySettlement> => {
    return apiClient.get(`/api/v1/settlements/${date}`);
  },

  /**
   * 정산 확정
   */
  confirmSettlement: async (date: string, notes?: string): Promise<DailySettlement> => {
    return apiClient.post(`/api/v1/settlements/${date}/confirm`, { notes });
  },
};
