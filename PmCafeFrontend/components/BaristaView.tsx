import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, Coffee, ChefHat, Bell, Home } from 'lucide-react';
import { Order, OrderStatus } from '../types';

interface BaristaViewProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onGoHome?: () => void;
}

export const BaristaView: React.FC<BaristaViewProps> = ({ orders, onUpdateStatus, onGoHome }) => {
  const [notification, setNotification] = useState<string | null>(null);

  // 새 주문 알림
  useEffect(() => {
    const pendingOrders = orders.filter(o => o.status === 'PENDING');
    if (pendingOrders.length > 0) {
      const latestOrder = pendingOrders[pendingOrders.length - 1];
      setNotification(`새 주문! #${latestOrder.dailyNum}`);

      // 3초 후 알림 제거
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [orders]);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500/10 border-yellow-500 text-yellow-400';
      case 'MAKING':
        return 'bg-blue-500/10 border-blue-500 text-blue-400';
      case 'COMPLETED':
        return 'bg-green-500/10 border-green-500 text-green-400';
      default:
        return 'bg-[#3D3D3D] border-[#3D3D3D] text-[#B0B0B0]';
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return '대기';
      case 'MAKING':
        return '제조중';
      case 'COMPLETED':
        return '완료';
      default:
        return '알 수 없음';
    }
  };

  const handleStatusChange = (orderId: string, currentStatus: OrderStatus) => {
    if (currentStatus === 'PENDING') {
      onUpdateStatus(orderId, 'MAKING');
    } else if (currentStatus === 'MAKING') {
      onUpdateStatus(orderId, 'COMPLETED');
    }
  };

  // 상태별 주문 필터링
  const pendingOrders = orders.filter(o => o.status === 'PENDING');
  const makingOrders = orders.filter(o => o.status === 'MAKING');
  const completedOrders = orders.filter(o => o.status === 'COMPLETED').slice(-5); // 최근 5개만

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white">
      {/* Header */}
      <div className="bg-[#2D2D2D] border-b border-[#3D3D3D] sticky top-0 z-50">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#C41E3A]/20 rounded-full">
              <ChefHat size={32} className="text-[#C41E3A]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-serif tracking-wider">P.M CAFE</h1>
              <p className="text-[#B0B0B0] text-sm">음료제조자 모드</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* 주문 현황 요약 */}
            <div className="flex gap-4 bg-[#1A1A1A] px-6 py-3 rounded-xl border border-[#3D3D3D]">
              <div className="text-center">
                <p className="text-yellow-400 text-2xl font-bold">{pendingOrders.length}</p>
                <p className="text-[#B0B0B0] text-xs">대기</p>
              </div>
              <div className="w-px bg-[#3D3D3D]" />
              <div className="text-center">
                <p className="text-blue-400 text-2xl font-bold">{makingOrders.length}</p>
                <p className="text-[#B0B0B0] text-xs">제조중</p>
              </div>
            </div>

            {onGoHome && (
              <button
                onClick={onGoHome}
                className="p-3 bg-[#3D3D3D] hover:bg-[#4D4D4D] rounded-full transition-colors"
                title="메인으로"
              >
                <Home size={24} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 새 주문 알림 */}
      {notification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-[#C41E3A] px-8 py-4 rounded-full shadow-2xl flex items-center gap-3">
            <Bell size={24} className="animate-pulse" />
            <span className="text-xl font-bold">{notification}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* 대기 주문 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={24} className="text-yellow-400" />
            <h2 className="text-2xl font-bold">대기 중</h2>
            <span className="ml-auto bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-bold">
              {pendingOrders.length}건
            </span>
          </div>

          {pendingOrders.length === 0 ? (
            <div className="bg-[#2D2D2D] rounded-xl p-8 text-center text-[#6B6B6B] border border-[#3D3D3D]">
              대기 중인 주문이 없습니다
            </div>
          ) : (
            pendingOrders.map(order => (
              <OrderCard
                key={order.orderId}
                order={order}
                onAction={() => handleStatusChange(order.orderId, order.status)}
                actionText="제조 시작"
                formatTime={formatTime}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
              />
            ))
          )}
        </div>

        {/* 제조중 주문 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Coffee size={24} className="text-blue-400" />
            <h2 className="text-2xl font-bold">제조 중</h2>
            <span className="ml-auto bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-bold">
              {makingOrders.length}건
            </span>
          </div>

          {makingOrders.length === 0 ? (
            <div className="bg-[#2D2D2D] rounded-xl p-8 text-center text-[#6B6B6B] border border-[#3D3D3D]">
              제조 중인 주문이 없습니다
            </div>
          ) : (
            makingOrders.map(order => (
              <OrderCard
                key={order.orderId}
                order={order}
                onAction={() => handleStatusChange(order.orderId, order.status)}
                actionText="완료"
                formatTime={formatTime}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
              />
            ))
          )}
        </div>

        {/* 완료된 주문 (최근 5개) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 size={24} className="text-green-400" />
            <h2 className="text-2xl font-bold">완료</h2>
            <span className="ml-auto text-[#6B6B6B] text-sm">최근 5개</span>
          </div>

          {completedOrders.length === 0 ? (
            <div className="bg-[#2D2D2D] rounded-xl p-8 text-center text-[#6B6B6B] border border-[#3D3D3D]">
              완료된 주문이 없습니다
            </div>
          ) : (
            completedOrders.map(order => (
              <OrderCard
                key={order.orderId}
                order={order}
                formatTime={formatTime}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
                isCompleted
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// OrderCard 컴포넌트
interface OrderCardProps {
  order: Order;
  onAction?: () => void;
  actionText?: string;
  formatTime: (date: Date) => string;
  getStatusColor: (status: OrderStatus) => string;
  getStatusText: (status: OrderStatus) => string;
  isCompleted?: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onAction,
  actionText,
  formatTime,
  getStatusColor,
  getStatusText,
  isCompleted = false
}) => {
  return (
    <div className={`
      bg-[#2D2D2D] rounded-xl border-2 overflow-hidden transition-all
      ${isCompleted ? 'opacity-60' : 'shadow-lg hover:shadow-xl'}
    `}>
      {/* Header */}
      <div className="bg-[#3D3D3D] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-[#C41E3A] flex items-center justify-center">
            <span className="text-3xl font-black">{order.dailyNum}</span>
          </div>
          <div>
            <p className="text-[#B0B0B0] text-xs">주문번호</p>
            <p className="font-mono text-sm text-[#6B6B6B]">{order.orderId.slice(0, 8)}</p>
          </div>
        </div>

        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
          {getStatusText(order.status)}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* 주문 항목 */}
        <div className="space-y-2">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{item.menu?.name || '메뉴 정보 없음'}</span>
                  <span className="text-xs bg-[#3D3D3D] px-2 py-0.5 rounded text-[#B0B0B0]">
                    x{item.quantity}
                  </span>
                </div>
                {item.selectedOptions.length > 0 && (
                  <div className="text-sm text-[#B0B0B0] mt-1 flex flex-wrap gap-1">
                    {item.selectedOptions.map((opt, optIdx) => (
                      <span key={optIdx} className="text-xs">
                        {opt.items.map(i => i.name).join(', ')}
                        {optIdx < item.selectedOptions.length - 1 ? ' · ' : ''}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 메타 정보 */}
        <div className="flex items-center justify-between text-xs text-[#6B6B6B] pt-2 border-t border-[#3D3D3D]">
          <div className="flex items-center gap-3">
            <span>{formatTime(order.createdAt)}</span>
            <span className={`px-2 py-0.5 rounded ${
              order.payType === 'PERSONAL'
                ? 'bg-blue-500/10 text-blue-400'
                : 'bg-[#C41E3A]/10 text-[#C41E3A]'
            }`}>
              {order.payType === 'PERSONAL' ? '개인결제' : '셀별결제'}
            </span>
          </div>
          <span className="font-bold text-white">₩ {order.totalAmount.toLocaleString()}</span>
        </div>

        {/* 액션 버튼 */}
        {onAction && actionText && (
          <button
            onClick={onAction}
            className={`
              w-full py-3 rounded-lg font-bold text-lg transition-all
              ${order.status === 'PENDING'
                ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg shadow-green-900/30'}
            `}
          >
            {actionText}
          </button>
        )}
      </div>
    </div>
  );
};
