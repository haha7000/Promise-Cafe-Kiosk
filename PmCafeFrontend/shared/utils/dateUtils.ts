/**
 * 날짜/시간 포맷팅 유틸리티 함수
 */

/**
 * 시간만 포맷팅 (HH:MM)
 * @example formatTime(new Date()) // "14:30"
 */
export const formatTime = (date: Date): string => {
  return new Date(date).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * 날짜와 시간 포맷팅 (MM/DD HH:MM)
 * @example formatDateTime(new Date()) // "01/15 14:30"
 */
export const formatDateTime = (date: Date): string => {
  return new Date(date).toLocaleString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * 날짜 포맷팅 (YYYY-MM-DD)
 * @example formatDate(new Date()) // "2026-01-15"
 */
export const formatDate = (date: Date): string => {
  return new Date(date).toISOString().split('T')[0];
};

/**
 * 한국식 날짜 포맷팅 (YYYY년 MM월 DD일)
 * @example formatKoreanDate(new Date()) // "2026년 01월 15일 (수)"
 */
export const formatKoreanDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  });
};
