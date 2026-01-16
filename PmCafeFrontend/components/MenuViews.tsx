import React, { useMemo, useState, useEffect } from 'react';
import { ChevronLeft, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { MenuItem, Category, CartItem, PaymentMode, CellInfo } from '../types';
import { menuApi } from '../shared/api';

// --- Header ---
export const Header = ({ 
  paymentMode, 
  cellInfo, 
  onBack 
}: { 
  paymentMode: PaymentMode | null, 
  cellInfo: CellInfo | null, 
  onBack: () => void 
}) => {
  return (
    <div className="h-16 bg-[#1A1A1A] border-b border-[#2D2D2D] flex items-center justify-between px-4 sticky top-0 z-40">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="p-2 -ml-2 text-white hover:bg-[#2D2D2D] rounded-full">
          <ChevronLeft size={28} />
        </button>
        <span className="text-xl font-bold font-serif tracking-wider">P.M CAFE</span>
      </div>
      
      {paymentMode && (
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
            paymentMode === 'PERSONAL' 
              ? 'border-blue-500/50 bg-blue-500/10 text-blue-400'
              : 'border-[#C41E3A]/50 bg-[#C41E3A]/10 text-[#C41E3A]'
          }`}>
            {paymentMode === 'PERSONAL' ? '개인결제' : cellInfo ? cellInfo.name : '셀별결제'}
          </div>
          {cellInfo && (
            <span className="text-sm font-medium text-[#B0B0B0]">
              잔액: <span className="text-white">{cellInfo.balance.toLocaleString()}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// --- Category Tabs ---
const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'ALL', label: '전체' },
  { id: 'COFFEE', label: '☕ 커피' },
  { id: 'NON_COFFEE', label: '🍵 논커피' },
  { id: 'DESSERT', label: '🧁 디저트' },
  { id: 'SEASONAL', label: '⭐ 시즌' },
];

export const CategoryTabs = ({ 
  selected, 
  onSelect 
}: { 
  selected: Category, 
  onSelect: (c: Category) => void 
}) => {
  return (
    <div className="bg-[#1A1A1A] border-b border-[#2D2D2D] sticky top-16 z-30 overflow-x-auto no-scrollbar">
      <div className="flex px-4 min-w-max">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`
              py-4 px-5 text-lg font-semibold transition-all relative
              ${selected === cat.id ? 'text-white' : 'text-[#6B6B6B] hover:text-[#B0B0B0]'}
            `}
          >
            {cat.label}
            {selected === cat.id && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#C41E3A] rounded-t-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

// --- Menu Grid ---
export const MenuGrid = ({
  selectedCategory,
  onItemClick
}: {
  selectedCategory: Category,
  onItemClick: (item: MenuItem) => void
}) => {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch menus from API
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        setLoading(true);
        const data = await menuApi.getMenus({ include_inactive: false });
        setMenus(data);
      } catch (error) {
        console.error('Failed to fetch menus:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, []);

  const filteredMenu = useMemo(() => {
    return selectedCategory === 'ALL'
      ? menus
      : menus.filter(item => item.category === selectedCategory);
  }, [selectedCategory, menus]);

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[400px]">
        <div className="text-[#B0B0B0]">메뉴 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-48">
      {filteredMenu.map(item => (
        <div 
          key={item.id}
          onClick={() => !item.isSoldOut && onItemClick(item)}
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
      ))}
    </div>
  );
};

// --- Cart Footer ---
export const CartFooter = ({ 
  cart, 
  onRemove, 
  onOrder 
}: { 
  cart: CartItem[], 
  onRemove: (id: string) => void,
  onOrder: () => void
}) => {
  const totalAmount = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Cart Drawer Header (Always Visible) */}
      <div className="bg-[#2D2D2D] rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.5)] border-t border-[#3D3D3D] overflow-hidden">
        
        {/* Cart Items (Scrollable if expanded, currently just fixed height for simplicity) */}
        {cart.length > 0 ? (
          <div className="max-h-60 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {cart.map(item => (
              <div key={item.cartId} className="flex justify-between items-start bg-[#1A1A1A] p-3 rounded-xl border border-[#3D3D3D]">
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
};