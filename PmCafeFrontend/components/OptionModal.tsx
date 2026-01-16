import React, { useState, useEffect, useMemo } from 'react';
import { X, Minus, Plus, ShoppingCart } from 'lucide-react';
import { MenuItem, OptionGroup, OptionItem, CartItem, SelectedOption } from '../types';

interface OptionModalProps {
  menu: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
}

const OptionModal: React.FC<OptionModalProps> = ({ menu, isOpen, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  // Map of GroupID -> Array of selected OptionItems
  const [selections, setSelections] = useState<Record<number, OptionItem[]>>({});
  
  // Initialize defaults when menu opens
  useEffect(() => {
    if (isOpen && menu) {
      setQuantity(1);
      const initialSelections: Record<number, OptionItem[]> = {};
      
      menu.optionGroups?.forEach(group => {
        if (group.type === 'SINGLE') {
          const defaultItem = group.items.find(i => i.isDefault) || group.items[0];
          if (defaultItem) {
            initialSelections[group.id] = [defaultItem];
          }
        } else {
          initialSelections[group.id] = [];
        }
      });
      setSelections(initialSelections);
    }
  }, [isOpen, menu]);

  if (!isOpen || !menu) return null;

  const handleOptionToggle = (group: OptionGroup, item: OptionItem) => {
    setSelections(prev => {
      const current = prev[group.id] || [];
      
      if (group.type === 'SINGLE') {
        // Radio behavior
        return { ...prev, [group.id]: [item] };
      } else {
        // Checkbox behavior
        const exists = current.find(i => i.id === item.id);
        if (exists) {
          return { ...prev, [group.id]: current.filter(i => i.id !== item.id) };
        } else {
          return { ...prev, [group.id]: [...current, item] };
        }
      }
    });
  };

  const calculateTotal = () => {
    let optionTotal = 0;
    Object.values(selections).flat().forEach((opt: OptionItem) => {
      optionTotal += opt.price;
    });
    return (menu.price + optionTotal) * quantity;
  };

  const isValid = () => {
    return menu.optionGroups?.every(group => {
      if (!group.isRequired) return true;
      const selected = selections[group.id];
      return selected && selected.length > 0;
    }) ?? true;
  };

  const handleAddToCart = () => {
    if (!isValid()) return;

    // Transform internal selection state to CartItem structure
    const selectedOptions: SelectedOption[] = menu.optionGroups?.map(group => ({
      groupId: group.id,
      groupName: group.name,
      items: selections[group.id] || []
    })).filter(so => so.items.length > 0) ?? [];

    const cartItem: CartItem = {
      cartId: `${menu.id}-${Date.now()}`,
      menu: menu,
      quantity,
      selectedOptions,
      totalPrice: calculateTotal()
    };

    onAddToCart(cartItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-[#2D2D2D] w-full max-w-lg h-[85vh] sm:h-auto sm:max-h-[85vh] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image & Close */}
        <div className="relative h-48 bg-[#3D3D3D] shrink-0">
          <img src={menu.imageUrl} alt={menu.name} className="w-full h-full object-cover opacity-90" />
          <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/60 to-transparent"></div>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white hover:bg-[#C41E3A] transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content Scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Menu Info */}
          <div>
            <h2 className="text-2xl font-bold text-white">{menu.name}</h2>
            <p className="text-[#B0B0B0] text-sm mt-1">{menu.description}</p>
            <p className="text-xl font-bold text-[#C41E3A] mt-2">₩ {menu.price.toLocaleString()}</p>
          </div>

          <div className="h-px bg-[#3D3D3D] w-full" />

          {/* Option Groups */}
          {menu.optionGroups?.map(group => (
            <div key={group.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <span>{group.icon}</span>
                  {group.name}
                </h3>
                {group.isRequired && <span className="text-[#C41E3A] text-xs font-bold border border-[#C41E3A] px-2 py-0.5 rounded-full">필수</span>}
              </div>

              <div className={`grid ${group.type === 'SINGLE' ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
                {group.items.map(item => {
                  const isSelected = selections[group.id]?.some(i => i.id === item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleOptionToggle(group, item)}
                      className={`
                        relative flex items-center justify-between p-4 rounded-xl border transition-all
                        ${isSelected 
                          ? 'bg-[#2D2D2D] border-[#C41E3A] shadow-[0_0_0_1px_#C41E3A]' 
                          : 'bg-[#3D3D3D] border-transparent hover:bg-[#4D4D4D]'}
                      `}
                    >
                      <div className="flex items-center gap-2">
                        {group.type === 'MULTIPLE' && (
                          <div className={`w-5 h-5 rounded border flex items-center justify-center ${isSelected ? 'bg-[#C41E3A] border-[#C41E3A]' : 'border-[#6B6B6B]'}`}>
                            {isSelected && <span className="text-white text-xs">✓</span>}
                          </div>
                        )}
                        <span className={isSelected ? 'text-white font-medium' : 'text-[#B0B0B0]'}>{item.name}</span>
                      </div>
                      <span className="text-sm font-bold">
                        {item.price > 0 ? `+₩${item.price}` : ''}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Quantity */}
          <div className="pt-4">
            <div className="flex items-center justify-between bg-[#3D3D3D] p-4 rounded-xl">
              <span className="font-semibold">수량</span>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-full border border-[#6B6B6B] flex items-center justify-center hover:border-white hover:bg-[#4D4D4D]"
                >
                  <Minus size={16} />
                </button>
                <span className="text-xl font-bold w-8 text-center">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  className="w-8 h-8 rounded-full border border-[#6B6B6B] flex items-center justify-center hover:border-white hover:bg-[#4D4D4D]"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-4 bg-[#2D2D2D] border-t border-[#3D3D3D]">
          <button 
            onClick={handleAddToCart}
            disabled={!isValid()}
            className={`
              w-full py-4 rounded-xl font-bold text-lg flex items-center justify-between px-6 transition-all
              ${isValid() 
                ? 'bg-gradient-to-r from-[#C41E3A] to-[#A01830] text-white shadow-lg shadow-red-900/30 hover:scale-[1.02]' 
                : 'bg-[#3D3D3D] text-[#6B6B6B] cursor-not-allowed'}
            `}
          >
            <span className="flex items-center gap-2">
              <ShoppingCart size={20} />
              장바구니 담기
            </span>
            <span>₩ {calculateTotal().toLocaleString()}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OptionModal;