import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { CheckCircle, Calendar, RefreshCw, X } from 'lucide-react';
import { settlementApi, type DailySettlement } from '../../shared/api';

interface AdminSettlementsPageProps {
  onLogout?: () => void;
}

export const AdminSettlementsPage: React.FC<AdminSettlementsPageProps> = ({ onLogout }) => {
  const [settlements, setSettlements] = useState<DailySettlement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    isConfirmed: undefined as boolean | undefined,
  });

  useEffect(() => {
    fetchSettlements();
  }, [filters]);

  const fetchSettlements = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await settlementApi.getSettlements({
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        isConfirmed: filters.isConfirmed,
      });
      setSettlements(data);
    } catch (err: any) {
      setError(err.message || '정산 목록을 불러오는데 실패했습니다.');
      console.error('Failed to fetch settlements:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async (date: string) => {
    if (!window.confirm(`${date} 정산을 확정하시겠습니까?\n확정 후에는 취소할 수 없습니다.`)) {
      return;
    }

    const notes = prompt('정산 메모 (선택사항):');

    try {
      setIsLoading(true);
      await settlementApi.confirmSettlement(date, notes || undefined);
      alert('정산이 확정되었습니다.');
      await fetchSettlements();
    } catch (err: any) {
      alert(err.message || '정산 확정에 실패했습니다.');
      console.error('Failed to confirm settlement:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalRevenue = settlements.reduce((sum, s) => sum + s.totalRevenue, 0);
  const totalOrders = settlements.reduce((sum, s) => sum + s.totalOrders, 0);

  const selectedSettlement = selectedDate
    ? settlements.find(s => s.date === selectedDate)
    : null;

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
            <h1 className="text-3xl font-bold text-gray-900">정산 관리</h1>
            <p className="text-gray-600 mt-1">일별 정산 및 확정</p>
          </div>
          <button
            onClick={fetchSettlements}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={isLoading ? 'animate-spin' : ''} size={16} />
            <span className="text-sm">새로고침</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                시작 날짜
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C41E3A]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                종료 날짜
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C41E3A]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                확정 상태
              </label>
              <select
                value={filters.isConfirmed === undefined ? '' : filters.isConfirmed.toString()}
                onChange={(e) => setFilters({
                  ...filters,
                  isConfirmed: e.target.value === '' ? undefined : e.target.value === 'true'
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C41E3A]"
              >
                <option value="">전체</option>
                <option value="true">확정됨</option>
                <option value="false">미확정</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ startDate: '', endDate: '', isConfirmed: undefined })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                필터 초기화
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <p className="text-sm opacity-90 mb-2">총 매출</p>
            <p className="text-4xl font-bold">₩{totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
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

        {/* Settlements Table */}
        {!isLoading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">날짜</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">총 주문</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">총 매출</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">개인결제</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">셀결제</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">상태</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {settlements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      정산 데이터가 없습니다.
                    </td>
                  </tr>
                ) : (
                  settlements.map((settlement) => (
                    <tr
                      key={settlement.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedDate(settlement.date)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {formatDate(settlement.date)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{settlement.totalOrders}건</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-900">
                          ₩{settlement.totalRevenue.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {settlement.personalOrders}건 / ₩{settlement.personalRevenue.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {settlement.cellOrders}건 / ₩{settlement.cellRevenue.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {settlement.isConfirmed ? (
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center gap-1 w-fit">
                            <CheckCircle size={12} />
                            확정
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium w-fit">
                            미확정
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {!settlement.isConfirmed && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleConfirm(settlement.date);
                            }}
                            className="px-3 py-1 bg-[#C41E3A] text-white rounded hover:bg-[#A01830] transition-colors text-sm"
                          >
                            확정하기
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Detail Modal */}
        {selectedSettlement && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">정산 상세</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatDate(selectedSettlement.date)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-700">총 주문</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {selectedSettlement.totalOrders}건
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-700">총 매출</p>
                    <p className="text-2xl font-bold text-green-900">
                      ₩{selectedSettlement.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Payment Type Breakdown */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-3">결제 타입별 현황</h4>
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">개인 결제</span>
                        <span className="text-sm text-gray-600">
                          {selectedSettlement.personalOrders}건
                        </span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        ₩{selectedSettlement.personalRevenue.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">셀 결제</span>
                        <span className="text-sm text-gray-600">
                          {selectedSettlement.cellOrders}건
                        </span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        ₩{selectedSettlement.cellRevenue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Confirmation Info */}
                {selectedSettlement.isConfirmed && (
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle size={16} className="text-green-600" />
                      <span className="font-medium text-green-900">정산 확정됨</span>
                    </div>
                    {selectedSettlement.confirmedBy && (
                      <p className="text-sm text-green-700">
                        확정자: {selectedSettlement.confirmedBy.name}
                      </p>
                    )}
                    {selectedSettlement.confirmedAt && (
                      <p className="text-sm text-green-700">
                        확정일시: {formatDateTime(selectedSettlement.confirmedAt)}
                      </p>
                    )}
                    {selectedSettlement.notes && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-green-900">메모:</p>
                        <p className="text-sm text-green-700">{selectedSettlement.notes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                {!selectedSettlement.isConfirmed && (
                  <button
                    onClick={() => {
                      setSelectedDate(null);
                      handleConfirm(selectedSettlement.date);
                    }}
                    className="w-full py-3 bg-[#C41E3A] text-white rounded-lg hover:bg-[#A01830] transition-colors font-bold"
                  >
                    정산 확정하기
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
