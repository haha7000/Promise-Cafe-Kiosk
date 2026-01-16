/**
 * Categories API
 */
import { apiClient } from './client';

export interface Category {
  id: number;
  code: string;
  name: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface CategoryCreateRequest {
  code: string;
  name: string;
  displayOrder?: number;
}

export interface CategoryUpdateRequest {
  code?: string;
  name?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export const categoryApi = {
  /**
   * 카테고리 목록 조회
   */
  getCategories: async (includeInactive = false): Promise<Category[]> => {
    return apiClient.get('/api/v1/categories', {
      params: { include_inactive: includeInactive }
    });
  },

  /**
   * 카테고리 생성
   */
  createCategory: async (data: CategoryCreateRequest): Promise<Category> => {
    return apiClient.post('/api/v1/categories', data);
  },

  /**
   * 카테고리 수정
   */
  updateCategory: async (id: number, data: CategoryUpdateRequest): Promise<Category> => {
    return apiClient.put(`/api/v1/categories/${id}`, data);
  },

  /**
   * 카테고리 삭제
   */
  deleteCategory: async (id: number): Promise<void> => {
    return apiClient.delete(`/api/v1/categories/${id}`);
  },
};
