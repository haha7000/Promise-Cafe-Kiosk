import React, { useState } from 'react';
import { ViewState, PaymentMode, CellInfo, Category, MenuItem, CartItem, Order } from '../types';
import { HomeView, CellAuthView, PaymentQRView, OrderCompleteView } from '../components/PaymentViews';
import { Header, CategoryTabs, MenuGrid, CartFooter } from '../components/MenuViews';
import OptionModal from '../components/OptionModal';
import { useOrders } from '../shared/contexts/OrderContext';
import { orderApi, type CreateOrderRequest } from '../shared/api';

export const KioskPage: React.FC = () => {
  const { orders, addOrder } = useOrders();
  // Navigation State
  const [view, setView] = useState<ViewState>('HOME');
  const [paymentMode, setPaymentMode] = useState<PaymentMode | null>(null);
  const [cellInfo, setCellInfo] = useState<CellInfo | null>(null);
  const [orderNumber, setOrderNumber] = useState(0);

  // Menu State
  const [selectedCategory, setSelectedCategory] = useState<Category>('ALL');
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);

  // Handlers
  const handleModeSelect = (mode: PaymentMode) => {
    setPaymentMode(mode);
    if (mode === 'CELL') {
      setView('CELL_AUTH');
    } else {
      setView('MENU');
    }
  };

  const handleCellAuthSuccess = (info: CellInfo) => {
    setCellInfo(info);
    setView('MENU');
  };

  const handleMenuClick = (item: MenuItem) => {
    setSelectedMenu(item);
    setIsOptionModalOpen(true);
  };

  const handleAddToCart = (item: CartItem) => {
    setCart(prev => [...prev, item]);
  };

  const handleRemoveFromCart = (cartId: string) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  const handleOrder = async () => {
    try {
      // Prepare order data for API
      const orderData: CreateOrderRequest = {
        payType: paymentMode!,
        cellId: paymentMode === 'CELL' ? cellInfo!.id : undefined,
        items: cart.map(item => ({
          menuId: item.menu.id,
          menuName: item.menu.name,
          menuPrice: item.menu.price,
          quantity: item.quantity,
          selectedOptions: item.selectedOptions.map(opt => ({
            groupName: opt.groupName,
            items: opt.items.map(optItem => ({
              name: optItem.name,
              price: optItem.price
            }))
          }))
        })),
        totalAmount: cart.reduce((sum, item) => sum + item.totalPrice, 0)
      };

      // Call API to create order
      const createdOrder = await orderApi.createOrder(orderData);

      // Set order number for display
      setOrderNumber(createdOrder.dailyNum);

      // Add to local orders list
      addOrder(createdOrder);

      if (paymentMode === 'CELL') {
        // Cell payment: Go to complete immediately
        setTimeout(() => setView('ORDER_COMPLETE'), 500);
      } else {
        // Personal payment: Show QR first, then complete
        setView('PAYMENT_QR');
        window.__pendingOrder = createdOrder;
      }
    } catch (error) {
      console.error('Order creation failed:', error);
      alert('주문 생성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handlePaymentComplete = () => {
    // Add pending order to orders list
    const pendingOrder = window.__pendingOrder;
    if (pendingOrder) {
      addOrder(pendingOrder);
      delete window.__pendingOrder;
    }
    setView('ORDER_COMPLETE');
  };

  const handleReset = () => {
    setView('HOME');
    setCart([]);
    setPaymentMode(null);
    setCellInfo(null);
    setSelectedCategory('ALL');
  };

  const handleBack = () => {
    if (view === 'CELL_AUTH') setView('HOME');
    if (view === 'MENU') {
      // Confirm if cart has items?
      if (cart.length > 0 && !window.confirm('장바구니가 초기화됩니다. 뒤로 가시겠습니까?')) return;
      setCart([]);
      setPaymentMode(null);
      setCellInfo(null);
      setView('HOME');
    }
    if (view === 'PAYMENT_QR') setView('MENU');
  };

  // Render Views
  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white font-sans selection:bg-[#C41E3A] selection:text-white">
      {view === 'HOME' && (
        <HomeView onSelectMode={handleModeSelect} />
      )}

      {view === 'CELL_AUTH' && (
        <CellAuthView onBack={handleBack} onSuccess={handleCellAuthSuccess} />
      )}

      {view === 'MENU' && (
        <div className="flex flex-col h-screen">
          <Header
            paymentMode={paymentMode}
            cellInfo={cellInfo}
            onBack={handleBack}
          />
          <CategoryTabs
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
          <div className="flex-1 overflow-y-auto no-scrollbar relative">
             <MenuGrid
               selectedCategory={selectedCategory}
               onItemClick={handleMenuClick}
             />
          </div>
          <CartFooter
            cart={cart}
            onRemove={handleRemoveFromCart}
            onOrder={handleOrder}
          />

          <OptionModal
            isOpen={isOptionModalOpen}
            menu={selectedMenu}
            onClose={() => setIsOptionModalOpen(false)}
            onAddToCart={handleAddToCart}
          />
        </div>
      )}

      {view === 'PAYMENT_QR' && (
        <PaymentQRView
          totalAmount={cart.reduce((sum, item) => sum + item.totalPrice, 0)}
          onBack={handleBack}
          onComplete={handlePaymentComplete}
        />
      )}

      {view === 'ORDER_COMPLETE' && (
        <OrderCompleteView
          orderNumber={orderNumber}
          onReset={handleReset}
        />
      )}
    </div>
  );
};
