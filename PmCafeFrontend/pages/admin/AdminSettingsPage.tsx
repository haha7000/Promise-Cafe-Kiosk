import React, { useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { Save, RefreshCw, AlertCircle } from 'lucide-react';

interface AdminSettingsPageProps {
  currentOrderNumber: number;
  onResetOrderNumber: () => void;
  onLogout?: () => void;
}

export const AdminSettingsPage: React.FC<AdminSettingsPageProps> = ({
  currentOrderNumber,
  onResetOrderNumber,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'payment' | 'orderNumber'>('basic');
  const [cafeName, setCafeName] = useState('P.M CAFE');
  const [welcomeMessage, setWelcomeMessage] = useState('오늘도 은혜로운 하루 되세요');
  const [autoResetTime, setAutoResetTime] = useState('10');
  const [maxQuantity, setMaxQuantity] = useState('10');

  const [bankName, setBankName] = useState('카카오뱅크');
  const [accountNumber, setAccountNumber] = useState('3333-12-3456789');
  const [accountHolder, setAccountHolder] = useState('P.M CAFE');

  const handleSave = () => {
    alert('설정이 저장되었습니다!');
  };

  const handleResetConfirm = () => {
    if (window.confirm('다음 주문 번호를 1번으로 초기화하시겠습니까?')) {
      onResetOrderNumber();
      alert('주문 번호가 초기화되었습니다. 다음 주문은 1번부터 시작합니다.');
    }
  };

  return (
    <AdminLayout onLogout={onLogout}>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">시스템 설정</h1>
          <p className="text-gray-600 mt-1">기본 설정 및 주문 번호 관리</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-6">
            {[
              { id: 'basic', label: '기본 설정' },
              { id: 'payment', label: '결제 설정' },
              { id: 'orderNumber', label: '번호 초기화' },
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

        {/* Basic Settings */}
        {activeTab === 'basic' && (
          <div className="max-w-2xl">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">🏪 카페 정보</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      카페명
                    </label>
                    <input
                      type="text"
                      value={cafeName}
                      onChange={(e) => setCafeName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C41E3A]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      환영 문구
                    </label>
                    <input
                      type="text"
                      value={welcomeMessage}
                      onChange={(e) => setWelcomeMessage(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C41E3A]"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">⏱️ 키오스크 설정</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      주문 완료 후 자동 리셋 시간 (초)
                    </label>
                    <input
                      type="number"
                      value={autoResetTime}
                      onChange={(e) => setAutoResetTime(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C41E3A]"
                      min="5"
                      max="30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      장바구니 최대 수량 (메뉴당)
                    </label>
                    <input
                      type="number"
                      value={maxQuantity}
                      onChange={(e) => setMaxQuantity(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C41E3A]"
                      min="1"
                      max="50"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSave}
                className="w-full py-3 bg-[#C41E3A] text-white rounded-lg hover:bg-[#A01830] transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Save size={20} />
                저장하기
              </button>
            </div>
          </div>
        )}

        {/* Payment Settings */}
        {activeTab === 'payment' && (
          <div className="max-w-2xl">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">💳 계좌 정보</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      은행명
                    </label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C41E3A]"
                    >
                      <option>카카오뱅크</option>
                      <option>토스뱅크</option>
                      <option>국민은행</option>
                      <option>신한은행</option>
                      <option>우리은행</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      계좌번호
                    </label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C41E3A]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      예금주
                    </label>
                    <input
                      type="text"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#C41E3A]"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">📱 QR 코드</h3>

                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-600 mb-4">QR 코드 이미지를 업로드하세요</p>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    📁 이미지 업로드
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    카카오페이, 토스 송금 QR
                  </p>
                </div>
              </div>

              <button
                onClick={handleSave}
                className="w-full py-3 bg-[#C41E3A] text-white rounded-lg hover:bg-[#A01830] transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Save size={20} />
                저장하기
              </button>
            </div>
          </div>
        )}

        {/* Order Number Reset */}
        {activeTab === 'orderNumber' && (
          <div className="max-w-2xl">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">🔢 주문 번호 설정</h3>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-900">
                    <strong>현재 다음 주문 번호:</strong> #{currentOrderNumber}
                  </p>
                  <p className="text-sm text-blue-800 mt-2">
                    번호 순환 범위: 1 ~ 12
                  </p>
                </div>

                <div className="space-y-3 text-sm text-gray-700">
                  <p className="flex items-start gap-2">
                    <span className="text-green-600">💡</span>
                    <span>12번 다음은 자동으로 1번으로 돌아갑니다.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-green-600">💡</span>
                    <span>매일 첫 주문은 자동으로 1번부터 시작합니다.</span>
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">⚠️ 수동 초기화</h3>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-900 mb-2">
                        다음 주문 번호를 강제로 1번으로 초기화합니다.
                      </p>
                      <p className="text-yellow-800">
                        <strong>사용 상황:</strong>
                      </p>
                      <ul className="list-disc list-inside text-yellow-800 mt-1 space-y-1">
                        <li>영업 시작 전 번호를 1번으로 맞추고 싶을 때</li>
                        <li>번호 순서가 꼬였을 때</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleResetConfirm}
                  className="w-full py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <RefreshCw size={20} />
                  번호 1번으로 초기화
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
