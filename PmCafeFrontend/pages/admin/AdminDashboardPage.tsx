import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { ShoppingBag, DollarSign, Clock, CheckCircle, TrendingUp, RefreshCw } from 'lucide-react';
import { statisticsApi, type DashboardStats, type MenuStats } from '../../shared/api';
import { useOrders } from '../../shared/contexts/OrderContext';

interface AdminDashboardPageProps {
  onLogout?: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onLogout }) => {
  const { orders } = useOrders();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topMenus, setTopMenus] = useState<MenuStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🆕 API에서 통계 데이터 불러오기
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 오늘 날짜 (YYYY-MM-DD 형식)
      const today = new Date().toISOString().split('T')[0];

      // 대시보드 통계 가져오기
      const dashboardData = await statisticsApi.getDashboard(today);
      setStats(dashboardData);

      // 메뉴별 판매 통계 가져오기 (오늘 데이터)
      const menuStatsData = await statisticsApi.getMenuStats({
        startDate: today,
        endDate: today
      });
      setTopMenus(menuStatsData.slice(0, 5)); // TOP 5만
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('통계 데이터를 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // 1분마다 자동 갱신
    const intervalId = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(intervalId);
  }, []);

  // Recent pending orders (OrderContext에서 가져옴)
  const recentPending = orders
    .filter(o => o.status === 'PENDING' || o.status === 'MAKING')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  };

  // 로딩 중
  if (isLoading && !stats) {
    return (
      <AdminLayout onLogout={onLogout}>
        <div className="p-8 flex items-center justify-center min-h-[500px]">
          <div className="text-center">
            <RefreshCw className="animate-spin text-[#C41E3A] mx-auto mb-4" size={48} />
            <p className="text-gray-600">통계 데이터 로딩 중...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // 에러 발생
  if (error) {
    return (
      <AdminLayout onLogout={onLogout}>
        <div className="p-8 flex items-center justify-center min-h-[500px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-[#C41E3A] text-white rounded-lg hover:bg-[#A01830]"
            >
              다시 시도
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // 데이터 없음
  if (!stats) {
    return null;
  }

  return (
    <AdminLayout onLogout={onLogout}>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
            <p className="text-gray-600 mt-1">{formatDate()}</p>
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={isLoading ? 'animate-spin' : ''} size={16} />
            <span className="text-sm">새로고침</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Orders */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingBag className="text-blue-600" size={24} />
              </div>
              <div className="flex items-center text-green-600 text-sm">
                <TrendingUp size={16} />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">오늘 주문</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalOrders}건</p>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="text-green-600" size={24} />
              </div>
              <div className="flex items-center text-green-600 text-sm">
                <TrendingUp size={16} />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">오늘 매출</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">₩{stats.totalRevenue.toLocaleString()}</p>
          </div>

          {/* Pending Orders */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="text-yellow-600" size={24} />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">대기 주문</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pendingOrders + stats.makingOrders}건</p>
          </div>

          {/* Completed Orders */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <CheckCircle className="text-purple-600" size={24} />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">완료 주문</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.completedOrders}건</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Payment Type Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-6">결제 타입별 현황</h3>

            <div className="space-y-4">
              {/* Personal Payment */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">개인결제</span>
                  <span className="text-sm font-bold text-gray-900">
                    {stats.totalOrders > 0 ? Math.round((stats.personalOrders / stats.totalOrders) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${stats.totalOrders > 0 ? (stats.personalOrders / stats.totalOrders) * 100 : 0}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">₩{stats.personalRevenue.toLocaleString()}</p>
              </div>

              {/* Cell Payment */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">셀별결제</span>
                  <span className="text-sm font-bold text-gray-900">
                    {stats.totalOrders > 0 ? Math.round((stats.cellOrders / stats.totalOrders) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-red-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${stats.totalOrders > 0 ? (stats.cellOrders / stats.totalOrders) * 100 : 0}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">₩{stats.cellRevenue.toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600">개인결제</p>
                <p className="text-lg font-bold text-gray-900">₩{stats.personalRevenue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">셀별결제</p>
                <p className="text-lg font-bold text-gray-900">₩{stats.cellRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Top Menus */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-6">인기 메뉴 TOP 5</h3>

            <div className="space-y-4">
              {topMenus.length === 0 ? (
                <p className="text-center text-gray-500 py-8">주문 데이터가 없습니다</p>
              ) : (
                topMenus.map((menu, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#C41E3A] to-[#A01830] text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{menu.menuName}</p>
                        <p className="text-xs text-gray-600">{menu.quantity}잔</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">₩{menu.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Pending Orders */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">실시간 대기 주문</h3>
            <a href="/admin/orders" className="text-sm text-[#C41E3A] hover:underline">전체보기 →</a>
          </div>

          {recentPending.length === 0 ? (
            <p className="text-center text-gray-500 py-8">대기 중인 주문이 없습니다</p>
          ) : (
            <div className="space-y-3">
              {recentPending.map((order) => (
                <div key={order.orderId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#C41E3A] text-white rounded-full flex items-center justify-center font-bold">
                      #{order.dailyNum}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {order.items.map(i => `${i.menuName} x${i.quantity}`).join(', ')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.payType === 'PERSONAL' ? '개인결제' : `셀별결제 (${order.cellInfo?.name})`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{formatTime(order.createdAt)}</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {order.status === 'PENDING' ? 'NEW' : '제조중'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
