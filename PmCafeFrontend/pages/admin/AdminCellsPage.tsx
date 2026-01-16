import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { Plus, Search, Edit, CreditCard, X, History } from 'lucide-react';
import { CellInfo } from '../../types';
import { cellApi } from '../../shared/api/cells';

interface AdminCellsPageProps {
  onLogout?: () => void;
}

export const AdminCellsPage: React.FC<AdminCellsPageProps> = ({ onLogout }) => {
  const [cells, setCells] = useState<CellInfo[]>([]);
  const [selectedCell, setSelectedCell] = useState<CellInfo | null>(null);
  const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [chargeAmount, setChargeAmount] = useState('');
  const [bonusRate, setBonusRate] = useState('10');
  const [chargeMemo, setChargeMemo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalBalance = cells.reduce((sum, cell) => sum + cell.balance, 0);

  // 셀 목록 로드
  useEffect(() => {
    fetchCells();
  }, []);

  const fetchCells = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await cellApi.getCells();
      setCells(data);
    } catch (err: any) {
      setError(err.response?.data?.message || '셀 목록을 불러오는데 실패했습니다.');
      console.error('Failed to fetch cells:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCharge = async () => {
    if (!selectedCell || !chargeAmount) return;

    try {
      setIsLoading(true);
      setError(null);

      const result = await cellApi.chargeCell(selectedCell.id, {
        amount: parseInt(chargeAmount),
        bonusRate: parseInt(bonusRate),
        memo: chargeMemo || undefined,
      });

      // 셀 목록 갱신
      setCells(cells.map(c =>
        c.id === selectedCell.id
          ? { ...c, balance: result.balanceAfter }
          : c
      ));

      // 성공 알림
      alert(`✅ 충전 완료!\n충전액: ₩${result.chargeAmount.toLocaleString()}\n보너스: ₩${result.bonusAmount.toLocaleString()}\n총액: ₩${result.totalAmount.toLocaleString()}\n잔액: ₩${result.balanceAfter.toLocaleString()}`);

      // 모달 닫기
      setIsChargeModalOpen(false);
      setChargeAmount('');
      setBonusRate('10');
      setChargeMemo('');
      setSelectedCell(null);
    } catch (err: any) {
      setError(err.response?.data?.message || '포인트 충전에 실패했습니다.');
      alert('❌ 충전 실패: ' + (err.response?.data?.message || '알 수 없는 오류'));
    } finally {
      setIsLoading(false);
    }
  };

  const quickAmounts = [10000, 30000, 50000, 100000];

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

        {/* Loading */}
        {isLoading && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
            ⏳ 로딩 중...
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">셀 관리</h1>
            <p className="text-gray-600 mt-1">셀 등록, 포인트 충전 및 관리</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-[#C41E3A] text-white rounded-lg hover:bg-[#A01830] transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            새 셀 등록
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="셀명 또는 리더 검색..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C41E3A]"
            />
          </div>
        </div>

        {/* Total Balance */}
        <div className="bg-gradient-to-r from-[#C41E3A] to-[#A01830] rounded-xl p-6 mb-6 text-white">
          <p className="text-sm opacity-90 mb-2">전체 셀 잔액 합계</p>
          <p className="text-4xl font-bold">₩{totalBalance.toLocaleString()}</p>
        </div>

        {/* Cells Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">셀명</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">셀리더</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">연락처(뒷번호)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">잔액</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cells.map((cell, index) => (
                <tr key={cell.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{cell.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{cell.leader}</td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-600">
                    ****{cell.id.toString().padStart(4, '0')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-lg font-bold ${
                      cell.balance < 10000 ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      ₩{cell.balance.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedCell(cell);
                          setIsChargeModalOpen(true);
                        }}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-1 text-sm"
                      >
                        <CreditCard size={14} />
                        충전
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCell(cell);
                          setIsTransactionModalOpen(true);
                        }}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1 text-sm"
                      >
                        <History size={14} />
                        거래내역
                      </button>
                      <button className="px-3 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm">
                        <Edit size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Create Cell Modal */}
        {isCreateModalOpen && (
          <CreateCellModal
            onClose={() => setIsCreateModalOpen(false)}
            onSuccess={() => {
              fetchCells();
              setIsCreateModalOpen(false);
            }}
          />
        )}

        {/* Transaction History Modal */}
        {isTransactionModalOpen && selectedCell && (
          <TransactionHistoryModal
            cell={selectedCell}
            onClose={() => {
              setIsTransactionModalOpen(false);
              setSelectedCell(null);
            }}
          />
        )}

        {/* Charge Modal */}
        {isChargeModalOpen && selectedCell && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xl font-bold">포인트 충전</h3>
                <button
                  onClick={() => {
                    setIsChargeModalOpen(false);
                    setSelectedCell(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Cell Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">대상 셀</p>
                  <p className="font-bold text-lg">{selectedCell.name} ({selectedCell.leader})</p>
                  <p className="text-sm text-gray-600 mt-2">현재 잔액</p>
                  <p className="font-bold text-xl text-[#C41E3A]">₩{selectedCell.balance.toLocaleString()}</p>
                </div>

                {/* Charge Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    입금 금액 *
                  </label>
                  <input
                    type="number"
                    value={chargeAmount}
                    onChange={(e) => setChargeAmount(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C41E3A]"
                    placeholder="금액 입력"
                  />
                  <div className="flex gap-2 mt-2">
                    {quickAmounts.map(amount => (
                      <button
                        key={amount}
                        onClick={() => setChargeAmount(amount.toString())}
                        className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                      >
                        +{(amount / 10000).toFixed(0)}만
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bonus Rate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    보너스율 (%)
                  </label>
                  <input
                    type="number"
                    value={bonusRate}
                    onChange={(e) => setBonusRate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C41E3A]"
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    예: 10% 입력 시 10만원 → 11만원 충전
                  </p>
                </div>

                {/* Summary */}
                {chargeAmount && (
                  <div className="bg-blue-50 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700">입금액:</span>
                      <span className="font-medium">₩{parseInt(chargeAmount).toLocaleString()}</span>
                    </div>
                    {parseInt(bonusRate) > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-700">보너스({bonusRate}%):</span>
                        <span className="font-medium text-green-600">
                          +₩{Math.floor(parseInt(chargeAmount) * (parseInt(bonusRate) / 100)).toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-blue-200 pt-2 flex justify-between">
                      <span className="font-bold">실제 충전액:</span>
                      <span className="font-bold text-[#C41E3A]">
                        ₩{(parseInt(chargeAmount) + Math.floor(parseInt(chargeAmount) * (parseInt(bonusRate) / 100))).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">충전 후 잔액:</span>
                      <span className="font-bold">
                        ₩{(selectedCell.balance + parseInt(chargeAmount) + Math.floor(parseInt(chargeAmount) * (parseInt(bonusRate) / 100))).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Memo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    관리자 메모 (선택)
                  </label>
                  <textarea
                    value={chargeMemo}
                    onChange={(e) => setChargeMemo(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C41E3A]"
                    rows={2}
                    placeholder="예: 1월 정액권 입금"
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleCharge}
                  disabled={!chargeAmount || isLoading}
                  className={`w-full py-3 rounded-lg font-bold transition-colors ${
                    chargeAmount && !isLoading
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? '⏳ 처리 중...' : '💰 충전하기'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

// Create Cell Modal Component
interface CreateCellModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateCellModal: React.FC<CreateCellModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    leader: '',
    phoneLast4: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name || !formData.leader || !formData.phoneLast4) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    if (formData.phoneLast4.length !== 4 || !/^\d{4}$/.test(formData.phoneLast4)) {
      alert('휴대폰 뒷자리는 4자리 숫자여야 합니다.');
      return;
    }

    try {
      setIsSubmitting(true);
      await cellApi.createCell({
        name: formData.name,
        leader: formData.leader,
        phoneLast4: formData.phoneLast4,
      });
      alert('셀이 등록되었습니다.');
      onSuccess();
    } catch (error: any) {
      console.error('Failed to create cell:', error);
      alert(error.response?.data?.message || '셀 등록에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-xl font-bold">새 셀 등록</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              셀명 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C41E3A]"
              placeholder="청년1셀"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              셀리더 *
            </label>
            <input
              type="text"
              value={formData.leader}
              onChange={(e) => setFormData({ ...formData, leader: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C41E3A]"
              placeholder="김셀장"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              휴대폰 뒷자리 4자리 *
            </label>
            <input
              type="text"
              value={formData.phoneLast4}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                setFormData({ ...formData, phoneLast4: value });
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C41E3A]"
              placeholder="1234"
              maxLength={4}
            />
            <p className="text-xs text-gray-600 mt-1">
              셀 인증 시 사용됩니다
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-800">
            ℹ️ 초기 포인트 잔액은 0원입니다. 등록 후 포인트를 충전해주세요.
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#C41E3A] hover:bg-[#A01830]'
            } text-white font-bold`}
          >
            {isSubmitting ? '등록 중...' : '등록하기'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Transaction History Modal Component
interface TransactionHistoryModalProps {
  cell: CellInfo;
  onClose: () => void;
}

interface Transaction {
  id: number;
  type: 'CHARGE' | 'USE' | 'REFUND';
  amount: number;
  balanceAfter: number;
  memo?: string;
  createdAt: string;
  createdBy?: {
    id: number;
    name: string;
  };
  order?: {
    orderId: string;
    dailyNum: number;
  };
}

const TransactionHistoryModal: React.FC<TransactionHistoryModalProps> = ({ cell, onClose }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: '' as '' | 'CHARGE' | 'USE' | 'REFUND',
  });

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await cellApi.getTransactions(cell.id, {
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        type: filters.type || undefined,
      });
      setTransactions(data.transactions);
    } catch (err: any) {
      setError(err.message || '거래 내역을 불러오는데 실패했습니다.');
      console.error('Failed to fetch transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'CHARGE': return '충전';
      case 'USE': return '사용';
      case 'REFUND': return '환불';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'CHARGE': return 'text-green-600 bg-green-100';
      case 'USE': return 'text-red-600 bg-red-100';
      case 'REFUND': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">거래 내역</h3>
            <p className="text-sm text-gray-600 mt-1">
              {cell.name} ({cell.leader})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                거래 타입
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C41E3A]"
              >
                <option value="">전체</option>
                <option value="CHARGE">충전</option>
                <option value="USE">사용</option>
                <option value="REFUND">환불</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="text-center py-8 text-gray-600">
              ⏳ 로딩 중...
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              ❌ {error}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              거래 내역이 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((txn) => (
                <div
                  key={txn.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(txn.type)}`}>
                          {getTypeLabel(txn.type)}
                        </span>
                        <span className="text-sm text-gray-600">
                          {formatDate(txn.createdAt)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-2">
                        <div>
                          <p className="text-xs text-gray-600">금액</p>
                          <p className={`text-lg font-bold ${
                            txn.type === 'CHARGE' || txn.type === 'REFUND'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}>
                            {txn.type === 'USE' ? '-' : '+'}₩{Math.abs(txn.amount).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">거래 후 잔액</p>
                          <p className="text-lg font-bold text-gray-900">
                            ₩{txn.balanceAfter.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {txn.memo && (
                        <div className="mb-2">
                          <p className="text-xs text-gray-600">메모</p>
                          <p className="text-sm text-gray-900">{txn.memo}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        {txn.createdBy && (
                          <span>처리자: {txn.createdBy.name}</span>
                        )}
                        {txn.order && (
                          <span>주문번호: #{txn.order.dailyNum} ({txn.order.orderId})</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              총 {transactions.length}건의 거래
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
