/**
 * 가격 관련 유틸리티 함수
 */

import { CartItem, SelectedOption } from '../types';

/**
 * 숫자를 한국 원화 포맷으로 변환
 * @example formatCurrency(5000) // "₩5,000"
 */
export const formatCurrency = (amount: number): string => {
  return `₩${amount.toLocaleString()}`;
};

/**
 * 선택된 옵션의 총 가격 계산
 * @param selectedOptions 선택된 옵션 배열
 * @returns 옵션 총 가격
 */
export const calculateOptionsPrice = (selectedOptions: SelectedOption[]): number => {
  return selectedOptions.reduce((sum, group) => {
    return sum + group.items.reduce((s, item) => s + item.price, 0);
  }, 0);
};

/**
 * 장바구니 총 금액 계산
 * @param cart 장바구니 아이템 배열
 * @returns 총 금액
 */
export const calculateCartTotal = (cart: CartItem[]): number => {
  return cart.reduce((sum, item) => sum + item.totalPrice, 0);
};

/**
 * 장바구니 총 수량 계산
 * @param cart 장바구니 아이템 배열
 * @returns 총 수량
 */
export const calculateCartQuantity = (cart: CartItem[]): number => {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
};
