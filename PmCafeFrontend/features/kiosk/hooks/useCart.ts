/**
 * 장바구니 관리 Hook
 * - 아이템 추가/제거
 * - 총액 계산
 * - 수량 계산
 */

import { useState, useCallback, useMemo } from 'react';
import { CartItem } from '../../../types';
import { calculateCartTotal, calculateCartQuantity, calculateOptionsPrice } from '../../../shared/utils/priceUtils';

export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((item: CartItem) => {
    setItems(prev => [...prev, item]);
  }, []);

  const removeItem = useCallback((cartId: string) => {
    setItems(prev => prev.filter(item => item.cartId !== cartId));
  }, []);

  const updateQuantity = useCallback((cartId: string, quantity: number) => {
    setItems(prev => prev.map(item =>
      item.cartId === cartId
        ? {
            ...item,
            quantity,
            totalPrice: (item.menu.price + calculateOptionsPrice(item.selectedOptions)) * quantity
          }
        : item
    ));
  }, []);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  const total = useMemo(() => calculateCartTotal(items), [items]);
  const itemCount = useMemo(() => calculateCartQuantity(items), [items]);
  const isEmpty = items.length === 0;

  return {
    items,
    total,
    itemCount,
    isEmpty,
    addItem,
    removeItem,
    updateQuantity,
    clear
  };
};
