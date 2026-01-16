import React, { useState, useEffect } from 'react';
import { CreditCard, Users, ChevronLeft, QrCode, Copy, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { PaymentMode, CellInfo, CartItem } from '../types';
import { cellApi } from '../shared/api';

// --- Home Screen ---
export const HomeView = ({ onSelectMode, onBaristaMode }: { onSelectMode: (mode: PaymentMode) => void, onBaristaMode?: () => void }) => {
  return (
    <div className="flex flex-col h-full bg-[#1A1A1A] p-6">
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-12">
        <div className="space-y-4">
          <h1 className="text-4xl font-serif font-bold text-white tracking-wider">P.M CAFE</h1>
          <p className="text-[#B0B0B0] text-lg">"오늘도 은혜로운 하루 되세요"</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          <button
            onClick={() => onSelectMode('PERSONAL')}
            className="group relative overflow-hidden bg-[#2D3A55] hover:bg-[#3B5998] p-8 rounded-2xl h-64 flex flex-col items-center justify-center gap-6 transition-all duration-300 shadow-xl hover:-translate-y-2 border border-[#3D4B66]"
          >
            <div className="p-6 bg-white/10 rounded-full group-hover:scale-110 transition-transform">
              <CreditCard size={48} className="text-blue-200" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">개인결제</h2>
              <p className="text-blue-200/80">계좌이체 / 현금</p>
            </div>
          </button>

          <button
            onClick={() => onSelectMode('CELL')}
            className="group relative overflow-hidden bg-[#552D2D] hover:bg-[#C41E3A] p-8 rounded-2xl h-64 flex flex-col items-center justify-center gap-6 transition-all duration-300 shadow-xl hover:-translate-y-2 border border-[#663D3D]"
          >
             <div className="p-6 bg-white/10 rounded-full group-hover:scale-110 transition-transform">
              <Users size={48} className="text-red-200" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">셀별결제</h2>
              <p className="text-red-200/80">포인트 차감</p>
            </div>
          </button>
        </div>
      </div>
      <div className="text-right flex gap-4 justify-end">
         {onBaristaMode && (
           <button
             onClick={onBaristaMode}
             className="text-[#3D3D3D] text-sm hover:text-[#C41E3A] transition-colors"
           >
             음료제조자 모드 →
           </button>
         )}
         <button className="text-[#3D3D3D] text-sm hover:text-[#6B6B6B]">관리자 모드 →</button>
      </div>
    </div>
  );
};

// --- Cell Auth Screen ---
export const CellAuthView = ({ onBack, onSuccess }: { onBack: () => void, onSuccess: (info: CellInfo) => void }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const handleNumClick = (num: string) => {
    if (input.length < 4) {
      setInput(prev => prev + num);
      setError('');
    }
  };

  const handleDelete = () => setInput(prev => prev.slice(0, -1));
  const handleClear = () => setInput('');

  const handleCheck = async () => {
    if (input.length !== 4) {
      setError('4자리 숫자를 입력해주세요.');
      return;
    }

    try {
      const cellInfo = await cellApi.authenticate({ phoneLast4: input });
      onSuccess(cellInfo);
    } catch (error) {
      setError('등록된 셀 정보가 없습니다.');
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1A1A1A]">
      <div className="p-6 border-b border-[#2D2D2D] flex items-center">
        <button onClick={onBack} className="p-2 -ml-2 text-white hover:bg-[#2D2D2D] rounded-full">
          <ChevronLeft size={32} />
        </button>
        <h1 className="ml-4 text-2xl font-bold">셀별결제 인증</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">셀리더 휴대폰 뒷번호 4자리</h2>
          <p className="text-[#B0B0B0]">번호를 입력해주세요</p>
        </div>

        <div className="flex gap-4 mb-4">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${
              input.length > i 
                ? 'border-[#C41E3A] bg-[#C41E3A] text-white' 
                : 'border-[#3D3D3D] bg-[#2D2D2D]'
            }`}>
              {input.length > i && <div className="w-3 h-3 bg-white rounded-full" />}
            </div>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-[#E74C3C] animate-shake">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => handleNumClick(num.toString())}
              className="h-20 bg-[#2D2D2D] rounded-xl text-3xl font-bold hover:bg-[#3D3D3D] active:scale-95 transition-all"
            >
              {num}
            </button>
          ))}
          <button onClick={handleClear} className="h-20 bg-[#3D3D3D] rounded-xl text-lg font-medium hover:bg-[#4D4D4D] text-[#B0B0B0]">전체삭제</button>
          <button onClick={() => handleNumClick('0')} className="h-20 bg-[#2D2D2D] rounded-xl text-3xl font-bold hover:bg-[#3D3D3D] active:scale-95 transition-all">0</button>
          <button onClick={handleDelete} className="h-20 bg-[#3D3D3D] rounded-xl text-lg font-medium hover:bg-[#4D4D4D] text-[#B0B0B0]">⌫</button>
        </div>

        <button 
          onClick={handleCheck}
          disabled={input.length !== 4}
          className={`w-full max-w-sm py-5 rounded-xl text-xl font-bold transition-all ${
            input.length === 4 
              ? 'bg-[#C41E3A] text-white shadow-lg shadow-red-900/40 hover:bg-[#A01830]' 
              : 'bg-[#2D2D2D] text-[#6B6B6B] cursor-not-allowed'
          }`}
        >
          확인하기
        </button>
      </div>
    </div>
  );
};

// --- QR / Personal Payment Screen ---
export const PaymentQRView = ({ totalAmount, onComplete, onBack }: { totalAmount: number, onComplete: () => void, onBack: () => void }) => {
  return (
    <div className="flex flex-col h-full bg-[#1A1A1A]">
      <div className="p-6 border-b border-[#2D2D2D] flex items-center">
         <button onClick={onBack} className="p-2 -ml-2 text-white hover:bg-[#2D2D2D] rounded-full">
          <ChevronLeft size={32} />
        </button>
        <h1 className="ml-4 text-2xl font-bold">결제하기</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center gap-8">
        <div className="w-full max-w-md bg-[#2D2D2D] p-8 rounded-2xl border border-[#3D3D3D] text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[#B0B0B0]">총 결제금액</h2>
            <p className="text-4xl font-bold text-white">₩ {totalAmount.toLocaleString()}</p>
          </div>
          
          <div className="w-full aspect-square bg-white p-4 rounded-xl flex items-center justify-center">
             <QrCode size={200} className="text-black" />
          </div>
          <p className="text-[#B0B0B0]">카카오페이 / 토스로 스캔해주세요</p>
        </div>

        <div className="flex items-center gap-4 w-full max-w-md text-[#B0B0B0] text-sm before:flex-1 before:h-px before:bg-[#3D3D3D] after:flex-1 after:h-px after:bg-[#3D3D3D]">
          또는 계좌이체
        </div>

        <div className="w-full max-w-md bg-[#2D2D2D] p-6 rounded-xl border border-[#3D3D3D] flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="text-[#B0B0B0]">카카오뱅크</span>
            <span className="font-mono font-bold text-lg">3333-12-3456789</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#B0B0B0]">예금주</span>
            <span className="font-bold">P.M CAFE</span>
          </div>
          <button className="w-full py-3 mt-2 border border-[#3D3D3D] rounded-lg hover:bg-[#3D3D3D] flex items-center justify-center gap-2 transition-colors">
            <Copy size={16} /> 계좌번호 복사
          </button>
        </div>
      </div>

      <div className="p-6 bg-[#2D2D2D] border-t border-[#3D3D3D]">
        <button 
          onClick={onComplete}
          className="w-full py-5 rounded-xl bg-[#C41E3A] text-white font-bold text-xl hover:bg-[#A01830] transition-colors shadow-lg shadow-red-900/30 flex items-center justify-center gap-2"
        >
          <Check size={24} />
          입금 완료했어요
        </button>
      </div>
    </div>
  );
};

// --- Order Complete Screen ---
export const OrderCompleteView = ({ orderNumber, onReset }: { orderNumber: number, onReset: () => void }) => {
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onReset();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onReset]);

  return (
    <div className="flex flex-col h-full items-center justify-center bg-[#1A1A1A] p-8 text-center space-y-12">
      <div className="space-y-6 animate-fade-in-up">
        <div className="w-20 h-20 bg-[#2ECC71] rounded-full flex items-center justify-center mx-auto mb-6">
          <Check size={40} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold">주문이 완료되었습니다!</h1>
        <p className="text-[#B0B0B0] text-lg">주문번호를 확인해주세요</p>
      </div>

      <div className="relative animate-bounce-slow">
        <div className="w-48 h-48 bg-[#C41E3A] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(196,30,58,0.4)]">
          <span className="text-8xl font-black text-white">{orderNumber}</span>
        </div>
      </div>

      <div className="space-y-8 w-full max-w-md">
        <div className="bg-[#2D2D2D] p-6 rounded-xl border border-[#3D3D3D]">
          <p className="text-[#B0B0B0]">번호가 호출되면 픽업대에서<br/>음료를 수령해주세요.</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={onReset}
            className="w-full py-4 rounded-xl border border-[#3D3D3D] hover:bg-[#2D2D2D] text-lg font-bold transition-colors"
          >
            확인 (메인으로)
          </button>
          
          <div className="w-full bg-[#2D2D2D] h-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#B0B0B0] transition-all duration-1000 ease-linear"
              style={{ width: `${(timeLeft / 10) * 100}%` }}
            />
          </div>
          <p className="text-xs text-[#6B6B6B]">{timeLeft}초 후 자동으로 이동합니다</p>
        </div>
      </div>
    </div>
  );
};