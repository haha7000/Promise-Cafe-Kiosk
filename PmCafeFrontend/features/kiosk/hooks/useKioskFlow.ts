/**
 * 키오스크 화면 흐름 관리 Hook
 * - 화면 전환 로직
 * - 결제 방식 관리
 * - 셀 정보 관리
 */

import { useState, useCallback } from 'react';
import { ViewState, PaymentMode, CellInfo } from '../../../types';

export const useKioskFlow = () => {
  const [view, setView] = useState<ViewState>('HOME');
  const [paymentMode, setPaymentMode] = useState<PaymentMode | null>(null);
  const [cellInfo, setCellInfo] = useState<CellInfo | null>(null);
  const [orderNumber, setOrderNumber] = useState(0);

  const selectPaymentMode = useCallback((mode: PaymentMode) => {
    setPaymentMode(mode);
    setView(mode === 'CELL' ? 'CELL_AUTH' : 'MENU');
  }, []);

  const handleCellAuth = useCallback((info: CellInfo) => {
    setCellInfo(info);
    setView('MENU');
  }, []);

  const goToPayment = useCallback(() => {
    setView('PAYMENT_QR');
  }, []);

  const goToComplete = useCallback((num: number) => {
    setOrderNumber(num);
    setView('ORDER_COMPLETE');
  }, []);

  const goBack = useCallback(() => {
    if (view === 'CELL_AUTH') {
      setView('HOME');
      setPaymentMode(null);
    } else if (view === 'MENU') {
      setView('HOME');
      setPaymentMode(null);
      setCellInfo(null);
    } else if (view === 'PAYMENT_QR') {
      setView('MENU');
    }
  }, [view]);

  const reset = useCallback(() => {
    setView('HOME');
    setPaymentMode(null);
    setCellInfo(null);
    setOrderNumber(0);
  }, []);

  return {
    view,
    paymentMode,
    cellInfo,
    orderNumber,
    selectPaymentMode,
    handleCellAuth,
    goToPayment,
    goToComplete,
    goBack,
    reset
  };
};
