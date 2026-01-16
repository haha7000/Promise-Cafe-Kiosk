import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
import { useAuth } from '../../shared/contexts/AuthContext';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const success = login(username, password);
    if (success) {
      navigate('/admin');
    } else {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-white tracking-wider mb-2">
            P.M CAFE
          </h1>
          <p className="text-[#B0B0B0]">관리자 로그인</p>
        </div>

        {/* Login Form */}
        <div className="bg-[#2D2D2D] rounded-2xl p-8 border border-[#3D3D3D]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-[#B0B0B0] mb-2">
                아이디
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B6B]" size={20} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-[#1A1A1A] border border-[#3D3D3D] rounded-lg text-white focus:outline-none focus:border-[#C41E3A] transition-colors"
                  placeholder="관리자 아이디"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[#B0B0B0] mb-2">
                비밀번호
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B6B]" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-[#1A1A1A] border border-[#3D3D3D] rounded-lg text-white focus:outline-none focus:border-[#C41E3A] transition-colors"
                  placeholder="비밀번호"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-[#C41E3A] to-[#A01830] text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
            >
              로그인
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-[#3D3D3D]">
            <p className="text-xs text-[#6B6B6B] text-center">
              데모 계정: admin / admin
            </p>
          </div>
        </div>

        {/* Back to Kiosk */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-[#6B6B6B] hover:text-[#B0B0B0] text-sm transition-colors"
          >
            ← 키오스크로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};
