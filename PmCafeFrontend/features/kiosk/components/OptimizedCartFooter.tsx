/**
 * 최적화된 CartFooter 컴포넌트
 * useMemo로 계산 최적화, 불필요한 리렌더링 방지
 */

import React, { useMemo } from 'react';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { CartItem } from '../../../types';

interface OptimizedCartFooterProps {
  cart: CartItem[];
  onRemove: (cartId: string) => void;
  onOrder: () => void;
}

export const OptimizedCartFooter = React.memo(({
  cart,
  onRemove,
  onOrder
}: OptimizedCartFooterProps) => {
  const totalAmount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [cart]);

  const totalCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Cart Drawer Header */}
      <div className="bg-[#2D2D2D] rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.5)] border-t border-[#3D3D3D] overflow-hidden">

        {/* Cart Items */}
        {cart.length > 0 ? (
          <div className="max-h-60 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {cart.map(item => (
              <CartItemRow
                key={item.cartId}
                item={item}
                onRemove={onRemove}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-[#6B6B6B]">
            장바구니가 비어있습니다
          </div>
        )}

        {/* Action Area */}
        <div className="bg-[#2D2D2D] p-4 border-t border-[#3D3D3D] flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[#B0B0B0] text-sm">총 주문금액</span>
            <span className="text-2xl font-bold text-white">₩ {totalAmount.toLocaleString()}</span>
          </div>
          <button
            onClick={onOrder}
            disabled={cart.length === 0}
            className={`
              flex-1 h-14 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all
              ${cart.length > 0
                ? 'bg-gradient-to-r from-[#C41E3A] to-[#A01830] text-white shadow-lg shadow-red-900/30'
                : 'bg-[#3D3D3D] text-[#6B6B6B] cursor-not-allowed'}
            `}
          >
            <ShoppingCart size={20} />
            <span>주문하기 ({totalCount})</span>
          </button>
        </div>
      </div>
    </div>
  );
});

OptimizedCartFooter.displayName = 'OptimizedCartFooter';

// CartItemRow 컴포넌트도 메모이제이션
interface CartItemRowProps {
  item: CartItem;
  onRemove: (cartId: string) => void;
}

const CartItemRow = React.memo(({ item, onRemove }: CartItemRowProps) => {
  return (
    <div className="flex justify-between items-start bg-[#1A1A1A] p-3 rounded-xl border border-[#3D3D3D]">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">{item.menu.name}</span>
          <span className="text-xs bg-[#3D3D3D] px-2 py-0.5 rounded text-[#B0B0B0]">x{item.quantity}</span>
        </div>
        <div className="text-sm text-[#B0B0B0] mt-1 flex flex-wrap gap-1">
          {item.selectedOptions.map((opt, idx) => (
            <span key={idx}>
              {opt.items.map(i => i.name).join(', ')}
              {idx < item.selectedOptions.length - 1 ? ' / ' : ''}
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className="font-bold">₩ {item.totalPrice.toLocaleString()}</span>
        <button
          onClick={() => onRemove(item.cartId)}
          className="text-[#E74C3C] p-1 hover:bg-[#3D3D3D] rounded"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}, (prev, next) => {
  return prev.item.cartId === next.item.cartId &&
         prev.item.totalPrice === next.item.totalPrice;
});

CartItemRow.displayName = 'CartItemRow';
