/**
 * 관리자 인증 Context
 * 관리자 로그인 상태 관리
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, type UserInfo } from '../api';

interface AuthContextType {
  isAdminLoggedIn: boolean;
  currentUser: UserInfo | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 초기 로드 시 토큰 검증
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const user = await authApi.verify();
          setCurrentUser(user);
          setIsAdminLoggedIn(true);
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('access_token');
        }
      }
      setIsLoading(false);
    };

    verifyToken();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await authApi.login({ username, password });

      // 토큰 저장
      localStorage.setItem('access_token', response.access_token);

      // 사용자 정보 설정
      setCurrentUser(response.user);
      setIsAdminLoggedIn(true);

      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setCurrentUser(null);
    setIsAdminLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isAdminLoggedIn, currentUser, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth Hook
 * 인증 관련 상태와 함수를 쉽게 사용하기 위한 커스텀 훅
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
