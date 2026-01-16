/**
 * 메모이제이션된 MenuCard 컴포넌트
 * 불필요한 리렌더링 방지
 */

import React, { useCallback } from 'react';
import { MenuItem } from '../../../types';

interface MenuCardProps {
  item: MenuItem;
  onClick: (item: MenuItem) => void;
}

export const MenuCard = React.memo(({ item, onClick }: MenuCardProps) => {
  const handleClick = useCallback(() => {
    if (!item.isSoldOut) {
      onClick(item);
    }
  }, [item, onClick]);

  return (
    <div
      onClick={handleClick}
      className={`
        bg-[#2D2D2D] rounded-2xl overflow-hidden border border-[#3D3D3D] shadow-lg
        transform transition-all duration-200
        ${item.isSoldOut ? 'opacity-60 grayscale' : 'hover:-translate-y-1 hover:border-[#C41E3A] cursor-pointer'}
      `}
    >
      <div className="aspect-square bg-[#3D3D3D] relative">
        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        {item.isSoldOut && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-bold border-2 border-white px-4 py-1 transform -rotate-12">SOLD OUT</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg text-white truncate">{item.name}</h3>
        <p className="text-[#6B6B6B] text-xs truncate mb-2">{item.engName}</p>
        <p className="text-xl font-bold text-white">₩ {item.price.toLocaleString()}</p>
      </div>
    </div>
  );
}, (prev, next) => {
  // 품절 상태와 ID만 비교하여 리렌더링 최소화
  return prev.item.id === next.item.id &&
         prev.item.isSoldOut === next.item.isSoldOut;
});

MenuCard.displayName = 'MenuCard';
