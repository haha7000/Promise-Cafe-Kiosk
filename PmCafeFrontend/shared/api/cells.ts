/**
 * Cell API
 */
import apiClient from './client';

export interface CellAuthRequest {
  phoneLast4: string;
}

export interface CellInfo {
  id: number;
  name: string;
  leader: string;
  balance: number;
}

export interface CreateCellRequest {
  name: string;
  leader: string;
  phoneLast4: string;
}

export interface ChargeCellRequest {
  amount: number;
  bonusRate: number;
  memo?: string;
}

export const cellApi = {
  /**
   * 셀 인증 (휴대폰 뒷4자리)
   */
  authenticate: async (data: CellAuthRequest): Promise<CellInfo> => {
    const response = await apiClient.post('/api/v1/cells/auth', data);
    return response;
  },

  /**
   * 셀 목록 조회 (관리자)
   */
  getCells: async (params?: { includeInactive?: boolean }): Promise<CellInfo[]> => {
    const response = await apiClient.get('/api/v1/cells', { params });
    return response;
  },

  /**
   * 셀 생성 (관리자)
   */
  createCell: async (cellData: CreateCellRequest): Promise<{ id: number; name: string; balance: number }> => {
    const response = await apiClient.post('/api/v1/cells', cellData);
    return response;
  },

  /**
   * 포인트 충전 (관리자)
   */
  chargeCell: async (cellId: number, chargeData: ChargeCellRequest): Promise<{
    cellId: number;
    cellName: string;
    chargeAmount: number;
    bonusAmount: number;
    totalAmount: number;
    balanceAfter: number;
  }> => {
    const response = await apiClient.post(`/api/v1/cells/${cellId}/charge`, chargeData);
    return response;
  },

  /**
   * 거래 내역 조회 (관리자)
   */
  getTransactions: async (cellId: number, params?: {
    startDate?: string;
    endDate?: string;
    type?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> => {
    const response = await apiClient.get(`/api/v1/cells/${cellId}/transactions`, { params });
    return response;
  },
};
