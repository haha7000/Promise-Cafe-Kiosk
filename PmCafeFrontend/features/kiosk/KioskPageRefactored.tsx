/**
 * 리팩토링된 KioskPage
 * - Custom Hooks로 로직 분리
 * - 컴포넌트 크기 축소 (1100 라인 → 150 라인)
 * - 성능 최적화 적용
 * - 에러 처리 추가
 */

import React, { useCallback } from 'react';
import { useKioskFlow } from './hooks/useKioskFlow';
import { useCart } from './hooks/useCart';
import { useOrderSubmit } from './hooks/useOrderSubmit';
import { useMenuSelection } from './hooks/useMenuSelection';
import { HomeView, CellAuthView, PaymentQRView, OrderCompleteView } from '../../components/PaymentViews';
import { Header, CategoryTabs } from '../../components/MenuViews';
import { OptimizedMenuGrid } from './components/OptimizedMenuGrid';
import { OptimizedCartFooter } from './components/OptimizedCartFooter';
import OptionModal from '../../components/OptionModal';
import { logger } from '../../shared/utils/logger';
import { CartItem } from '../../types';

export const KioskPageRefactored: React.FC = () => {
  const kioskFlow = useKioskFlow();
  const cart = useCart();
  const orderSubmit = useOrderSubmit();
  const menuSelection = useMenuSelection();

  // 주문 제출 핸들러
  const handleOrder = useCallback(async () => {
    logger.track('order_submit_clicked', {
      payType: kioskFlow.paymentMode,
      itemCount: cart.itemCount,
      totalAmount: cart.total
    });

    if (kioskFlow.paymentMode === 'CELL') {
      // 셀별결제: 즉시 주문 제출
      const result = await orderSubmit.submitOrder({
        payType: kioskFlow.paymentMode,
        cellInfo: kioskFlow.cellInfo!,
        items: cart.items,
        totalAmount: cart.total
      });

      if (result.success) {
        logger.info('Order submitted successfully', { orderId: result.order?.orderId });
        cart.clear();
        kioskFlow.goToComplete(result.order!.dailyNum);
      } else {
        logger.error('Order submission failed', undefined, { error: result.error });
        alert(result.error); // 실제로는 Toast 사용
      }
    } else {
      // 개인결제: QR 화면으로 이동
      kioskFlow.goToPayment();
      // 임시 저장
      window.__pendingOrder = {
        orderId: '',
        dailyNum: 0,
        payType: kioskFlow.paymentMode!,
        items: cart.items,
        totalAmount: cart.total,
        status: 'PENDING',
        createdAt: new Date()
      };
    }
  }, [kioskFlow, cart, orderSubmit]);

  // 개인결제 완료 핸들러
  const handlePaymentComplete = useCallback(async () => {
    const result = await orderSubmit.submitOrder({
      payType: kioskFlow.paymentMode!,
      items: cart.items,
      totalAmount: cart.total
    });

    if (result.success) {
      delete window.__pendingOrder;
      cart.clear();
      kioskFlow.goToComplete(result.order!.dailyNum);
    } else {
      alert(result.error);
    }
  }, [kioskFlow, cart, orderSubmit]);

  // 뒤로가기 핸들러 (장바구니 확인)
  const handleBack = useCallback(() => {
    if (kioskFlow.view === 'MENU' && cart.itemCount > 0) {
      if (!window.confirm('장바구니가 초기화됩니다. 뒤로 가시겠습니까?')) {
        return;
      }
      cart.clear();
    }
    kioskFlow.goBack();
  }, [kioskFlow, cart]);

  // 초기화 핸들러
  const handleReset = useCallback(() => {
    cart.clear();
    kioskFlow.reset();
  }, [cart, kioskFlow]);

  // 장바구니에 추가 핸들러
  const handleAddToCart = useCallback((item: CartItem) => {
    cart.addItem(item);
    logger.track('item_added_to_cart', {
      menuId: item.menu.id,
      menuName: item.menu.name,
      quantity: item.quantity,
      price: item.totalPrice
    });
  }, [cart]);

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white font-sans selection:bg-[#C41E3A] selection:text-white">
      {/* HOME 화면 */}
      {kioskFlow.view === 'HOME' && (
        <HomeView onSelectMode={kioskFlow.selectPaymentMode} />
      )}

      {/* 셀 인증 화면 */}
      {kioskFlow.view === 'CELL_AUTH' && (
        <CellAuthView
          onBack={handleBack}
          onSuccess={kioskFlow.handleCellAuth}
        />
      )}

      {/* 메뉴 선택 화면 */}
      {kioskFlow.view === 'MENU' && (
        <div className="flex flex-col h-screen">
          <Header
            paymentMode={kioskFlow.paymentMode}
            cellInfo={kioskFlow.cellInfo}
            onBack={handleBack}
          />
          <CategoryTabs
            selected={menuSelection.selectedCategory}
            onSelect={menuSelection.selectCategory}
          />
          <div className="flex-1 overflow-y-auto no-scrollbar relative">
            <OptimizedMenuGrid
              selectedCategory={menuSelection.selectedCategory}
              onItemClick={menuSelection.selectMenu}
            />
          </div>
          <OptimizedCartFooter
            cart={cart.items}
            onRemove={cart.removeItem}
            onOrder={handleOrder}
          />

          <OptionModal
            isOpen={menuSelection.isOptionModalOpen}
            menu={menuSelection.selectedMenu}
            onClose={menuSelection.closeOptionModal}
            onAddToCart={handleAddToCart}
          />
        </div>
      )}

      {/* QR 결제 화면 */}
      {kioskFlow.view === 'PAYMENT_QR' && (
        <PaymentQRView
          totalAmount={cart.total}
          onBack={handleBack}
          onComplete={handlePaymentComplete}
        />
      )}

      {/* 주문 완료 화면 */}
      {kioskFlow.view === 'ORDER_COMPLETE' && (
        <OrderCompleteView
          orderNumber={kioskFlow.orderNumber}
          onReset={handleReset}
        />
      )}
    </div>
  );
};
