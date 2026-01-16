/**
 * 메뉴 선택 관리 Hook
 * - 카테고리 선택
 * - 메뉴 선택
 * - 옵션 모달 관리
 */

import { useState, useCallback } from 'react';
import { Category, MenuItem } from '../../../types';

export const useMenuSelection = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('ALL');
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);

  const selectCategory = useCallback((category: Category) => {
    setSelectedCategory(category);
  }, []);

  const selectMenu = useCallback((menu: MenuItem) => {
    if (menu.isSoldOut) return;
    setSelectedMenu(menu);
    setIsOptionModalOpen(true);
  }, []);

  const closeOptionModal = useCallback(() => {
    setIsOptionModalOpen(false);
    setSelectedMenu(null);
  }, []);

  return {
    selectedCategory,
    selectedMenu,
    isOptionModalOpen,
    selectCategory,
    selectMenu,
    closeOptionModal
  };
};
