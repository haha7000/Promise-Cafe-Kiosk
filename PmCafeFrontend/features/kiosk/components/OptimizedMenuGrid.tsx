/**
 * 최적화된 MenuGrid 컴포넌트
 * useMemo로 필터링 최적화, MenuCard 메모이제이션
 */

import React, { useMemo, useCallback } from 'react';
import { Category, MenuItem } from '../../../types';
import { MOCK_MENU } from '../../../constants';
import { MenuCard } from './MenuCard';

interface OptimizedMenuGridProps {
  selectedCategory: Category;
  onItemClick: (item: MenuItem) => void;
}

export const OptimizedMenuGrid = React.memo(({
  selectedCategory,
  onItemClick
}: OptimizedMenuGridProps) => {
  const filteredMenu = useMemo(() => {
    return selectedCategory === 'ALL'
      ? MOCK_MENU
      : MOCK_MENU.filter(item => item.category === selectedCategory);
  }, [selectedCategory]);

  // onClick 함수를 메모이제이션하여 MenuCard에 안정적인 참조 전달
  const handleItemClick = useCallback((item: MenuItem) => {
    onItemClick(item);
  }, [onItemClick]);

  return (
    <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-48">
      {filteredMenu.map(item => (
        <MenuCard
          key={item.id}
          item={item}
          onClick={handleItemClick}
        />
      ))}
    </div>
  );
});

OptimizedMenuGrid.displayName = 'OptimizedMenuGrid';
