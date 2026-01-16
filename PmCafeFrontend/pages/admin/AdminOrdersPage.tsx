import React, { useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { useOrders } from '../../shared/contexts/OrderContext';
import { OrderStatus } from '../../types';
import { RefreshCw } from 'lucide-react';

interface AdminOrdersPageProps {
  onLogout?: () => void;
}

export const AdminOrdersPage: React.FC<AdminOrdersPageProps> = ({ onLogout }) => {
  const { orders, isLoading, refreshOrders } = useOrders();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');

  const filteredOrders = statusFilter === 'ALL'
    ? orders
    : orders.filter(o => o.status === statusFilter);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: OrderStatus) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      MAKING: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
    };
    const labels = {
      PENDING: '대기',
      MAKING: '제조중',
      COMPLETED: '완료',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <AdminLayout onLogout={onLogout}>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">주문 관리</h1>
            <p className="text-gray-600 mt-1">전체 {orders.length}건</p>
          </div>
          <button
            onClick={refreshOrders}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-[#C41E3A] text-white rounded-lg hover:bg-[#A01830] disabled:opacity-50"
          >
            <RefreshCw className={isLoading ? 'animate-spin' : ''} size={16} />
            새로고침
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {(['ALL', 'PENDING', 'MAKING', 'COMPLETED'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === filter
                  ? 'bg-[#C41E3A] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              {filter === 'ALL' && '전체'}
              {filter === 'PENDING' && '대기'}
              {filter === 'MAKING' && '제조중'}
              {filter === 'COMPLETED' && '완료'}
              <span className="ml-2 text-sm">
                ({filter === 'ALL' ? orders.length : orders.filter(o => o.status === filter).length})
              </span>
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">주문번호</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">시간</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">메뉴</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">결제타입</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">금액</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    주문이 없습니다
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.orderId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#C41E3A] text-white rounded-full flex items-center justify-center font-bold">
                          #{order.dailyNum}
                        </div>
                        <div>
                          <p className="text-sm font-mono text-gray-500">{order.orderId.slice(0, 12)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-900 font-medium">{formatTime(order.createdAt)}</p>
                        <p className="text-gray-500">{formatDate(order.createdAt)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {order.items.map((item, idx) => (
                          <p key={idx} className="text-gray-900">
                            {item.menuName} x{item.quantity}
                          </p>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        order.payType === 'PERSONAL'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {order.payType === 'PERSONAL' ? '개인결제' : '셀별결제'}
                      </span>
                      {order.cellInfo && (
                        <p className="text-xs text-gray-500 mt-1">{order.cellInfo.name}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900">
                        ₩{order.totalAmount.toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(order.status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};
