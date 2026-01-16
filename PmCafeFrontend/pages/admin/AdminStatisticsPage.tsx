import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { TrendingUp, Calendar, RefreshCw, X } from 'lucide-react';
import { statisticsApi, type DailyStats, type MenuStats } from '../../shared/api';

interface AdminStatisticsPageProps {
  onLogout?: () => void;
}

export const AdminStatisticsPage: React.FC<AdminStatisticsPageProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'sales' | 'menu'>('sales');
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [menuStats, setMenuStats] = useState<MenuStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const startDate = filters.startDate || undefined;
      const endDate = filters.endDate || undefined;

      // Fetch both daily and menu stats in parallel
      const [daily, menu] = await Promise.all([
        statisticsApi.getDailyStats({ startDate, endDate }),
        statisticsApi.getMenuStats({ startDate, endDate }),
      ]);

      setDailyStats(daily);
      setMenuStats(menu);
    } catch (err: any) {
      setError(err.message || '통계 데이터를 불러오는데 실패했습니다.');
      console.error('Failed to fetch statistics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyFilters = () => {
    fetchStatistics();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const maxRevenue = dailyStats.length > 0 ? Math.max(...dailyStats.map(s => s.totalRevenue), 1) : 1;
  const totalRevenue = dailyStats.reduce((sum, s) => sum + s.totalRevenue, 0);
  const totalOrders = dailyStats.reduce((sum, s) => sum + s.totalOrders, 0);

  return (
    <AdminLayout onLogout={onLogout}>
      <div className="p-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <p className="text-red-800">{error}</p>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
              <X size={20} />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">통계</h1>
            <p className="text-gray-600 mt-1">매출 및 메뉴별 통계</p>
          </div>
          <button
            onClick={fetchStatistics}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={isLoading ? 'animate-spin' : ''} size={16} />
            <span className="text-sm">새로고침</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-6">
            {[
              { id: 'sales', label: '일별 매출 통계' },
              { id: 'menu', label: '메뉴별 판매 통계' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-4 px-2 font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-[#C41E3A]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C41E3A]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Period Filter */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center gap-4">
            <Calendar className="text-gray-400" size={20} />
            <span className="text-sm text-gray-600">기간:</span>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C41E3A]"
            />
            <span className="text-gray-600">~</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C41E3A]"
            />
            <button
              onClick={handleApplyFilters}
              disabled={isLoading}
              className="px-4 py-2 bg-[#C41E3A] text-white rounded-lg hover:bg-[#A01830] transition-colors disabled:opacity-50"
            >
              조회
            </button>
            <button
              onClick={() => {
                setFilters({ startDate: '', endDate: '' });
                setTimeout(fetchStatistics, 0);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              초기화
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <p className="text-sm opacity-90 mb-2">총 매출</p>
            <p className="text-4xl font-bold">₩{totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
            <p className="text-sm opacity-90 mb-2">총 주문</p>
            <p className="text-4xl font-bold">{totalOrders}건</p>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-8 text-gray-600">
            ⏳ 로딩 중...
          </div>
        )}

        {/* Sales Statistics */}
        {!isLoading && activeTab === 'sales' && (
          <div className="space-y-6">
            {/* Revenue Chart */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <TrendingUp size={20} className="text-[#C41E3A]" />
                일별 매출 추이
              </h3>

              {dailyStats.length === 0 ? (
                <p className="text-center py-8 text-gray-500">데이터가 없습니다.</p>
              ) : (
                <div className="space-y-3">
                  {dailyStats.map((day) => (
                    <div key={day.date}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {formatDate(day.date)}
                        </span>
                        <div className="text-right">
                          <span className="font-bold text-gray-900">
                            ₩{day.totalRevenue.toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-600 ml-2">
                            ({day.totalOrders}건)
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-[#C41E3A] to-[#A01830] h-3 rounded-full transition-all duration-300"
                          style={{ width: `${(day.totalRevenue / maxRevenue) * 100}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1 text-xs text-gray-600">
                        <span>개인: ₩{(day.personalRevenue || 0).toLocaleString()} ({day.personalOrders || 0}건)</span>
                        <span>셀: ₩{(day.cellRevenue || 0).toLocaleString()} ({day.cellOrders || 0}건)</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Daily Breakdown Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">날짜</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">총 주문</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">총 매출</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">개인결제</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">셀결제</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">평균 객단가</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dailyStats.map((day) => (
                    <tr key={day.date} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {formatDate(day.date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{day.totalOrders}건</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">
                        ₩{day.totalRevenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {day.personalOrders || 0}건 / ₩{(day.personalRevenue || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {day.cellOrders || 0}건 / ₩{(day.cellRevenue || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        ₩{day.totalOrders > 0 ? Math.round(day.totalRevenue / day.totalOrders).toLocaleString() : 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Menu Statistics */}
        {!isLoading && activeTab === 'menu' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold mb-6">메뉴별 판매 통계</h3>

            {menuStats.length === 0 ? (
              <p className="text-center py-8 text-gray-500">데이터가 없습니다.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">순위</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">메뉴명</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">판매량</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">매출액</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">평균 단가</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">매출 비중</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {menuStats.map((menu, index) => {
                      const totalRevenue = menuStats.reduce((sum, m) => sum + m.revenue, 0);
                      const percentage = totalRevenue > 0 ? (menu.revenue / totalRevenue) * 100 : 0;

                      return (
                        <tr key={menu.menuId} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                              index === 0 ? 'bg-yellow-100 text-yellow-800' :
                              index === 1 ? 'bg-gray-100 text-gray-800' :
                              index === 2 ? 'bg-orange-100 text-orange-800' :
                              'bg-blue-50 text-blue-700'
                            }`}>
                              {index + 1}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-medium text-gray-900">{menu.menuName}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-bold text-gray-900">{menu.quantity}잔</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-bold text-[#C41E3A]">
                              ₩{menu.revenue.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600">
                              ₩{Math.round(menu.revenue / menu.quantity).toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-[#C41E3A] h-2 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-600 w-12 text-right">
                                {percentage.toFixed(1)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
