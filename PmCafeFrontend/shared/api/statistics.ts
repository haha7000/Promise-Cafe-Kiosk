/**
 * Statistics API
 */
import apiClient from './client';

export interface DashboardStats {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  personalOrders: number;
  personalRevenue: number;
  cellOrders: number;
  cellRevenue: number;
  pendingOrders: number;
  makingOrders: number;
  completedOrders: number;
}

export interface MenuStats {
  menuName: string;
  quantity: number;
  revenue: number;
}

export interface DailyStats {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  personalOrders: number;
  personalRevenue: number;
  cellOrders: number;
  cellRevenue: number;
}

export const statisticsApi = {
  /**
   * 대시보드 통계 조회
   */
  getDashboard: async (date?: string): Promise<DashboardStats> => {
    const params = date ? { date } : {};
    const response = await apiClient.get('/api/v1/statistics/dashboard', { params });
    return response;
  },

  /**
   * 메뉴별 판매 통계
   */
  getMenuStats: async (params?: {
    startDate?: string;
    endDate?: string;
    categoryId?: number;
  }): Promise<MenuStats[]> => {
    const response = await apiClient.get('/api/v1/statistics/menus', { params });
    return response;
  },

  /**
   * 일별 매출 통계
   */
  getDailyStats: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<DailyStats[]> => {
    const response = await apiClient.get('/api/v1/statistics/daily', { params });
    return response;
  },
};
