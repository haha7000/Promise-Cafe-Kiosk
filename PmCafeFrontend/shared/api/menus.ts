/**
 * Menu API
 */
import apiClient from './client';
import { MenuItem } from '../../types';

export interface CreateMenuRequest {
  name: string;
  eng_name?: string;
  price: number;
  category_id: number;
  description?: string;
  image_url?: string;
  option_group_ids?: number[];
}

export interface UpdateMenuRequest {
  name?: string;
  eng_name?: string;
  price?: number;
  category_id?: number;
  description?: string;
  image_url?: string;
  is_sold_out?: boolean;
  is_active?: boolean;
  option_group_ids?: number[];
}

export const menuApi = {
  /**
   * 메뉴 목록 조회
   */
  getMenus: async (params?: {
    category_id?: number;
    include_inactive?: boolean;
  }): Promise<MenuItem[]> => {
    const response = await apiClient.get('/api/v1/menus', { params });
    return response;
  },

  /**
   * 메뉴 상세 조회 (옵션 포함)
   */
  getMenuDetail: async (menuId: number): Promise<MenuItem> => {
    const response = await apiClient.get(`/api/v1/menus/${menuId}`);
    return response;
  },

  /**
   * 메뉴 생성 (관리자)
   */
  createMenu: async (menuData: CreateMenuRequest): Promise<{ id: number; name: string; price: number }> => {
    const response = await apiClient.post('/api/v1/menus', menuData);
    return response;
  },

  /**
   * 메뉴 수정 (관리자)
   */
  updateMenu: async (menuId: number, menuData: UpdateMenuRequest): Promise<{ id: number; name: string; price: number }> => {
    const response = await apiClient.put(`/api/v1/menus/${menuId}`, menuData);
    return response;
  },

  /**
   * 메뉴 품절 토글 (관리자)
   */
  toggleSoldOut: async (menuId: number): Promise<{ id: number; is_sold_out: boolean }> => {
    const response = await apiClient.patch(`/api/v1/menus/${menuId}/sold-out`);
    return response;
  },

  /**
   * 메뉴 삭제 (SUPER 관리자)
   */
  deleteMenu: async (menuId: number): Promise<void> => {
    await apiClient.delete(`/api/v1/menus/${menuId}`);
  },
};
